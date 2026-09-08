// sw.js — Mayordomo de actualizaciones (cache inteligente)
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const copia = r.clone();
      caches.open('ares-v1').then((c) => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request))
  );
});