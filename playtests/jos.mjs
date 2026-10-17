// Jos playtest: the twelfth city pack, the first of Batch 4, up on the plateau by bus from Abuja. Fly Lagos → Abuja
// (return paid once), then Mallam Garba's bus from Wuse up to Jos (the city loads first, ₦6,000 once, 4 h 30, map of
// Nigeria); Terminus's draw-call budget; the Shere Hills found from the road; the Potato Run (paid once); Mama
// Rifkatu's produce stall shift in its own words ("Market trading", 8 orders, perfect: pay + tip once, the trading
// skill); strawberries; the Plateau Walk (locked, in order, paid once); Rock City Unplugged in Events; renting and
// entering the Terminus room; reload; then Dauda's bus back down to Abuja. Ticket and bus money is topped up directly.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('jos');
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
// the airport staff at each end (data in lagosAirport.ts / abujaAirport.ts)
const STAFF = { 'lagos-airport': ['ifeoma', 'officer-musa', 'bisola'], 'abuja-airport': ['zainab', 'officer-bello', 'ifeanyi'] };
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
await p.fill('#name', 'Nanpon');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 8 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 320000, ledger: [{ id: 'test-topup', amount: 320000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── fly to Abuja first
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-abv"] button:has-text("Book return")', { timeout: 30000 });
await p.click('.flight[data-route="los-abv"] button:has-text("Book return")');
await p.click('.flight[data-route="los-abv"] button:has-text("Confirm")');
await sleep(400);
await S(() => window.__retreva.store.getState().closePanel());
await go('lagos-airport');
await fly('abuja-wuse');
let s = await st();
log('you land in Wuse with the return ticket', s.dest === 'abuja-wuse' && s.ticket?.routeId === 'abv-los');

// ── the bus up to Jos
log('Jos is not loaded yet (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('jos'))));
await setTime(1440 + 10 * 60);
const t0 = await S(() => window.__retreva.store.getState().world.time);
await talk('mallam-garba');
await choose('Take the bus to Jos');
await p.waitForSelector('button[aria-label="Bus to Jos for ₦6,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Jos for ₦6,000"]');
await p.waitForSelector('.coach-transit', { timeout: 10000 }).catch(() => {});
await sleep(800);
const nigeria = (await p.isVisible('.coach-transit svg text:has-text("NIGERIA")')) && (await p.isVisible('.coach-transit svg text:has-text("Jos")'));
await p.screenshot({ path: `${OUT}/bus-to-jos.png` });
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'jos-terminus' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Mallam Garba’s bus takes you up to Jos for ₦6,000 in 4 h 30, on the map of Nigeria (the city loads first)', nigeria && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -6000).length === 1 && t1 - t0 === 270, `+${t1 - t0} min`);
await shot('terminus-arrival');
await sleep(1500);
const perf = await S(() => window.__retreva.runtime.perf);
log('Terminus stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── the Shere Hills from the road
await place(0, -37, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.05; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('jos-shere'), null, { timeout: 20000 }).catch(() => {});
log('the Shere Hills are found at the end of the road', (await st()).discovered.includes('jos-shere'));
await shot('shere-hills');

// ── the Potato Run
await setTime(2 * 1440 + 9 * 60);
await talk('pa-gyang');
await choose("I'll carry it");
await talk('mama-rifkatu');
await choose('Hand over the basket');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:potato-run:'));
log('the Potato Run pays once (₦2,200 or more)', run.length === 1 && run[0][1] >= 2200, JSON.stringify(run));

// ── the produce stall shift
await talk('mama-rifkatu');
await choose('Help at the stall (shift)');
await p.waitForSelector('.shift .ticket');
const head1 = await p.textContent('.shift .sheet-head');
log('the stall speaks trading: “Market trading level”, not cooking', /Market trading level 1/.test(head1) && !/Cooking/.test(head1), head1.slice(0, 80));
await shot('produce-shift');
for (let i = 0; i < 8; i++) {
  const cur = await S(() => window.__retreva.store.getState().shift);
  await S(() => { const st = window.__retreva.store; const r = st.getState().shift; st.setState({ shift: { ...r, deadline: Date.now() + 60000 } }); });
  await p.click(`.dish[data-dish="${cur.orders[cur.index]}"]`);
  await sleep(150);
}
await p.waitForSelector('.shift-done');
s = await st();
const o = await S(() => window.__retreva.store.getState().shift.outcome);
const xp = await S(() => window.__retreva.store.getState().life.skills.trading ?? 0);
log('a perfect stall shift: 8 × ₦220 + ₦450 tip, paid once, Market trading XP', o.served === 8 && o.pay === 1760 && o.tip === 450 && s.ledger.filter(([id]) => id.startsWith('shift:produce-stall:')).length === 1 && xp > 0, JSON.stringify({ pay: o.pay, tip: o.tip, xp }));
await p.click('.shift-done button:has-text("Done")');
await sleep(400);

// ── strawberries
await talk('mama-rifkatu');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Jos strawberries"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Jos strawberries"]');
await sleep(400);
s = await st();
log('Jos strawberries are ₦1,500 and go in the bag', preFood - s.bal === 1500 && s.bag.includes('strawberries'));
await S(() => window.__retreva.store.getState().closePanel());

// ── the Plateau Walk
await talk('ladi');
log('Ladi wants a guide who already knows Jos (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[-4.6, -10, -Math.PI / 2], [-4.6, 6, -Math.PI / 2], [4.6, -12, Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['jos-museum', 'jos-motna', 'jos-produce'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
await shot('museum');
await talk('ladi');
await choose('Guide Ladi');
s = await st();
log('with the sights found, Ladi hires you', s.active?.jobId === 'plateau-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('ladi');
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
const stops = [[-4.4, -10], [-4.4, 6], [4.4, -12]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('the museum, the old buildings, the produce market — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('ladi');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:plateau-walk:'));
log('the Plateau Walk pays once (₦3,800 or more)', walk.length === 1 && walk[0][1] >= 3800, JSON.stringify(walk));

// ── Rock City Unplugged in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="jos-unplugged"]', { timeout: 10000 }).catch(() => {});
log('the Events app lists Rock City Unplugged', await p.isVisible('.event-card[data-event="jos-unplugged"]'));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the Terminus room and go in
await place(5.0, 9.6, Math.PI / 2);
await near('terminus-room-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Terminus room (₦7,000) and walk inside', s.homes.includes('terminus-room') && s.inside?.interiorId === 'terminus-room' && s.ledger.some(([id, a]) => id === 'home:terminus-room' && a === -7000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then the bus back down to Abuja
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue in Jos with your flight home still held', s.dest === 'jos-terminus' && s.ticket?.routeId === 'abv-los');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
await talk('conductor-dauda');
await choose('Take an intercity bus');
await p.waitForSelector('button[aria-label="Bus to Abuja for ₦6,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Abuja for ₦6,000"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'abuja-wuse' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
s = await st();
log('Dauda’s bus brings you back down to Wuse for ₦6,000; two bus fares in all', s.ledger.filter(([id]) => id.startsWith('coach-')).length === 2);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
