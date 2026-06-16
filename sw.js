const CACHE_NAME = 'asan-v1';
const ASSETS = ['./index.html','./icon-192.png','./icon-512.png','./manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
