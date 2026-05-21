const CACHE_NAME = 'ai-search-lab-cache-v2';
const RUNTIME_CACHE_NAME = 'ai-search-lab-runtime-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.svg',
  '/icon-512.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap'
];

// INSTALL EVENT: Pre-cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching core app shell assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE EVENT: Clean up old versions of caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[Service Worker] Purging legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH EVENT: Handle offline routing and resource serving
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip browser extension schemas (e.g. chrome-extension://)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://fonts.')) {
    return;
  }

  const url = new URL(event.request.url);

  // Network-First with Cache Fallback for root html pages (ensures fresh copy but provides extreme offline resilience)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response and save it to the cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If offline, serve the cached index.html
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // Cache-First with Network Fallback & Runtime Cache for build assets, fonts, icons
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately, but perform a background fetch to update the runtime cache in the background (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(RUNTIME_CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => { /* Silent ignore fetch error if completely offline */ });

        return cachedResponse;
      }

      // If it's not cached yet, fetch from network and add to dynamic runtime cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(RUNTIME_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch((err) => {
          console.log('[Service Worker] Failed to fetch and no cache entry available:', err);
          // Standard placeholder fallback if image requests fail offline
          if (event.request.destination === 'image') {
            return caches.match('/icon-192.svg');
          }
        });
    })
  );
});
