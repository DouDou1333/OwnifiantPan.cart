// sw.js - Version corrigée, complète et stable pour ta PWA

const CACHE_NAME = 'samsung-tool-cache-v3';  // Change le numéro si tu modifies plus tard

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/script.js',               // ← change en 'app.js' ou le vrai nom de ton fichier JS si différent
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'             // ← la nouvelle page offline
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Installation - Cache des assets');
        return cache.addAll(ASSETS);
      })
      .catch(err => console.error('[SW] Erreur lors du cache install:', err))
  );
  self.skipWaiting();  // Active immédiatement le nouveau SW
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      console.log('[SW] Anciens caches nettoyés');
      return self.clients.claim();  // Prend le contrôle des onglets ouverts
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).catch(() => {
          // Fallback uniquement pour les pages (navigation)
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          // Pour les autres ressources (images, js, css...) → erreur silencieuse
          return new Response('', { status: 503 });
        });
      })
  );
});