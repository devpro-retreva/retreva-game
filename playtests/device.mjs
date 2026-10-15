// Device-readiness playtest (Architecture V6, milestone 3): offline launch + play with saves,
// graphics tiers (low/medium/high) and their budgets, large text on a small phone.
import { launch, BASE_URL, outDir } from './lib.mjs';
import { serveDist } from './static-server.mjs';
const OUT = outDir('device');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await launch();

// ── offline ─────────────────────────────────────────────────────────────
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  const S = (fn, a) => p.evaluate(fn, a);
  // the offline part uses its own server and stops it: Playwright's setOffline() doesn't cut off the
  // service worker's own requests, so only a stopped server proves the game needs no network
  const srv = await serveDist();
  await p.goto(`${srv.url}?clock=paused`);
  await p.waitForSelector('.wordmark');
  const swOk = await S(() => navigator.serviceWorker.ready.then((r) => !!r.active)).catch(() => false);
  // wait for the precache to fill
  let cached = 0;
  let want = 0;
  for (let i = 0; i < 40; i++) {
    const r = await S(async () => {
      const list = await (await fetch('./precache.json', { cache: 'no-store' })).json();
      const keys = (await caches.keys()).filter((k) => k.startsWith('retreva-') && !k.startsWith('retreva-city-'));
      if (!keys.length) return [0, list.files.length];
      const c = await caches.open(keys[0]);
      let n = 0;
      for (const f of list.files) if (await c.match(`./${f}`)) n++;
      return [n, list.files.length];
    });
    [cached, want] = r;
    if (want && cached === want) break;
    await sleep(500);
  }
  log('service worker installs and precaches every built file', swOk && want > 0 && cached === want, `${cached}/${want} files`);
  await p.reload(); // let the worker take control of the page
  await p.waitForSelector('.wordmark');
  log('page is controlled by the offline worker', await S(() => !!navigator.serviceWorker.controller));

  await p.click('text=Start a new life');
  await p.fill('#name', 'Ngozi');
  await p.click('text=Start my life');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
  await S(() => window.__retreva.store.getState().updateSettings({ shadows: 'off', tips: false }));
  await S(() => window.__retreva.store.getState().buy('mama-titi', 'puff-puff'));
  await S(() => window.__retreva.saves.saveNow());
  const pre = await S(() => ({ bal: window.__retreva.store.getState().wallet.balance, inv: window.__retreva.store.getState().inventory.entries.length }));

  await srv.stop();
  await p.reload();
  await p.waitForSelector('.wordmark', { timeout: 20000 });
  log('offline: the game opens with no network', true);
  await p.click('text=Continue');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
  await sleep(2500);
  const post = await S(() => ({ bal: window.__retreva.store.getState().wallet.balance, inv: window.__retreva.store.getState().inventory.entries.length, draws: window.__retreva.runtime.perf.drawCalls }));
  log('offline: the saved game continues with money and bag intact', post.bal === pre.bal && post.inv === pre.inv, JSON.stringify(post));
  log('offline: the 3D world renders', post.draws > 20, `${post.draws} draw calls`);
  // play offline: a purchase and a save still work
  await S(() => window.__retreva.store.getState().buy('iya-bisi', 'water'));
  await S(() => window.__retreva.saves.saveNow());
  await p.reload();
  await p.click('text=Continue');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
  const after = await S(() => window.__retreva.store.getState().wallet.balance);
  log('offline: progress made offline is saved and reloads', after === pre.bal - 200, `${pre.bal} → ${after}`);
  await S(() => window.__retreva.store.getState().openPhone('settings'));
  await sleep(500);
  log('settings shows offline play as ready', (await p.getAttribute('[data-offline]', 'data-offline')) === 'ready');
  await p.screenshot({ path: `${OUT}/offline-settings.png` });
  await srv.start();
  log('offline: no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
  await srv.stop();
}

// ── graphics tiers ─────────────────────────────────────────────────────
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  const S = (fn, a) => p.evaluate(fn, a);
  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await S(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');
  await p.click('text=Start a new life');
  await p.fill('#name', 'Bola');
  await p.click('text=Start my life');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
  await S(() => window.__retreva.store.getState().updateSettings({ shadows: 'auto', tips: false }));
  const measure = async (tier) => {
    await S((t) => window.__retreva.store.getState().openPhone('settings'), tier);
    await p.click(`[aria-label="Graphics quality"] button:has-text("${tier === 'medium' ? 'Med' : tier[0].toUpperCase() + tier.slice(1)}")`);
    await S(() => window.__retreva.store.getState().closePanel());
    // the canvas rebuilds for the new tier; wait for a fresh sample from the new renderer
    await S(() => { window.__retreva.runtime.perf.drawCalls = 0; });
    await p.waitForFunction(() => window.__retreva.runtime.perf.drawCalls > 0, null, { timeout: 60000 });
    await sleep(3000);
    return S(() => ({ ...window.__retreva.runtime.perf, cars: window.__retreva.runtime.traffic.length, walkers: [...window.__retreva.runtime.actors.keys()].filter((k) => k.startsWith('walker')).length }));
  };
  const low = await measure('low');
  const high = await measure('high');
  log('low tier: fewer vehicles and people', low.cars <= 3 && high.cars === 6, `low ${low.cars} cars, high ${high.cars}`);
  log('low tier costs less to draw than high', low.drawCalls < high.drawCalls && low.triangles < high.triangles, `low ${low.drawCalls} calls/${low.triangles} tris · high ${high.drawCalls}/${high.triangles}`);
  const persisted = await S(() => window.__retreva.store.getState().settings.graphics);
  await S(() => window.__retreva.saves.saveNow());
  await p.reload();
  await p.click('text=Continue');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
  log('graphics choice is saved', persisted === 'high' && (await S(() => window.__retreva.store.getState().settings.graphics)) === 'high');
  log('graphics: no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ── large text on a small phone ───────────────────────────────────────
{
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  const S = (fn, a) => p.evaluate(fn, a);
  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await S(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');
  await p.tap('text=Start a new life');
  await p.fill('#name', 'Emeka');
  await p.tap('text=Start my life');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
  await S(() => window.__retreva.store.getState().updateSettings({ textScale: 1.3, tips: false }));
  await sleep(800);
  const check = async (label) => {
    const r = await S(() => {
      const over = document.documentElement.scrollWidth > window.innerWidth;
      const tooSmall = [...document.querySelectorAll('button')].filter((el) => {
        const b = el.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden' && (b.height < 32 || b.width < 32);
      }).map((el) => el.getAttribute('aria-label') || el.textContent.trim().slice(0, 20));
      return { over, tooSmall };
    });
    log(`large text (A++) on 360px: ${label} fits with no sideways scroll`, !r.over);
    return r;
  };
  await check('HUD');
  await p.screenshot({ path: `${OUT}/textscale-hud.png` });
  await S(() => window.__retreva.store.getState().openPhone('settings'));
  await sleep(400);
  await check('phone settings');
  await p.screenshot({ path: `${OUT}/textscale-settings.png` });
  await S(() => window.__retreva.store.getState().closePanel());
  await S(() => window.__retreva.store.getState().startShift('buka-kitchen'));
  await sleep(500);
  const r = await check('kitchen shift');
  log('kitchen shift dish buttons are comfortable touch targets (≥ 44px tall)', await S(() => [...document.querySelectorAll('.dish')].every((d) => d.getBoundingClientRect().height >= 44)), r.tooSmall.join(', '));
  await p.screenshot({ path: `${OUT}/textscale-shift.png` });
  log('text scale: no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
