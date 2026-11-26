/* eslint-disable no-restricted-globals */
const CACHE_NAME = "shoplink-v2";
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
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  const isDevelopmentAsset = /^\/(?:src|node_modules|@vite|@id|@fs)(?:\/|$)|^\/@react-refresh(?:\/|$)/.test(url.pathname);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || isDevelopmentAsset) {
    return;
  }

  const isNavigation = request.mode === 'navigate'
    || url.pathname === '/index.html'
    || url.pathname === '/service-worker.js';

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      if (!isNavigation && cached) return cached;

      try {
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') {
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const appShell = await cache.match('/index.html');
          if (appShell) return appShell;
        }
        throw error;
      }
    })()
  );
});
