// Dubai playtest: the third destination as a city pack. Book Lagos → Dubai (₦1,065,000 return, confirm,
// paid once; the pack downloads when the flight card opens), check-in talks about *this* flight,
// long-haul map, land at Dubai Creek, dirham guide prices, the Spice Run (paid once), the Creek Lights
// show at the gate, rent and walk into the creek studio, reload in Dubai, and fly home.
// Ticket money is topped up directly (test-topup); the clock is set directly for the show.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('dubai');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
const S = (fn, a) => p.evaluate(fn, a);
const st = () => S(() => {
  const s = window.__retreva.store.getState();
  return { phase: s.phase, ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]), ticket: s.travel.ticket, history: s.travel.history, inside: s.world.inside, homes: s.life.homes, banner: s.banner?.title ?? null, visited: s.world.visited, joy: s.life.needs.joy, time: s.world.time };
});
const place = (x, z, yaw) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
const near = (id) => p.waitForFunction((id) => window.__retreva.store.getState().nearby?.id === id, id, { timeout: 20000 });
const talk = async (npcId) => {
  const at = await S((id) => { const a = window.__retreva.runtime.actors.get(id); return a ? [a.x, a.z] : null; }, npcId);
  if (!at) throw new Error(`${npcId} is not here`);
  await place(at[0] + (at[0] > 0 ? -1.2 : 1.2), at[1], at[0] > 0 ? Math.PI / 2 : -Math.PI / 2);
  await near(npcId);
  await p.keyboard.press('KeyE');
  await sleep(250);
  await p.keyboard.press('Space');
  await p.waitForSelector('button.choice', { timeout: 10000 });
};
const choose = async (label) => { await p.click(`button.choice:has-text("${label}")`); await sleep(350); };
const playing = () => p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
const go = async (area) => {
  await S((a) => window.__retreva.store.getState().travelTo(a), area);
  await p.waitForFunction((a) => window.__retreva.store.getState().destinationId === a && window.__retreva.store.getState().phase === 'playing', area, { timeout: 60000 });
  await sleep(2500);
};
const setTime = (t) => S((t) => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, time: t } }); }, t);
const shot = async (n) => { await sleep(700); await p.screenshot({ path: `${OUT}/${n}.png` }); };
const fly = async (to) => {
  await talk(await S(() => window.__retreva.store.getState().destinationId === 'lagos-airport' ? 'ifeoma' : 'hessa'));
  const line = await p.textContent('.dialogue');
  await choose('Window, please');
  await talk(await S(() => window.__retreva.store.getState().destinationId === 'lagos-airport' ? 'officer-musa' : 'officer-salem'));
  await choose('Walk through');
  await talk(await S(() => window.__retreva.store.getState().destinationId === 'lagos-airport' ? 'bisola' : 'khalid'));
  const boardLine = await p.textContent('.dialogue');
  await choose('Board the plane');
  await p.waitForSelector('.flight-overlay');
  await sleep(1500);
  const longhaul = await p.isVisible('.flight-overlay text:has-text("ARABIA")');
  await p.screenshot({ path: `${OUT}/flight-${to}.png` });
  await p.click('.flight-overlay button:has-text("Skip to landing")');
  await p.waitForFunction((a) => { const g = window.__retreva.store.getState(); return g.destinationId === a && g.phase === 'playing'; }, to, { timeout: 60000 });
  await sleep(1500);
  return { line, boardLine, longhaul };
};

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Amaka');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(10 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 1200000, ledger: [{ id: 'test-topup', amount: 1200000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── book in the Travel app
log('Dubai is not loaded at the start (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('dubai'))));
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-dxb"]');
await p.waitForSelector('.flight[data-route="los-dxb"] button:has-text("Book return")', { timeout: 30000 });
log('the Dubai flight is listed and its city pack loads for booking', await S(() => window.__retreva.cities.isCityLoaded('dubai')));
log('the card is honest that the visa is a game simplification', /visa is handled with your ticket/.test(await p.textContent('.flight[data-route="los-dxb"]')));
await p.locator('.flight[data-route="los-dxb"]').scrollIntoViewIfNeeded();
await shot('travel-card');
let s = await st();
const pre = s.bal;
await p.click('.flight[data-route="los-dxb"] button:has-text("Book return")');
log('booking asks first', (await st()).bal === pre);
await p.click('.flight[data-route="los-dxb"] button:has-text("Confirm")');
await sleep(400);
s = await st();
log('a return ticket costs ₦1,065,000 once', pre - s.bal === 1065000 && s.ledger.filter(([id]) => id.startsWith('flight:los-dxb:')).length === 1 && s.ticket?.routeId === 'los-dxb');
await p.waitForFunction(() => caches.has('retreva-city-dubai'), null, { timeout: 20000 }).catch(() => {});
log('booking also keeps Dubai on the device for offline play', await S(() => caches.has('retreva-city-dubai')));
await S(() => window.__retreva.store.getState().closePanel());

// ── fly
await go('lagos-airport');
const out = await fly('dubai-creek');
log('check-in talks about this flight: Dubai, GC 571, and the visa line', /Dubai \(GC 571\)/.test(out.line) && /UAE visa/.test(out.line), out.line.slice(0, 120));
log('the gate agent boards Dubai at gate A5', /Dubai \(GC 571\), gate A5/.test(out.boardLine));
log('a long-haul map for the long flight', out.longhaul);
s = await st();
log('you land at Dubai Creek; the return ticket waits', s.dest === 'dubai-creek' && s.ticket?.routeId === 'dxb-los' && s.history.length === 1, `${s.dest} · ${s.banner}`);
await shot('dubai-creek');

// ── around the creek
await setTime(1440 + 11 * 60);
await sleep(1000);
await talk('rashid');
await choose('Show me your spices');
await p.waitForSelector('.shop, .sheet');
log('shops show the dirham equivalent as a guide', /AED/.test(await p.textContent('body')));
await shot('spice-house');
await S(() => window.__retreva.store.getState().closePanel());
await talk('rashid');
await choose("I'll run it");
await talk('ngozi');
await choose('Hand over the spices');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:spice-run:'));
log('the Spice Run pays once', run.length === 1 && run[0][1] >= 4000, JSON.stringify(run));

// ── rent the creek studio and go in
await place(-5.4, 29, -Math.PI / 2);
await near('creek-studio-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the creek studio (₦15,000) and walk inside', s.homes.includes('creek-studio') && s.inside?.interiorId === 'creek-studio' && s.ledger.some(([id, a]) => id === 'home:creek-studio' && a === -15000));
await shot('studio');
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── the night market (clock set to 20:00); pay at the gate
await setTime(1440 + 20 * 60);
await sleep(2500);
await place(5, -26, -Math.PI / 2);
await S(() => { const c = window.__retreva.runtime.camera; c.yaw = -Math.PI / 2; c.pitch = 0.25; });
await sleep(1500);
await shot('creek-lights');
await place(1.2, -26, -Math.PI / 2);
await near('creek-lights-gate');
await p.keyboard.press('KeyE');
await p.click('button[data-act="gate"]');
await p.click('button[data-act="confirm-gate"]');
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play' && window.__retreva.store.getState().world.time >= 1440 + 23 * 60, null, { timeout: 20000 });
s = await st();
log('Creek Lights: pay at the gate and see the show (until 23:00)', s.ledger.filter(([id]) => id === 'ticket:creek-lights:d2').length === 1);

// ── reload in Dubai
await S(() => window.__retreva.saves.saveNow());
await p.reload();
await p.click('text=Continue');
await playing();
s = await st();
log('after a reload you continue at Dubai Creek with your ticket home', s.dest === 'dubai-creek' && s.ticket?.routeId === 'dxb-los');

// ── fly home
await go('dubai-airport');
const home = await fly('ikeja-village');
log('flying home: check-in for Lagos, landing in Ikeja, two flights logged', /Lagos \(GC 572\)/.test(home.line) && (await st()).history.length === 2 && (await st()).ticket === null);
log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
