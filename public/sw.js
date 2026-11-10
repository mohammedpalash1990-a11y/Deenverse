const CACHE_NAME = "deenverse-shell-v1";
const APP_SHELL = "/";

async function cacheSuccessfulResponse(request, response) {
  if (response.ok) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    } catch {
      // Storage failure must not prevent the online response from being served.
    }
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([APP_SHELL, "/manifest.webmanifest", "/icon.svg"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never cache API responses or user/content data.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate" && url.pathname === "/") {
    event.respondWith(
      fetch(request)
        .then((response) => cacheSuccessfulResponse(APP_SHELL, response))
        .catch(async () => (await caches.match(APP_SHELL)) || Response.error())
    );
    return;
  }

  // Only immutable build assets and the public app manifest/icon use cache-first.
  const isBuildAsset = url.pathname.startsWith("/_next/static/");
  const isAppMetadata = url.pathname === "/manifest.webmanifest" || url.pathname === "/icon.svg";
  if (isBuildAsset || isAppMetadata) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => cacheSuccessfulResponse(request, response)))
    );
  }
});
