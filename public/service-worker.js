/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

// "editor-app-v1" and "editor-translations-v1" are replaced with the package version at build time (see webpack.config.js)
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
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_CACHE && key !== TRANSLATIONS_CACHE && key !== PYODIDE_CACHE)
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }),
      ),
    ),
  );
  self.clients.claim();
});

// Pyodide needs SharedArrayBuffer which requires the page to be cross-origin isolated. That means serving COOP + COEP on the HTML response, and CORP on every cross-origin resource the page loads
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

function broadcastOffline() {
  self.clients
    .matchAll()
    .then((clients) => clients.forEach((c) => c.postMessage({ type: "OFFLINE" })));
}

// Network-first: try the network, update the cache, fall back to cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, addSecurityHeaders(networkResponse.clone()));
    }
    return addSecurityHeaders(networkResponse);
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      broadcastOffline();
      return addSecurityHeaders(cached);
    }
    return Response.error();
  }
}

// Cache-first: serve from cache when available, populate cache on first fetch
// importScripts produces opaque responses we can't modify, so we re-fetch as cors
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

  // Pyodide CDN assets are cache-first since URLs are version-pinned
  if (
    url.hostname === "cdn.jsdelivr.net" &&
    url.pathname.includes("/pyodide/")
  ) {
    event.respondWith(cacheFirst(event.request, PYODIDE_CACHE));
    return;
  }

  // Translation files get their own cache so they can be evicted independently of the app shell
  if (url.origin === self.location.origin && url.pathname.includes("/translations/")) {
    event.respondWith(networkFirst(event.request, TRANSLATIONS_CACHE));
    return;
  }

  // Same-origin app assets are network-first so users get fresh content online
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(event.request, APP_CACHE));
  }
});
