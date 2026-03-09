// sw.js - Version clean et fonctionnelle pour ton tool Samsung WebUSB

const CACHE_NAME = 'samsung-tool-cache-v2';  // Change le v2 si tu updates

const ASSETS = [
  '/',                    // Racine
  '/index.html',
  '/manifest.json',
  '/script.js',           // Remplace par le vrai nom de ton fichier JS principal (app.js ? main.js ?)
  // Ajoute tes autres fichiers si tu en as : CSS, images, etc.
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // Si tu as une page offline.html : '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache installé');
        return cache.addAll(ASSETS);
      })
      .catch(err => console.error('[SW] Erreur install cache:', err))
  );
  // Skip waiting pour activer immédiatement le nouveau SW
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      console.log('[SW] Anciens caches supprimés');
      return self.clients.claim();  // Prend le contrôle immédiatement
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si dans le cache → renvoie direct
        if (response) {
          return response;
        }
        // Sinon fetch réseau + fallback si échec (offline)
        return fetch(event.request).catch(() => {
          // Optionnel : renvoie la page principale ou une page offline dédiée
          return caches.match('/');
          // Ou si tu crées offline.html : caches.match('/offline.html');
        });
      })
  );
});