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

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // if (!response.url.includes("/some/page/that/hosts/the/editor")) { return; }

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
});
