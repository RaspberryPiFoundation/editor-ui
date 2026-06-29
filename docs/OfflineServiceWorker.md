# Offline service worker example

The editor-ui web component supports an offline indicator via the `offline_enabled` attribute. The offline UI is driven by `OFFLINE` / `ONLINE` messages broadcast from the host page's (ie. editor-standalone) service worker to all controlled clients - see the [Offline support section of the README](../README.md#offline-support) for the full integration contract.

This document describes a service worker that could be bundled with editor-ui itself (rather than relying on the host app / editor-standalone). It is a working reference for any host wanting to implement the required messaging contract from scratch.

## What the service worker must do

For the editor-ui offline indicator to work, the controlling service worker must:

1. Broadcast `{ type: "OFFLINE" }` to all clients when a network-first fetch falls back to cache (ie. the network is unreachable)
2. Broadcast `{ type: "ONLINE" }` to all clients when a network-first fetch succeeds after a period of serving from cache (i.e. the network has recovered)
3. Handle a `{ type: "CHECK_ONLINE" }` message from the client by probing the network and broadcasting `ONLINE` if the probe succeeds. This is used by `useIsOnline` to poll for recovery while offline, since no fetch may happen naturally

## Example service worker

The implementation below could be shipped as `public/service-worker.js` in editor-ui. It caches the editor shell and Pyodide assets and implements the messaging contract above.

> **Note:** Cache version strings (`editor-app-v1`, `editor-translations-v1`) would usually be replaced, by the host app, with the package version at build time. If you adopt this SW you will need to wire up equivalent Vite-time versioning, or replace them with a fixed string and manage cache invalidation another way.

```js
/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

// "editor-app-v1" and "editor-translations-v1" are replaced with the package version at build time
const APP_CACHE = "editor-app-v1";
const TRANSLATIONS_CACHE = "editor-translations-v1";
const PYODIDE_CACHE = "pyodide-v0.26.2";

// Minimal set of assets to pre-cache on install
// All other assets (chunks, translations, etc.) are cached dynamically on first use via the network-first fetch handler below
const APP_SHELL = [
  "./web-component.html",
  "./web-component.js",
  "./PyodideWorker.js",
  "./manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .open(APP_CACHE)
        .then((cache) =>
          cache
            .addAll(APP_SHELL)
            .catch((err) =>
              console.warn(
                "[SW] Pre-cache failed, will rely on dynamic caching:",
                err,
              ),
            ),
        ),
      caches
        .open(TRANSLATIONS_CACHE)
        .then((cache) =>
          cache
            .addAll(["./translations/en.json"])
            .catch((err) =>
              console.warn(
                "[SW] Translation pre-cache failed, will rely on dynamic caching:",
                err,
              ),
            ),
        ),
    ]),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key !== APP_CACHE &&
              key !== TRANSLATIONS_CACHE &&
              key !== PYODIDE_CACHE,
          )
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }),
      ),
    ),
  );
  self.clients.claim();
});

// Pyodide needs SharedArrayBuffer, which requires cross-origin isolation (COOP + COEP on the HTML response, CORP on every cross-origin resource)
// We re-apply those headers when caching responses so they are preserved when served from cache offline.
function addSecurityHeaders(response) {
  if (response.type === "opaque") return response;
  const headers = new Headers(response.headers);
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Tracks whether any network-first request has fallen back to cache, so we know to broadcast ONLINE when the network becomes reachable again.
let servingFromCache = false;

self.addEventListener("online", () => {
  servingFromCache = false;
  broadcast("ONLINE");
});

// Handle CHECK_ONLINE from the client (sent by useIsOnline while offline).
// SW-initiated fetches bypass the SW's own fetch handler, so this hits the network directly without being served from cache
self.addEventListener("message", (event) => {
  if (event.data?.type !== "CHECK_ONLINE") return;
  fetch("./manifest.json", { cache: "no-store" })
    .then(() => {
      servingFromCache = false;
      broadcast("ONLINE");
    })
    .catch(() => {});
});

function broadcast(type) {
  self.clients
    .matchAll()
    .then((clients) => clients.forEach((c) => c.postMessage({ type })));
}

// Network-first: try the network, update the cache, fall back to cache.
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, addSecurityHeaders(networkResponse.clone()));
      if (servingFromCache) {
        servingFromCache = false;
        broadcast("ONLINE");
      }
    }
    return addSecurityHeaders(networkResponse);
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      servingFromCache = true;
      broadcast("OFFLINE");
      return addSecurityHeaders(cached);
    }
    return Response.error();
  }
}

// Cache-first: serve from cache when available, populate on first fetch.
// importScripts produces opaque responses we can't modify, so we re-fetch as cors to get a modifiable response we can store with security headers
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request.url);
  if (cached) return cached;

  const corsRequest = new Request(request.url, {
    mode: "cors",
    credentials: "omit",
  });
  const networkResponse = await fetch(corsRequest);
  cache.put(request.url, addSecurityHeaders(networkResponse.clone()));
  return addSecurityHeaders(networkResponse);
}

self.addEventListener("fetch", (event) => {
  // Chrome bug: skip only-if-cached requests for cross-origin resources
  if (
    event.request.cache === "only-if-cached" &&
    event.request.mode !== "same-origin"
  ) {
    return;
  }

  const url = new URL(event.request.url);

  // Pyodide CDN assets are cache-first since their URLs are version-pinned
  if (
    url.hostname === "cdn.jsdelivr.net" &&
    url.pathname.includes("/pyodide/")
  ) {
    event.respondWith(cacheFirst(event.request, PYODIDE_CACHE));
    return;
  }

  // Translation files get their own cache so they can be evicted independently of the app shell
  if (
    url.origin === self.location.origin &&
    url.pathname.includes("/translations/")
  ) {
    event.respondWith(networkFirst(event.request, TRANSLATIONS_CACHE));
    return;
  }

  // Same-origin app assets are network-first so users get fresh content online
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(event.request, APP_CACHE));
  }
});
```
