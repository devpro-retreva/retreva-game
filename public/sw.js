/* Retreva offline support: precaches the base game on first visit, then serves it cache-first.
   The page registers this file as sw.js?v=<build id>, so every build gets its own cache.
   City packs (listed in packs.json) are not precached: they're served from their own cache
   (retreva-city-<id>, filled by Settings → Cities) or the network, and never copied into the main
   cache — so removing a city really removes it. City caches survive game updates; the game marks
   them "Update available" when the files changed. */
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
      await Promise.all(keys.filter((k) => k.startsWith('retreva-') && !k.startsWith('retreva-city-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

let cityFiles = null;
async function getCityFiles() {
  if (cityFiles) return cityFiles;
  try {
    const res = (await caches.match(new URL('./packs.json', self.registration.scope).href)) || (await fetch('./packs.json'));
    const m = await res.json();
    cityFiles = new Set(Object.values(m.cities || {}).flatMap((c) => c.files.map((f) => new URL(f.path, self.registration.scope).href)));
  } catch {
    return new Set(); // try again on the next request
  }
  return cityFiles;
}

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
  // hashed assets, fonts, icons: cache-first; city pack files: their own cache or the network, not copied
  event.respondWith(
    getCityFiles().then((cities) =>
      cities.has(req.url.split('?')[0])
        ? // installed copy first; otherwise the network, never the browser's HTTP cache — so a city is
          // offline exactly when it's installed (and Remove really removes it)
          (req.cache === 'reload' ? Promise.resolve(undefined) : caches.match(req, { ignoreSearch: true })).then((hit) => hit || fetch(req.url, { cache: 'no-store', credentials: 'same-origin' }))
        : caches.match(req).then(
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
    ),
  );
});
