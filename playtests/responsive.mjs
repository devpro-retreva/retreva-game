// Responsive playtest (Architecture V6 §16): the seven viewport sizes from the spec, plus a phone
// rotating between portrait and landscape. At each size: title, character creation, HUD (inside the
// screen, no overlapping controls, no sideways scroll, touch targets ≥ 44px on touch screens), the phone,
// a conversation and a shop — and the world keeps running the same through a rotation.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('responsive');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SIZES = [
  { w: 320, h: 640, touch: true },
  { w: 360, h: 800, touch: true },
  { w: 390, h: 844, touch: true },
  { w: 768, h: 1024, touch: true },
  { w: 1024, h: 768, touch: true },
  { w: 1366, h: 768, touch: false },
  { w: 1920, h: 1080, touch: false },
];

/** Bounding boxes of the visible HUD controls; checks they're on screen and don't overlap. */
const hudLayout = () => {
  const vis = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none') return null;
    return { x: r.left, y: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height };
  };
  const items = {
    money: vis(document.querySelector('.hud-tl .money')),
    needs: vis(document.querySelector('.hud-tl .needs')),
    hint: vis(document.querySelector('.hud-tl .hint')),
    phone: vis(document.querySelector('.hud-tr .phone-btn')),
    pause: vis(document.querySelector('.hud-tr button[aria-label^="Pause"]')),
    minimap: vis(document.querySelector('.hud-tr .minimap')),
    run: vis(document.querySelector('.sprint-btn')),
    action: vis(document.querySelector('.action-btn')),
    joystick: vis(document.querySelector('.joy.idle')),
    prompt: vis(document.querySelector('.prompt')),
  };
  const W = innerWidth, H = innerHeight;
  const off = Object.entries(items).filter(([, b]) => b && (b.x < -1 || b.y < -1 || b.r > W + 1 || b.b > H + 1)).map(([k]) => k);
  const keys = Object.keys(items).filter((k) => items[k]);
  const overlaps = [];
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    const a = items[keys[i]], b = items[keys[j]];
    const ix = Math.min(a.r, b.r) - Math.max(a.x, b.x);
    const iy = Math.min(a.b, b.b) - Math.max(a.y, b.y);
    if (ix > 2 && iy > 2) overlaps.push(`${keys[i]}×${keys[j]}`);
  }
  const small = ['phone', 'pause', 'run', 'action'].filter((k) => items[k] && (items[k].h < 44 || items[k].w < 44));
  return { off, overlaps, small, sideways: document.documentElement.scrollWidth > W + 1, present: keys };
};
const inside = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return { ok: false, why: 'missing' };
  const r = el.getBoundingClientRect();
  return { ok: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, sideways: document.documentElement.scrollWidth > innerWidth + 1, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] };
};

const b = await launch();
for (const sz of SIZES) {
  const L = `[${sz.w}×${sz.h}${sz.touch ? ' touch' : ''}]`;
  const ctx = await b.newContext({ viewport: { width: sz.w, height: sz.h }, isMobile: sz.touch && sz.w < 1000, hasTouch: sz.touch, deviceScaleFactor: sz.touch ? 2 : 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  const S = (fn, a) => p.evaluate(fn, a);
  const tap = (sel) => (sz.touch ? p.tap(sel) : p.click(sel));
  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await S(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');

  // title
  const title = await S(() => {
    const btn = [...document.querySelectorAll('.title-actions button')][0];
    const r = btn.getBoundingClientRect();
    const wm = document.querySelector('.wordmark').getBoundingClientRect();
    return { btn: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, h: r.height, wm: wm.left >= -1 && wm.right <= innerWidth + 1, sideways: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  log(`${L} title: logo and Start button on screen, no sideways scroll`, title.btn && title.wm && !title.sideways && (!sz.touch || title.h >= 44), JSON.stringify(title));
  await p.screenshot({ path: `${OUT}/${sz.w}x${sz.h}-title.png` });

  // character creation
  await tap('text=Start a new life');
  await p.waitForSelector('#name');
  await p.fill('#name', 'Tolu');
  const create = await S(() => {
    const go = [...document.querySelectorAll('button')].find((x) => /Start my life/.test(x.textContent));
    go.scrollIntoView({ block: 'nearest' });
    const r = go.getBoundingClientRect();
    return { reachable: r.bottom <= innerHeight + 1 && r.top >= 0, sideways: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  log(`${L} character creation fits (Start reachable, no sideways scroll)`, create.reachable && !create.sideways, JSON.stringify(create));
  await p.screenshot({ path: `${OUT}/${sz.w}x${sz.h}-create.png` });
  await tap('text=Start my life');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
  await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
  await sleep(4200); // let the arrival banner clear

  // HUD near an NPC (so the action button / prompt shows too)
  await S(() => { const r = window.__retreva.runtime; r.player.x = 4.0; r.player.z = 36.6; r.player.yaw = Math.PI / 2; });
  await p.waitForFunction(() => window.__retreva.store.getState().nearby?.id === 'mama-titi', null, { timeout: 20000 });
  await sleep(500);
  const hud = await S(hudLayout);
  log(`${L} HUD controls are on screen and don't overlap`, hud.off.length === 0 && hud.overlaps.length === 0 && !hud.sideways, `present: ${hud.present.join(',')}${hud.off.length ? ` · off-screen: ${hud.off}` : ''}${hud.overlaps.length ? ` · overlaps: ${hud.overlaps}` : ''}`);
  if (sz.touch) log(`${L} touch buttons are at least 44px`, hud.small.length === 0, hud.small.join(','));
  await p.screenshot({ path: `${OUT}/${sz.w}x${sz.h}-hud.png` });

  // conversation, then the shop
  if (sz.touch) await tap('.action-btn');
  else { await p.keyboard.press('KeyE'); await sleep(250); await p.keyboard.press('Space'); }
  await p.waitForSelector('.dialogue button.choice');
  const settle = (sel) => p.waitForFunction((q) => { const el = document.querySelector(q); return !!el && !el.getAnimations({ subtree: true }).some((a) => a.playState === 'running'); }, sel, { timeout: 15000 });
  await settle('.dialogue');
  const dlg = await S(inside, '.dialogue');
  log(`${L} conversation panel fits the screen`, dlg.ok && !dlg.sideways, JSON.stringify(dlg.box));
  await tap('button.choice:has-text("Show me the menu")');
  await p.waitForSelector('.sheet');
  await settle('.sheet');
  const shop = await S(inside, '.sheet');
  log(`${L} shop panel fits the screen`, shop.ok && !shop.sideways, JSON.stringify(shop.box));
  await p.screenshot({ path: `${OUT}/${sz.w}x${sz.h}-shop.png` });
  await S(() => window.__retreva.store.getState().closePanel());

  // phone: home + travel (the widest content)
  await S(() => window.__retreva.store.getState().openPhone('travel'));
  await p.waitForSelector('.phone .flight');
  await settle('.phone');
  const phone = await S(inside, '.phone');
  const phoneScroll = await S(() => { const el = document.querySelector('.phone'); return [...el.querySelectorAll('*')].some((c) => c.scrollWidth > c.clientWidth + 2 && getComputedStyle(c).overflowX !== 'visible' && getComputedStyle(c).overflowX !== 'hidden'); });
  log(`${L} phone (Travel app) fits with nothing scrolling sideways`, phone.ok && !phone.sideways && !phoneScroll, JSON.stringify(phone.box));
  await p.screenshot({ path: `${OUT}/${sz.w}x${sz.h}-phone.png` });
  await S(() => window.__retreva.store.getState().closePanel());

  log(`${L} no page errors`, errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// rotate a phone: portrait → landscape → portrait; the world, the player and the camera carry on unchanged
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const S = (fn, a) => p.evaluate(fn, a);
  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await S(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');
  await p.tap('text=Start a new life');
  await p.fill('#name', 'Ada');
  await p.tap('text=Start my life');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
  await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
  await sleep(4200);
  const before = await S(() => { const r = window.__retreva.runtime; return { x: r.player.x, z: r.player.z, cam: r.camera.distance ?? null, phase: window.__retreva.store.getState().phase }; });
  await p.setViewportSize({ width: 844, height: 390 });
  await sleep(1500);
  const land = await S(hudLayout);
  log('[rotate] landscape 844×390: HUD on screen, no overlaps, no sideways scroll', land.off.length === 0 && land.overlaps.length === 0 && !land.sideways, `${land.off} ${land.overlaps}`);
  await p.screenshot({ path: `${OUT}/rotate-landscape.png` });
  await p.setViewportSize({ width: 390, height: 844 });
  await sleep(1500);
  const after = await S(() => { const r = window.__retreva.runtime; return { x: r.player.x, z: r.player.z, cam: r.camera.distance ?? null, phase: window.__retreva.store.getState().phase }; });
  const canvas = await S(() => { const c = document.querySelector('canvas'); return { w: c.clientWidth, h: c.clientHeight }; });
  log('[rotate] back to portrait: player, camera and game state unchanged; canvas fills the screen', Math.hypot(after.x - before.x, after.z - before.z) < 0.01 && after.cam === before.cam && after.phase === 'playing' && canvas.w === 390 && canvas.h === 844, JSON.stringify({ before, after, canvas }));
  await ctx.close();
}

await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
