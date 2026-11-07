/* Only this public offline page is cached. No accounts, API data or academic pages. */
const FALLBACK_CACHE = "itsm-public-fallback-v1";
self.addEventListener("install", event => {
  event.waitUntil(caches.open(FALLBACK_CACHE).then(cache => cache.addAll(["/offline.html", "/icon.svg"])));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("itsm-public-fallback-") && key !== FALLBACK_CACHE).map(key => caches.delete(key)))));
});
self.addEventListener("fetch", event => {
  const request = event.request; const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || request.mode !== "navigate") return;
  event.respondWith(fetch(request).catch(() => caches.open(FALLBACK_CACHE).then(cache => cache.match("/offline.html"))));
});
