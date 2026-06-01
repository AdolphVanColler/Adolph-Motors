/* Adolph Motors — Service Worker */
const CACHE  = 'adolph-motors-v1';
const STATIC = ['/css/main.css', '/js/main.js', '/manifest.json'];

self.addEventListener('install',  e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return; // never cache API
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
