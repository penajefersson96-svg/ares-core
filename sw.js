// sw.js v3.0 — Service Worker profesional con App Shell y Network-Only para APIs
const CACHE_VERSION = 'ares-v3';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './manifest.webmanifest',
  './cerebro.js',
  './memoria.js',
  './voz.js',
  './panel.js',
  './orbe.js',
  './boveda.js',
  './comandos.js',
  './sonidos.js'
];

// INSTALAR: Precargar el núcleo de la app
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
    .then((cache) => cache.addAll(APP_SHELL))
    .then(() => self.skipWaiting())
  );
});

// ACTIVAR: Limpiar cachés viejos de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres.map((nombre) => {
          if (nombre !== CACHE_VERSION) {
            console.log('[SW] Borrando caché vieja:', nombre);
            return caches.delete(nombre);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: Estrategia mixta
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // 1. Ignorar peticiones que no sean GET
  if (request.method !== 'GET') return;
  
  // 2. NUNCA cachear peticiones a la API (respuestas de IA, voz, GitHub)
  if (request.url.includes('workers.dev') || request.url.includes('api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Fallback si la nube cae por completo
        return new Response(JSON.stringify({ respuesta: 'Modo offline: mi mente en la nube no responde, señor.' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  
  // 3. Para assets locales (HTML, JS, CSS): Stale-While-Revalidate
  // Sirve lo cacheado rápido, pero actualiza en segundo plano para la próxima visita
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse); // Si falla la red, usa el caché sí o sí
      
      return cachedResponse || fetchPromise;
    })
  );
});