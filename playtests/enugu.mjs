// Enugu playtest: the tenth city pack, by domestic flight, and on by bus to Benin City. Book Lagos → Enugu (₦215,000
// return, paid once; Benin City stays the cheaper flight fund), ID check, the Nigeria map, land in Ogui; the
// draw-call budget; Milliken Hill found from the road; the Cassava Run (paid once); Mama Chinyere's abacha stall shift
// (8 orders, perfect: pay + tip once, cooking XP, staff meal); abacha; the Coal City Walk (locked, in order, paid
// once); Highlife & Ogene Night in Events; renting and entering the Ogui room; reload; then Chidi's bus to Benin City
// (₦15,000 once, five hours, on the map of Nigeria). Ticket and bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('enugu');
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
  return { phase: s.phase, ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]), ticket: s.travel.ticket, history: s.travel.history, inside: s.world.inside, homes: s.life.homes, active: s.jobs.active, discovered: s.world.discovered, bag: s.inventory.entries.map((e) => e.itemId) };
});
const place = (x, z, yaw) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
const near = (id) => p.waitForFunction((id) => window.__retreva.store.getState().nearby?.id === id, id, { timeout: 20000 });
const talk = async (npcId) => {
  await p.waitForFunction((id) => window.__retreva.runtime.actors.has(id), npcId, { timeout: 15000 }).catch(() => {});
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
// the airport staff at each end (data in lagosAirport.ts / enuguAirport.ts)
const STAFF = { 'lagos-airport': ['ifeoma', 'officer-musa', 'bisola'], 'enugu-airport': ['chiamaka', 'officer-okeke', 'nnamdi'] };
const fly = async (to) => {
  const [desk, security, gate] = STAFF[await S(() => window.__retreva.store.getState().destinationId)];
  await talk(desk);
  const line = await p.textContent('.dialogue');
  await choose('Window, please');
  await talk(security);
  await choose('Walk through');
  await talk(gate);
  const boardLine = await p.textContent('.dialogue');
  await choose('Board the plane');
  await p.waitForSelector('.flight-overlay');
  await sleep(1500);
  const nigeriaMap = (await p.isVisible('.flight-overlay text:has-text("NIGERIA")')) && (await p.isVisible('.flight-overlay text:has-text("Lokoja")'));
  await p.screenshot({ path: `${OUT}/flight-${to}.png` });
  // clicked in the page: the overlay re-renders as the flight progresses (and may already have landed on a slow run)
  await p.evaluate(() => [...document.querySelectorAll('.flight-overlay button')].find((b) => b.textContent.includes('Skip to landing'))?.click());
  await p.waitForFunction((a) => { const g = window.__retreva.store.getState(); return g.destinationId === a && g.phase === 'playing'; }, to, { timeout: 60000 });
  await sleep(1500);
  return { line, boardLine, nigeriaMap };
};

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Ada');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 10 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 260000, ledger: [{ id: 'test-topup', amount: 260000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── book in the Travel app
log('Enugu is not loaded at the start (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('enugu'))));
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-enu"] button:has-text("Book return")', { timeout: 30000 });
log('the Enugu flight is listed and its city pack loads for booking', await S(() => window.__retreva.cities.isCityLoaded('enugu')));
let s = await st();
const pre = s.bal;
await p.click('.flight[data-route="los-enu"] button:has-text("Book return")');
await p.click('.flight[data-route="los-enu"] button:has-text("Confirm")');
await sleep(400);
s = await st();
log('a return ticket costs ₦215,000 once', pre - s.bal === 215000 && s.ledger.filter(([id]) => id.startsWith('flight:los-enu:')).length === 1 && s.ticket?.routeId === 'los-enu');
await S(() => window.__retreva.store.getState().closePanel());

// ── fly
await go('lagos-airport');
const out = await fly('enugu-ogui');
log('check-in asks for an ID card for Enugu (GC 310), gate A6', /ID card, please/.test(out.line) && /Enugu \(GC 310\)/.test(out.line) && /gate A6/.test(out.boardLine), out.line.slice(0, 120));
log('the flight is drawn on a map of Nigeria', out.nigeriaMap);
s = await st();
log('you land in Ogui; the return ticket waits', s.dest === 'enugu-ogui' && s.ticket?.routeId === 'enu-los', s.dest);
await shot('ogui-arrival');
await sleep(1500);
const perf = await S(() => window.__retreva.runtime.perf);
log('Ogui stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── Milliken Hill from the road
await place(0, -37, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.02; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('enu-milliken'), null, { timeout: 20000 }).catch(() => {});
log('Milliken Hill is found at the end of the road', (await st()).discovered.includes('enu-milliken'));
await shot('milliken-hill');

// ── the Cassava Run
await setTime(1440 + 11 * 60);
await talk('nne-ada');
await choose("I'll carry it");
await talk('mama-chinyere');
await choose('Hand over the sack');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:cassava-run:'));
log('the Cassava Run pays once (₦2,200 or more)', run.length === 1 && run[0][1] >= 2200, JSON.stringify(run));

// ── the abacha stall shift
const before = await S(() => { const g = window.__retreva.store.getState(); return { xp: g.life.skills.cooking ?? 0, full: g.life.needs.fullness }; });
await talk('mama-chinyere');
await choose('Help at the stall (shift)');
await p.waitForSelector('.shift .ticket');
await shot('abacha-shift');
for (let i = 0; i < 8; i++) {
  const cur = await S(() => window.__retreva.store.getState().shift);
  // the order timer is wall-clock; hold it here (late orders are covered by the scoreShift unit tests)
  await S(() => { const st = window.__retreva.store; const r = st.getState().shift; st.setState({ shift: { ...r, deadline: Date.now() + 60000 } }); });
  await p.click(`.dish[data-dish="${cur.orders[cur.index]}"]`);
  await sleep(150);
}
await p.waitForSelector('.shift-done');
s = await st();
const o = await S(() => window.__retreva.store.getState().shift.outcome);
const after = await S(() => { const g = window.__retreva.store.getState(); return { xp: g.life.skills.cooking ?? 0, full: g.life.needs.fullness }; });
log('a perfect abacha shift: 8 × ₦220 + ₦450 tip, paid once, cooking XP, a staff meal', o.served === 8 && o.pay === 1760 && o.tip === 450 && s.ledger.filter(([id]) => id.startsWith('shift:abacha-stall:')).length === 1 && after.xp > before.xp && after.full > before.full, JSON.stringify({ pay: o.pay, tip: o.tip, xp: after.xp }));
await p.click('.shift-done button:has-text("Done")');
await sleep(400);

// ── abacha
await talk('mama-chinyere');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Abacha"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Abacha"]');
await sleep(400);
s = await st();
log('abacha is ₦1,800 and goes in the bag', preFood - s.bal === 1800 && s.bag.includes('abacha'));
await S(() => window.__retreva.store.getState().closePanel());

// ── the Coal City Walk
await talk('fatima-enugu');
log('Fatima wants a guide who already knows Ogui (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[4.6, 20, Math.PI / 2], [4.6, -12, Math.PI / 2], [-4.6, -10, -Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['enu-coalcamp', 'enu-ogbete', 'enu-okpara'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
await shot('coal-camp');
await talk('fatima-enugu');
await choose('Guide Fatima');
s = await st();
log('with the sights found, Fatima hires you', s.active?.jobId === 'coal-city-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('fatima-enugu');
      const d = Math.hypot(tx - pl.x, tz - pl.z);
      const gap = Math.hypot(g.x - pl.x, g.z - pl.z);
      if (gap < 4 && d > 0.5) { const k = Math.min(1, d) / d; pl.x += (tx - pl.x) * k; pl.z += (tz - pl.z) * k; }
      return { d };
    }, [tx, tz]);
    if (r.d < 1) break;
    await sleep(350);
  }
};
await S(() => { window.__hold = setInterval(() => { const st = window.__retreva.store; const j = st.getState().jobs; if (j.active) st.setState({ jobs: { ...j, active: { ...j.active, remainingMs: 210000 } } }); }, 500); });
const stops = [[4.4, 20], [4.4, -12], [-4.4, -10]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('Coal Camp, Ogbete, Okpara Square — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('fatima-enugu');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:coal-city-walk:'));
log('the Coal City Walk pays once (₦3,800 or more)', walk.length === 1 && walk[0][1] >= 3800, JSON.stringify(walk));

// ── Highlife & Ogene Night in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="ogene-night"]', { timeout: 10000 }).catch(() => {});
log('the Events app lists Highlife & Ogene Night', await p.isVisible('.event-card[data-event="ogene-night"]'));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the Ogui room and go in
await place(5.0, 9.6, Math.PI / 2);
await near('ogui-room-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Ogui room (₦7,000) and walk inside', s.homes.includes('ogui-room') && s.inside?.interiorId === 'ogui-room' && s.ledger.some(([id, a]) => id === 'home:ogui-room' && a === -7000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then the bus to Benin City
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue in Ogui with your ticket home', s.dest === 'enugu-ogui' && s.ticket?.routeId === 'enu-los');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
const t0 = await S(() => window.__retreva.store.getState().world.time);
await talk('driver-chidi');
await choose('Take the bus to Benin City');
await p.waitForSelector('button[aria-label="Bus to Benin City for ₦15,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Benin City for ₦15,000"]');
await p.waitForSelector('.coach-transit', { timeout: 10000 }).catch(() => {});
await sleep(800);
const nigeria = (await p.isVisible('.coach-transit svg text:has-text("NIGERIA")')) && (await p.isVisible('.coach-transit svg text:has-text("Enugu")'));
await p.screenshot({ path: `${OUT}/bus-to-benin.png` });
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'benin-kings-square' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Chidi’s bus goes to Benin City for ₦15,000 in five hours, on the map of Nigeria', nigeria && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -15000).length === 1 && t1 - t0 === 300, `+${t1 - t0} min`);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
