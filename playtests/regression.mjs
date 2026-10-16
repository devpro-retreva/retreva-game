// Regression playtest: title, character creation, Jollof Run, shop, phone, pause, save/continue, mobile touch.
import { launch, BASE_URL, outDir } from './lib.mjs';
import fs from 'node:fs';

const URL = BASE_URL;
const OUT = outDir('regression');
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const log = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await launch();

// ───────────────────────── desktop ─────────────────────────
const ctx = await browser.newContext({ viewport: { width: 1366, height: 800 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

const S = (fn, arg) => page.evaluate(fn, arg);
const state = () => S(() => {
  const s = window.__retreva.store.getState();
  const r = window.__retreva.runtime;
  return {
    phase: s.phase, ui: s.ui, balance: s.wallet.balance, ledger: s.wallet.ledger.map((t) => t.id),
    nearby: s.nearby?.id ?? null, active: s.jobs.active, history: s.jobs.history,
    inv: s.inventory.entries.map((e) => [e.itemId, e.quantity]), dialogue: s.dialogue,
    p: { x: r.player.x, z: r.player.z, yaw: r.player.yaw }, cam: { yaw: r.camera.yaw }, perf: r.perf,
  };
});

/** Steers the player to (tx,tz) using real keyboard input relative to the live camera. */
async function walkTo(tx, tz, { run = false, tol = 1.0, timeout = 90000 } = {}) {
  const t0 = Date.now();
  const held = new Set();
  const set = async (keys) => {
    for (const k of held) if (!keys.has(k)) { await page.keyboard.up(k); held.delete(k); }
    for (const k of keys) if (!held.has(k)) { await page.keyboard.down(k); held.add(k); }
  };
  while (Date.now() - t0 < timeout) {
    const s = await state();
    const dx = tx - s.p.x, dz = tz - s.p.z;
    const dist = Math.hypot(dx, dz);
    if (dist < tol) break;
    // desired angle relative to camera forward
    let rel = Math.atan2(dx, dz) - s.cam.yaw;
    while (rel > Math.PI) rel -= 2 * Math.PI;
    while (rel < -Math.PI) rel += 2 * Math.PI;
    const keys = new Set();
    if (Math.abs(rel) < 1.2) keys.add('KeyW');
    if (Math.abs(rel) > 1.9) keys.add('KeyS');
    if (rel > 0.25) keys.add('KeyA');   // left of camera forward
    if (rel < -0.25) keys.add('KeyD');
    if (run && dist > 3) keys.add('ShiftLeft');
    await set(keys);
    await sleep(60);
  }
  await set(new Set());
  await sleep(250);
  return state();
}

const small = () => page.setViewportSize({ width: 560, height: 360 });
const big = async () => { await page.setViewportSize({ width: 1366, height: 800 }); await sleep(1800); };
/** Walk along a straight lane via waypoints every few metres (keeps a low-fps bot on line). */
async function lane(x, z0, z1, opts = {}) {
  const step = z1 > z0 ? 6 : -6;
  let st;
  for (let z = z0 + step; step > 0 ? z < z1 : z > z1; z += step) st = await walkTo(x, z, { tol: 1.4, ...opts });
  return walkTo(x, z1, { tol: 0.8, ...opts });
}

const t = Date.now();
await page.goto(URL);
await page.waitForSelector('.wordmark', { timeout: 20000 });
log('boot to title screen', true, `${Date.now() - t}ms`);
await page.screenshot({ path: `${OUT}/01-title-desktop.png` });

await page.click('text=Start a new life');
await page.waitForSelector('#name');
await page.fill('#name', 'Adaeze');
await page.click('button[aria-label="Skin tone 3"]');
await page.click('button[aria-label="Lagoon"]');
await page.click('[aria-label="Gender"] button:has-text("Female")');
await page.click('[aria-label="Headwear"] button:has-text("Gele")');
await sleep(600);
await page.screenshot({ path: `${OUT}/02-create-desktop.png` });
await page.click('text=Start my life');
await page.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 30000 });
await sleep(1500);
let s = await state();
log('enter 3D world', s.phase === 'playing', `spawn ${s.p.x.toFixed(1)},${s.p.z.toFixed(1)} balance ${s.balance}`);
await page.screenshot({ path: `${OUT}/03-world-desktop.png` });
// software GL is very slow; switch shadows off for the long walking sections
await S(() => window.__retreva.store.getState().updateSettings({ shadows: 'off', tips: false }));
await sleep(6000);
await small();

// movement
const before = s.p;
// Hold W until the player has covered 0.8 m (or 10 s pass). At very low fps the game caps each
// frame's time step, so a fixed hold time would make this check depend on machine speed.
await page.keyboard.down('KeyW');
const holdStart = Date.now();
let moved = 0;
while (Date.now() - holdStart < 10000) {
  await sleep(250);
  s = await state();
  moved = Math.hypot(s.p.x - before.x, s.p.z - before.z);
  if (moved > 0.8) break;
}
await page.keyboard.up('KeyW');
await sleep(300);
s = await state();
log('keyboard movement (W held until 0.8 m, max 10 s)', moved > 0.8, `moved ${moved.toFixed(2)} m in ${((Date.now() - holdStart) / 1000).toFixed(1)} s`);

// camera drag
const camBefore = s.cam.yaw;
await page.mouse.move(240, 180); await page.mouse.down(); await page.mouse.move(360, 170, { steps: 8 }); await page.mouse.up();
await sleep(200);
s = await state();
log('mouse-drag camera orbit', Math.abs(s.cam.yaw - camBefore) > 0.3, `yaw Δ ${(s.cam.yaw - camBefore).toFixed(2)} rad`);
await page.mouse.move(360, 170); await page.mouse.down(); await page.mouse.move(240, 180, { steps: 8 }); await page.mouse.up();

// collision: try to walk into Mama Titi's building
s = await walkTo(5.0, 30.5, { tol: 0.8 });
await page.keyboard.down('KeyD'); await sleep(4000); await page.keyboard.up('KeyD');
s = await state();
log('building collision blocks player', s.p.x < 7.0, `x=${s.p.x.toFixed(2)} (wall at 7.2)`);

// approach Mama Titi (step back into the open sidewalk lane first)
await walkTo(4.6, 30.5, { tol: 0.6 });
s = await walkTo(4.3, 36.6, { tol: 0.5 });
log('interaction prompt near NPC', s.nearby === 'mama-titi', `nearby=${s.nearby}`);
const promptVisible = await page.isVisible('.prompt');
log('prompt rendered in HUD', promptVisible);
await big();
await page.screenshot({ path: `${OUT}/04-prompt-desktop.png` });

await page.keyboard.press('KeyE');
await sleep(300);
s = await state();
log('dialogue opens with E', s.ui === 'dialogue' && s.dialogue?.npcId === 'mama-titi', `node=${s.dialogue?.nodeId}`);
await page.keyboard.press('Space'); // skip typing
await sleep(800);
await page.screenshot({ path: `${OUT}/05-dialogue-desktop.png` });
await page.keyboard.press('Digit2'); // "What's the pay?"
await sleep(200);
await page.keyboard.press('Space');
await sleep(400);
s = await state();
log('dialogue branches (goto node)', s.dialogue?.nodeId === 'pay');
await page.keyboard.press('Digit1'); // Deal
await sleep(400);
s = await state();
log('job accepted, timer running', !!s.active && s.ui === 'play', `remaining ${s.active?.remainingMs}`);
await page.screenshot({ path: `${OUT}/06-job-active-desktop.png` });
await small();

// run the delivery
const runStart = Date.now();
await walkTo(4.6, 32.0, { run: true, tol: 1.0, timeout: 60000 });
s = await lane(4.6, 32.0, -36.2, { run: true, timeout: 40000 });
const runSecs = (Date.now() - runStart) / 1000;
log('reached Tunde', s.nearby === 'tunde', `${runSecs.toFixed(1)}s wall-clock, at ${s.p.x.toFixed(1)},${s.p.z.toFixed(1)}`);
await big();
await page.screenshot({ path: `${OUT}/07-arrive-tunde-desktop.png` });
const balBefore = s.balance;
await page.keyboard.press('KeyE');
await sleep(300);
await page.keyboard.press('Space');
await sleep(500);
s = await state();
log('Tunde offers delivery option', s.dialogue?.nodeId === 'delivery');
await page.keyboard.press('Digit1');
await sleep(500);
s = await state();
const jobPay = await S(() => window.__retreva.store.getState().wallet.ledger.filter((t) => t.id.startsWith('job:')).reduce((n, t) => n + t.amount, 0));
const goalPay = await S(() => window.__retreva.store.getState().wallet.ledger.filter((t) => t.id.startsWith('goal:')).reduce((n, t) => n + t.amount, 0));
const hist = s.history.at(-1);
log('delivery pays out', (jobPay === 1900 || jobPay === 2550) && s.balance - balBefore === jobPay + goalPay, `job +${jobPay} (elapsed ${(hist?.elapsedMs / 1000).toFixed(1)}s, ${jobPay === 2550 ? 'with' : 'without'} speed bonus), goal +${goalPay}`);
await page.screenshot({ path: `${OUT}/08-reward-desktop.png` });

// duplicate attempts
const balAfter = s.balance;
await S(() => {
  const st = window.__retreva.store.getState();
  for (let i = 0; i < 10; i++) st.deliverJob('jollof-run');
  st.chooseOption({ label: 'x', action: { kind: 'deliverJob', jobId: 'jollof-run' } });
});
await page.keyboard.press('KeyE'); await sleep(300); await page.keyboard.press('Space'); await sleep(300);
s = await state();
log('repeat delivery attempts pay nothing', s.balance === balAfter, `balance ${s.balance}, Tunde now says "${s.dialogue?.nodeId}"`);
await page.keyboard.press('Escape');
await sleep(200);
const jobTx = s.ledger.filter((id) => id.startsWith('job:'));
log('exactly one job transaction in ledger', jobTx.length === 1, jobTx.join(','));

// shop with Iya Bisi
await small();
await walkTo(4.6, -33.0, { tol: 1.0 });
s = await lane(4.6, -33.0, -6.2, { run: true, timeout: 40000 });
s = await walkTo(4.4, -6.2, { tol: 0.5 });
await big();
log('reach Iya Bisi', s.nearby === 'iya-bisi', `nearby=${s.nearby}`);
await page.keyboard.press('KeyE'); await sleep(300); await page.keyboard.press('Space'); await sleep(300);
await page.keyboard.press('Digit1'); await sleep(400);
s = await state();
log('shop opens from dialogue', s.ui === 'shop');
const shopBal = s.balance;
await page.click('button[aria-label^="Buy Bottled water"]');
await page.click('button[aria-label^="Buy Adeniyi St. keyring"]');
await sleep(300);
await page.screenshot({ path: `${OUT}/09-shop-desktop.png` });
s = await state();
log('purchases debit money and add items', shopBal - s.balance === 1400 && s.inv.length === 2, `spent ${shopBal - s.balance}, bag ${JSON.stringify(s.inv)}`);
// can't afford check
const broke = await S(() => {
  const st = window.__retreva.store;
  const before = st.getState().wallet.balance;
  const saved = st.getState().wallet;
  st.setState({ wallet: { ...saved, balance: 100 } });
  const ok = st.getState().buy('iya-bisi', 'ankara-tote');
  const after = st.getState().wallet.balance;
  st.setState({ wallet: saved });
  return { ok, after, before };
});
log('purchase refused when short of money', broke.ok === false && broke.after === 100);
await page.keyboard.press('Escape');
await sleep(200);

// phone + inventory
await page.keyboard.press('KeyI');
await sleep(400);
await page.screenshot({ path: `${OUT}/10-phone-bag-desktop.png` });
await page.click('button.btn.ghost:has-text("Drink")');
await sleep(200);
s = await state();
log('consume item from bag', JSON.stringify(s.inv) === JSON.stringify([['lagos-keyring', 1]]), JSON.stringify(s.inv));
await page.click('button[aria-label="Back to home"]');
await sleep(300);
await page.screenshot({ path: `${OUT}/11-phone-home-desktop.png` });
await page.click('button[aria-label="Wallet"]'); await sleep(300);
await page.screenshot({ path: `${OUT}/12-phone-wallet-desktop.png` });
await page.click('button[aria-label="Back to home"]');
await page.click('button[aria-label="Map"]'); await sleep(300);
await page.screenshot({ path: `${OUT}/13-phone-map-desktop.png` });
await page.click('button[aria-label="Back to home"]');
await page.click('button[aria-label="Events"]'); await sleep(300);
// (Events used to be a locked placeholder; it went live with ticketed shows)
log('the Events app lists shows with their next showing', (await page.locator('.event-card').count()) >= 3);
await page.keyboard.press('KeyP');
await sleep(200);

// pause stops timer
await page.keyboard.press('Escape');
await sleep(300);
await page.screenshot({ path: `${OUT}/14-pause-desktop.png` });
s = await state();
log('pause menu opens', s.ui === 'pause');
await page.keyboard.press('Escape');

// perf sample
await S(() => window.__retreva.store.getState().updateSettings({ showFps: true }));
await sleep(1500);
s = await state();
log('draw calls within mobile budget (<120)', s.perf.drawCalls > 0 && s.perf.drawCalls < 120, `${s.perf.drawCalls} calls, ${s.perf.triangles} tris, ${s.perf.fps} fps (software GL)`);
await S(() => window.__retreva.store.getState().updateSettings({ showFps: false }));

// persistence across reload
const preReload = await state();
await sleep(1200);
await page.reload();
await page.waitForSelector('text=Continue', { timeout: 20000 });
await page.screenshot({ path: `${OUT}/15-title-continue-desktop.png` });
await page.click('text=Continue');
await page.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 30000 });
await sleep(800);
s = await state();
const posDrift = Math.hypot(s.p.x - preReload.p.x, s.p.z - preReload.p.z);
log('money survives refresh', s.balance === preReload.balance, `${s.balance}`);
log('inventory survives refresh', JSON.stringify(s.inv) === JSON.stringify(preReload.inv), JSON.stringify(s.inv));
log('job history survives refresh', s.history.length === preReload.history.length);
log('position survives refresh', posDrift < 1.5, `drift ${posDrift.toFixed(2)} m`);
const ok2 = await S(() => {
  const st = window.__retreva.store.getState();
  const b = st.wallet.balance;
  st.deliverJob('jollof-run');
  return window.__retreva.store.getState().wallet.balance === b;
});
log('no payout replay after refresh', ok2);

// mid-job refresh keeps remaining time
await S(() => {
  const st = window.__retreva.store;
  st.setState({ jobs: { ...st.getState().jobs, cooldownUntil: {} } });
  st.getState().acceptJob('jollof-run');
});
await sleep(3000);
const midRemaining = (await state()).active?.remainingMs;
await S(() => window.__retreva.saves.saveNow());
await page.reload();
await page.click('text=Continue');
await page.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 30000 });
s = await state();
log('active job resumes after refresh', !!s.active && Math.abs(s.active.remainingMs - midRemaining) < 1500, `before ${midRemaining}ms, after ${s.active?.remainingMs}ms`);

log('no console/page errors (desktop)', errors.length === 0, errors.slice(0, 3).join(' | '));
await ctx.close();

// ───────────────────────── mobile ─────────────────────────
async function mobile(name, viewport) {
  const mctx = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mp = await mctx.newPage();
  const merr = [];
  mp.on('pageerror', (e) => merr.push(String(e)));
  await mp.goto(URL);
  await mp.waitForSelector('.wordmark');
  await mp.screenshot({ path: `${OUT}/m-${name}-01-title.png` });
  await mp.tap('text=Start a new life');
  await mp.waitForSelector('#name');
  await mp.fill('#name', 'Tolu');
  await sleep(500);
  await mp.screenshot({ path: `${OUT}/m-${name}-02-create.png` });
  await mp.tap('text=Start my life');
  await mp.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 30000 });
  await sleep(1500);
  await mp.screenshot({ path: `${OUT}/m-${name}-03-world.png` });
  const ms = () => mp.evaluate(() => {
    const r = window.__retreva.runtime; const s = window.__retreva.store.getState();
    return { x: r.player.x, z: r.player.z, nearby: s.nearby?.id ?? null, ui: s.ui, cam: r.camera.yaw };
  });
  // joystick drag via CDP touch events
  const cdp = await mctx.newCDPSession(mp);
  const start = await ms();
  const sx = viewport.width * 0.2, sy = viewport.height * 0.8;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy, id: 1 }] });
  for (let i = 1; i <= 6; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + i * 2, y: sy - i * 10, id: 1 }] });
    await sleep(30);
  }
  await sleep(1300);
  await mp.screenshot({ path: `${OUT}/m-${name}-04-joystick.png` });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(300);
  const end = await ms();
  const mm = Math.hypot(end.x - start.x, end.z - start.z);
  log(`[${name}] touch joystick moves player`, mm > 1.5, `moved ${mm.toFixed(2)} m`);
  // look drag on right side
  const rx = viewport.width * 0.75, ry = viewport.height * 0.6;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: rx, y: ry, id: 2 }] });
  for (let i = 1; i <= 6; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: rx - i * 12, y: ry, id: 2 }] });
    await sleep(20);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
  const after = await ms();
  log(`[${name}] touch look orbits camera`, Math.abs(after.cam - end.cam) > 0.2, `yaw Δ ${(after.cam - end.cam).toFixed(2)}`);
  // place next to Mama Titi to test the action button + mobile panels
  await mp.evaluate(() => { const r = window.__retreva.runtime; r.player.x = 4.0; r.player.z = 36.6; r.camera.yaw = Math.PI * 0.6; });
  await mp.waitForSelector('.action-btn', { timeout: 15000 }).catch(() => null);
  await sleep(800);
  const actionVisible = await mp.isVisible('.action-btn');
  log(`[${name}] contextual action button appears`, actionVisible);
  await mp.screenshot({ path: `${OUT}/m-${name}-05-action.png` });
  await mp.tap('.action-btn');
  await sleep(1600);
  await mp.screenshot({ path: `${OUT}/m-${name}-06-dialogue.png` });
  await mp.tap('button.choice:has-text("Show me the menu")');
  await sleep(500);
  await mp.screenshot({ path: `${OUT}/m-${name}-07-shop.png` });
  await mp.tap('button[aria-label^="Buy Zobo"]');
  await sleep(300);
  await mp.tap('button[aria-label="Close (Esc)"]');
  await sleep(300);
  await mp.tap('button[aria-label="Open phone (P)"]');
  await sleep(500);
  await mp.screenshot({ path: `${OUT}/m-${name}-08-phone.png` });
  await mp.tap('button[aria-label="Bag"]');
  await sleep(300);
  await mp.screenshot({ path: `${OUT}/m-${name}-09-bag.png` });
  // overflow check
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  log(`[${name}] no horizontal overflow`, !overflow);
  log(`[${name}] no page errors`, merr.length === 0, merr.slice(0, 2).join(' | '));
  await mctx.close();
}
await mobile('small', { width: 360, height: 740 });
await mobile('tablet', { width: 820, height: 1180 });

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
