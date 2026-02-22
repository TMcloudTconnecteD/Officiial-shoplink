/* eslint-disable no-restricted-globals */
const CACHE_NAME = "shoplink-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  // note: icons will be cached automatically when referenced by manifest
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // don't cache API POST or other non-static endpoints
  if (url.pathname.startsWith('/api/')) {
    // let network handle it normally
    return;
  }

  // cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          // only cache same-origin resources
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // fallback to index.html for navigation requests (SPA routing)
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
