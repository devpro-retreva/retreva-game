// City packs playtest: Accra is a separate pack (not in the base download), listed with its size;
// Download (hash-checked) → "On this device" → Check files; a damaged file is caught and fixed by
// downloading again; Remove asks first, frees it and leaves the save alone; offline, a game saved in
// Accra opens when Accra is installed and is refused with a clear message when it isn't.
// (The save is moved to Accra directly rather than by flying — the travel suite covers flights.)
import { launch, outDir } from './lib.mjs';
import { serveDist } from './static-server.mjs';
// its own server, so "offline" can be real: the server is stopped (setOffline doesn't stop the service worker)
const srv = await serveDist();
const BASE_URL = `${srv.url}?clock=paused`;
const OUT = outDir('cities');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
const requested = [];
p.on('request', (r) => requested.push(r.url()));
const S = (fn, a) => p.evaluate(fn, a);
const state = (id) => p.getAttribute(`.city-row[data-city="${id}"]`, 'data-state');
const settings = async () => {
  await S(() => window.__retreva.store.getState().openPhone('settings'));
  await p.waitForSelector('.city-row[data-city="accra"]:not([data-state="checking"])');
};

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => navigator.serviceWorker.ready);
await p.reload(); // under the worker's control
await p.waitForSelector('.wordmark');
const manifest = await S(() => fetch('./packs.json').then((r) => r.json()));
const accraFile = manifest.cities.accra.files[0].path;
const precache = await S(() => fetch('./precache.json').then((r) => r.json()));
log('Accra is its own pack, listed with size and checksum, and not part of the base download', manifest.cities.accra.bytes > 1000 && /^[0-9a-f]{64}$/.test(manifest.cities.accra.files[0].sha256) && !precache.files.includes(accraFile), `${accraFile} · ${manifest.cities.accra.bytes} bytes`);

await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Esi');
await p.click('text=Start my life');
await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
log('starting in Lagos does not download Accra', !requested.some((u) => u.includes('accraPack')));

await settings();
log('Settings lists Lagos (built in) and Accra (not downloaded, with its size)', (await state('lagos')) === 'built-in' && (await state('accra')) === 'not-installed' && /KB/.test(await p.textContent('.city-row[data-city="accra"]')));
await p.locator('[data-cities]').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${OUT}/cities-before.png` });
await p.click('.city-row[data-city="accra"] button[data-act="install"]');
await p.waitForSelector('.city-row[data-city="accra"][data-state="installed"]', { timeout: 30000 });
log('Download: Accra is on this device, checked', /checked/.test(await p.textContent('.city-row[data-city="accra"] [data-msg]')));
const cacheOk = await S(async (f) => (await caches.has('retreva-city-accra')) && !!(await (await caches.open('retreva-city-accra')).match(new URL(f, document.baseURI).href)), accraFile);
log('its files sit in their own cache', cacheOk);
await p.click('.city-row[data-city="accra"] button[data-act="verify"]');
await p.waitForFunction(() => /nothing is missing/.test(document.querySelector('.city-row[data-city="accra"] [data-msg]')?.textContent ?? ''), null, { timeout: 15000 });
log('Check files: all good', true);
await p.screenshot({ path: `${OUT}/cities-installed.png` });

// damage the stored file: the check catches it; downloading again fixes it
await S(async (f) => { const c = await caches.open('retreva-city-accra'); await c.put(new URL(f, document.baseURI).href, new Response('broken', { headers: { 'content-type': 'text/javascript' } })); }, accraFile);
await p.click('.city-row[data-city="accra"] button[data-act="verify"]');
await p.waitForFunction(() => /1 file is missing/.test(document.querySelector('.city-row[data-city="accra"] [data-msg]')?.textContent ?? ''), null, { timeout: 15000 }).catch(() => {});
log('a damaged file is caught by Check files', /1 file is missing or damaged/.test(await p.textContent('.city-row[data-city="accra"] [data-msg]')));
await S(async () => { const c = await caches.open('retreva-city-accra'); const keys = await c.keys(); for (const k of keys) if (k.url.includes('meta')) await c.delete(k); });
await S(() => window.__retreva.store.getState().closePanel());
await settings();
await p.click('.city-row[data-city="accra"] button[data-act="install"]');
await p.waitForSelector('.city-row[data-city="accra"][data-state="installed"]', { timeout: 30000 });
await p.click('.city-row[data-city="accra"] button[data-act="verify"]');
await p.waitForFunction(() => /nothing is missing/.test(document.querySelector('.city-row[data-city="accra"] [data-msg]')?.textContent ?? ''), null, { timeout: 15000 }).catch(() => {});
log('downloading again repairs it', /nothing is missing/.test(await p.textContent('.city-row[data-city="accra"] [data-msg]')));

// move this game to Accra (test setup), save, then go offline
await S(() => window.__retreva.cities.loadCity('accra'));
await S(() => window.__retreva.store.getState().closePanel());
const bal0 = await S(() => window.__retreva.store.getState().wallet.balance);
await S(() => { const g = window.__retreva.store; const w = g.getState().world; g.setState({ destinationId: 'accra-osu', world: { ...w, visited: [...w.visited, 'accra-osu'] }, phase: 'loading' }); window.__retreva.runtime.player.x = -3.8; window.__retreva.runtime.player.z = 30; });
await p.waitForFunction(() => window.__retreva.store.getState().phase === 'playing', null, { timeout: 60000 });
await S(() => window.__retreva.saves.saveNow());
await srv.stop();
await p.reload();
await p.waitForSelector('.wordmark', { timeout: 30000 });
await p.click('text=Continue');
await p.waitForFunction(() => window.__retreva.store.getState().phase === 'playing', null, { timeout: 60000 }).catch(() => {});
let s = await S(() => ({ dest: window.__retreva.store.getState().destinationId, phase: window.__retreva.store.getState().phase }));
log('offline, with Accra installed, a game saved in Osu opens in Osu', s.dest === 'accra-osu' && s.phase === 'playing', JSON.stringify(s));
await sleep(1500);
await p.screenshot({ path: `${OUT}/offline-osu.png` });

// remove Accra (asks first) — the save stays
await srv.start();
await settings();
await p.click('.city-row[data-city="accra"] button[data-act="remove"]');
log('Remove asks first', (await p.isVisible('button[data-act="confirm-remove"]')) && (await S(() => caches.has('retreva-city-accra'))));
await p.click('button[data-act="confirm-remove"]');
await p.waitForSelector('.city-row[data-city="accra"][data-state="not-installed"]');
s = await S(() => ({ cache: null, bal: window.__retreva.store.getState().wallet.balance }));
log('Remove frees the city and leaves the game alone', !(await S(() => caches.has('retreva-city-accra'))) && s.bal === bal0);
await S(() => window.__retreva.store.getState().closePanel());
await S(() => window.__retreva.saves.saveNow());

// offline without Accra: refused with a clear message, nothing changed
await srv.stop();
await p.reload();
await p.waitForSelector('.wordmark', { timeout: 30000 });
await p.click('text=Continue');
await sleep(2500);
s = await S(() => ({ phase: window.__retreva.store.getState().phase }));
const notice = await p.textContent('body');
log('offline without Accra: the game says Accra isn\'t on this device (and doesn\'t open somewhere wrong)', s.phase === 'title' && /isn't on this device yet/.test(notice), JSON.stringify(s));
await p.screenshot({ path: `${OUT}/offline-missing.png` });
// back online: it downloads on demand and opens
await srv.start();
await p.click('text=Continue');
await p.waitForFunction(() => window.__retreva.store.getState().phase === 'playing', null, { timeout: 60000 }).catch(() => {});
s = await S(() => ({ dest: window.__retreva.store.getState().destinationId, phase: window.__retreva.store.getState().phase, bal: window.__retreva.store.getState().wallet.balance }));
log('back online it loads Accra on demand and the save is intact', s.dest === 'accra-osu' && s.phase === 'playing' && s.bal === bal0, JSON.stringify(s));
log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
await srv.stop();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
