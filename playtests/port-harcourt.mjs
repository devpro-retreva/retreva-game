// Port Harcourt playtest: the eleventh city pack, the last of Batch 3. Book Lagos → Port Harcourt (₦255,000 return, paid
// once; Benin City stays the cheaper flight fund), ID check, the Nigeria map, land on the waterfront; the draw-call
// budget; walk out on the creek jetty; the Catch to the Grill run (paid once); Pa Ebiye's smokehouse locked until then,
// three racks in order (paid once, "Fish smoking" skill); bole and fish; the Garden City Walk (locked, in order, paid
// once); a ticket for the sunset creek cruise (paid once) and the cruise itself from the jetty (to 19:00, joy, ticket
// used); renting and entering the Creekside room; reload; then Ibim's bus to Enugu (₦10,000 once, 4 h 30, map of
// Nigeria). Ticket and bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('port-harcourt');
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
  return { tickets: s.world.tickets ?? [], joy: s.life.needs.joy, time: s.world.time, phase: s.phase, ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]), ticket: s.travel.ticket, history: s.travel.history, inside: s.world.inside, homes: s.life.homes, active: s.jobs.active, discovered: s.world.discovered, bag: s.inventory.entries.map((e) => e.itemId) };
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
// the airport staff at each end (data in lagosAirport.ts / phAirport.ts)
const STAFF = { 'lagos-airport': ['ifeoma', 'officer-musa', 'bisola'], 'ph-airport': ['ibiere', 'officer-amadi', 'tamuno'] };
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
await p.fill('#name', 'Tonye');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 9 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 300000, ledger: [{ id: 'test-topup', amount: 300000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── book in the Travel app
log('Port Harcourt is not loaded at the start (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('port-harcourt'))));
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-phc"] button:has-text("Book return")', { timeout: 30000 });
log('the Port Harcourt flight is listed and its city pack loads for booking', await S(() => window.__retreva.cities.isCityLoaded('port-harcourt')));
let s = await st();
const pre = s.bal;
await p.click('.flight[data-route="los-phc"] button:has-text("Book return")');
await p.click('.flight[data-route="los-phc"] button:has-text("Confirm")');
await sleep(400);
s = await st();
log('a return ticket costs ₦255,000 once', pre - s.bal === 255000 && s.ledger.filter(([id]) => id.startsWith('flight:los-phc:')).length === 1 && s.ticket?.routeId === 'los-phc');
await S(() => window.__retreva.store.getState().closePanel());

// ── fly
await go('lagos-airport');
const out = await fly('ph-waterfront');
log('check-in asks for an ID card for Port Harcourt (GC 312), gate A2', /ID card, please/.test(out.line) && /Port Harcourt \(GC 312\)/.test(out.line) && /gate A2/.test(out.boardLine), out.line.slice(0, 120));
log('the flight is drawn on a map of Nigeria', out.nigeriaMap);
s = await st();
log('you land on the waterfront; the return ticket waits', s.dest === 'ph-waterfront' && s.ticket?.routeId === 'phc-los', s.dest);
await shot('waterfront-arrival');
await sleep(1500);
const perf = await S(() => window.__retreva.runtime.perf);
log('the waterfront stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── out on the jetty
const hold = async (key, ms) => { await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); await sleep(300); };
await place(7.6, -8, Math.PI / 2);
await S(() => { window.__retreva.runtime.camera.yaw = Math.PI / 2; });
await sleep(600);
const trail = [];
let pl;
for (let i = 0; i < 4; i++) {
  await hold('KeyW', 3000);
  pl = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z }));
  trail.push(pl.x.toFixed(2));
  if (pl.x > 11) break;
}
log('you can walk out along the creek jetty', pl.x > 10 && Math.abs(pl.z + 8) < 1.2, `x ${trail.join(' → ')}`);
await shot('jetty');

// ── Catch to the Grill, then the smokehouse
await setTime(1440 + 10 * 60);
await talk('pa-ebiye');
log('Pa Ebiye won’t show you the kiln before you’ve helped with the catch', !(await p.isVisible('button.choice:has-text("Work the kiln")')));
await choose('I will');
await talk('boma');
await choose("I'll carry it");
await talk('mama-bole');
await choose('Hand over the basket');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:catch-to-grill:'));
log('Catch to the Grill pays once (₦2,400 or more)', run.length === 1 && run[0][1] >= 2400, JSON.stringify(run));
await talk('pa-ebiye');
await choose('Work the kiln');
await p.waitForSelector('.repair .ticket');
const head1 = await p.textContent('.repair .sheet-head');
log('the smokehouse speaks smoke: “Fish smoking level”, “Rack 1 of 3”', /Smokehouse · Pa Ebiye · Fish smoking level 1/.test(head1) && /Rack 1 of 3/.test(await p.textContent('.repair .ticket')), head1.slice(0, 80));
await shot('smokehouse');
const ORDER = { 'Catfish rack': ['Gut the fish', 'Wash in salt water', 'Lay on the rack', 'Feed the fire', 'Turn and smoke'], 'Bonga rack': ['Wash in salt water', 'Lay on the rack', 'Feed the fire', 'Turn and smoke', 'Pack in baskets'], 'Croaker rack': ['Gut the fish', 'Score the sides', 'Lay on the rack', 'Feed the fire', 'Turn and smoke'] };
for (let rack = 0; rack < 3; rack++) {
  await S(() => { const st = window.__retreva.store; st.setState({ repair: { ...st.getState().repair, deadline: Date.now() + 120000 } }); });
  const name = await p.getAttribute('.repair .ticket', 'data-device');
  for (const step of ORDER[name]) {
    await p.click(`.repair-grid button[data-step="${step}"]`);
    await sleep(150);
  }
  await sleep(300);
}
await p.waitForSelector('.repair .shift-done');
const done = await p.textContent('.repair .shift-done');
s = await st();
log('three racks smoked, paid once, and the smoking skill grows', /Smoked 3 of 3 racks/.test(done) && s.ledger.filter(([id]) => id.startsWith('repair:fish-kiln:')).length === 1 && (await S(() => window.__retreva.store.getState().life.skills.smoking ?? 0)) > 0, done.slice(0, 80));
await p.click('.repair .shift-done button:has-text("Done")');

// ── bole and fish
await talk('mama-bole');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Bole & fish"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Bole & fish"]');
await sleep(400);
s = await st();
log('bole & fish is ₦2,500 and goes in the bag', preFood - s.bal === 2500 && s.bag.includes('bole-fish'));
await S(() => window.__retreva.store.getState().closePanel());

// ── the Garden City Walk
await talk('bisi-ph');
log('Bisi wants a guide who already knows the waterfront (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[-5.0, -22, -Math.PI / 2], [-5.0, 4, -Math.PI / 2], [6.6, 14, Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['phc-mileone', 'phc-boro', 'phc-beach'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
await talk('bisi-ph');
await choose('Guide Bisi');
s = await st();
log('with the sights found, Bisi hires you', s.active?.jobId === 'garden-city-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('bisi-ph');
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
const stops = [[-4.8, -22], [-4.8, 4], [6.4, 13]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('Mile One, Isaac Boro Park, the beach — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('bisi-ph');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:garden-city-walk:'));
log('the Garden City Walk pays once (₦4,200 or more)', walk.length === 1 && walk[0][1] >= 4200, JSON.stringify(walk));

// ── the sunset creek cruise: a ticket in the Events app, then the boat from the jetty
await setTime(1440 + 14 * 60);
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="creek-cruise"] button[data-act="ticket"]', { timeout: 10000 });
const preT = (await st()).bal;
await p.click('.event-card[data-event="creek-cruise"] button[data-act="ticket"]');
await p.click('button[data-act="confirm-ticket"]');
await sleep(300);
s = await st();
log('a cruise ticket costs ₦4,500 once', preT - s.bal === 4500 && s.ledger.filter(([id]) => id.startsWith('ticket:creek-cruise:')).length === 1);
await S(() => window.__retreva.store.getState().closePanel());
await setTime(1440 + 17 * 60 + 10);
await S(() => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, joy: 40, energy: 80 } } }); });
await place(6.4, -4.2, Math.PI / 2);
await near('creek-cruise-gate');
await p.keyboard.press('KeyE');
await p.waitForSelector('button[data-act="attend"]', { timeout: 10000 });
await p.click('button[data-act="attend"]');
await p.waitForFunction(() => window.__retreva.store.getState().resting?.at === 'event', null, { timeout: 5000 }).catch(() => {});
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 20000 });
s = await st();
log('the cruise: time moves to 19:00, joy +30, the ticket is used', s.time === 1440 + 19 * 60 && Math.round(s.joy) >= 70 && s.tickets.some((t) => t.eventId === 'creek-cruise' && t.status === 'used'), `time=${s.time} joy=${s.joy.toFixed(0)}`);

// ── rent the Creekside room and go in
await setTime(1440 + 19 * 60 + 30);
await place(-5.0, 16.4, -Math.PI / 2);
await near('creek-room-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Creekside room (₦9,000) and walk inside', s.homes.includes('creek-room') && s.inside?.interiorId === 'creek-room' && s.ledger.some(([id, a]) => id === 'home:creek-room' && a === -9000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then the bus to Enugu
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue on the waterfront with your ticket home', s.dest === 'ph-waterfront' && s.ticket?.routeId === 'phc-los');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
const t0 = await S(() => window.__retreva.store.getState().world.time);
await talk('driver-ibim');
await choose('Take the bus to Enugu');
await p.waitForSelector('button[aria-label="Bus to Enugu for ₦10,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Enugu for ₦10,000"]');
await p.waitForSelector('.coach-transit', { timeout: 10000 }).catch(() => {});
await sleep(800);
const nigeria = (await p.isVisible('.coach-transit svg text:has-text("NIGERIA")')) && (await p.isVisible('.coach-transit svg text:has-text("Port Harcourt")'));
await p.screenshot({ path: `${OUT}/bus-to-enugu.png` });
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'enugu-ogui' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Ibim’s bus goes to Enugu for ₦10,000 in four and a half hours, on the map of Nigeria', nigeria && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -10000).length === 1 && t1 - t0 === 270, `+${t1 - t0} min`);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
