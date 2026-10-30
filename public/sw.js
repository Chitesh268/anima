const CACHE = 'arise-react-player-system-v3';
const OBSOLETE_APP_CACHES = new Set([
  'arise-player-system-v9-crt-close-streak',
  'arise-player-system-v10-awakened-frame-fx',
]);
const FILES = [
  './',
  './index.html',
  './legacy.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './logo-arise.jpg',
  './alert.mp3',
  './quest.mp3',
  './open.mp3',
];

async function cacheAppShell() {
  const cache = await caches.open(CACHE);
  await cache.addAll(FILES);

  // Vite hashes the production bundle names, so read the built index and cache its JS/CSS.
  const indexUrl = new URL('./index.html', self.registration.scope);
  const response = await fetch(indexUrl);
  if (!response.ok) throw new Error('Could not precache the application shell');
  const html = await response.text();
  const assets = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))(?:\?[^"']*)?["']/gi)]
    .map((match) => new URL(match[1], self.registration.scope).href);
  if (assets.length) await cache.addAll([...new Set(assets)]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => OBSOLETE_APP_CACHES.has(key)).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || !response.ok) return response;
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if ('focus' in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow('./');
  }));
});
