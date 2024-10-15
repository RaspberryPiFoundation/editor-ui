self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (
    event.request.cache === "only-if-cached" &&
    event.request.mode !== "same-origin"
  ) {
    return;
  }

  console.log(event.request);

  const interceptedRequests = ["pyodide"];

  if (interceptedRequests.some((str) => event.request.url.includes(str))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          console.log(`Intercepted: ${event.request.url}`);

          const body = response.body;
          const status = response.status;
          const headers = new Headers(response.headers);
          const statusText = response.statusText;

          headers.set("Cross-Origin-Embedder-Policy", "require-corp");
          headers.set("Cross-Origin-Opener-Policy", "same-origin");

          return new Response(body, { status, statusText, headers });
        })
        .catch(console.error),
    );
  }
});
