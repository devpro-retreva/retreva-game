/* Retreva offline support: precaches the whole build on first visit, then serves it cache-first.
   The page registers this file as sw.js?v=<build id>, so every build gets its own cache. */
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE = `retreva-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      let files = [];
      try {
        const res = await fetch('./precache.json', { cache: 'no-store' });
        files = (await res.json()).files || [];
      } catch {
        /* dev or missing list: cache as we go */
      }
      const urls = ['./', './index.html', './manifest.webmanifest', ...files.map((f) => `./${f}`)];
      // add one by one so a single failure doesn't abort the whole install
      await Promise.all(urls.map((u) => cache.add(new Request(u, { cache: 'reload' })).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('retreva-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // pages: try the network for updates, fall back to the cached app shell offline
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => undefined);
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('./index.html')) || Response.error()),
    );
    return;
  }
  // hashed assets, fonts, icons: cache-first
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => undefined);
          }
          return res;
        }),
    ),
  );
});
