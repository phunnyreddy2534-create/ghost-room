self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("ira-cache-v1").then(cache =>
      cache.addAll([
        "/",
        "/index.html",
        "/room.html",
        "/style.css",
        "/manifest.json",
        "/icons/icon-192.png",
        "/icons/icon-512.png"
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
