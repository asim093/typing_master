// Caches character .glb files (local or CDN) permanently after their first
// successful fetch — every navigation and every re-entry into battle after
// that hits this cache instead of the network, so a model only ever "loads
// slowly" once per browser. Bump CACHE_NAME if a model file is ever replaced
// under the same URL and needs to bust old cached copies.
//
// Note: a service worker never controls the very first page load that
// installs it (a standard browser limitation) — the first visit to the site
// always fetches over the network. From the second visit/reload onward,
// every model request is served from this cache instead.
const CACHE_NAME = 'typequest-models-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (!url.endsWith('.glb')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) {
        cache.put(event.request, response.clone());
      }
      return response;
    }),
  );
});
