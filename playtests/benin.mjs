// Benin City playtest: the ninth city pack, by domestic flight (now the cheapest return from Lagos) and home by the
// long bus. Book Lagos → Benin City (₦210,000 return, confirm, paid once; the pack loads), ID check, the Nigeria map,
// land at King's Square; the draw-call budget; the old moat found from the road; the casting house locked until the
// Charcoal Run (paid once), then three castings by the lost-wax method (paid once, "Bronze casting" skill); black soup
// at Ivie's; the Coming Home tour (locked, in order, paid once); Highlife at King's Square in Events; renting and
// entering the room; reload; then Uyi's six-hour bus back to Ojota (₦26,000 once, on the map of Nigeria) instead of the
// return flight. Ticket and bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('benin');
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
// the airport staff at each end (data in lagosAirport.ts / beninAirport.ts)
const STAFF = { 'lagos-airport': ['ifeoma', 'officer-musa', 'bisola'], 'benin-airport': ['ivie', 'officer-osaro', 'omoruyi'] };
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

const bus = async (npc, label, to) => {
  await talk(npc);
  await choose('Take an intercity bus');
  await p.waitForSelector(`button[aria-label="${label}"]:not([disabled])`, { timeout: 30000 }).catch(() => {});
  const shown = await p.isVisible(`button[aria-label="${label}"]`);
  await shot(`bus-panel-${to}`);
  await p.click(`button[aria-label="${label}"]`);
  await p.waitForSelector('.coach-transit', { timeout: 10000 }).catch(() => {});
  await sleep(800);
  const map = await p.isVisible('.coach-transit svg[aria-label^="Bus route from"]');
  await p.screenshot({ path: `${OUT}/bus-ride-${to}.png` });
  await p.waitForFunction((a) => { const g = window.__retreva.store.getState(); return g.destinationId === a && g.phase === 'playing' && g.ui === 'play'; }, to, { timeout: 60000 });
  await sleep(2500);
  return { shown, map };
};
const budget = async (name) => {
  await sleep(1500);
  const perf = await S(() => window.__retreva.runtime.perf);
  log(`${name} stays within budget (≤ 80 draw calls, ≤ 60k triangles)`, perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));
};

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Osas');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 10 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 260000, ledger: [{ id: 'test-topup', amount: 260000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── the First flight fund now points at Benin City
await S(() => window.__retreva.store.getState().openPhone('jobs'));
await p.click('button[role="tab"]:has-text("Goals")');
await p.waitForSelector('.goal-row:has-text("First flight fund")');
const fundRow = (await p.textContent('.goal-row:has-text("First flight fund")')) ?? '';
log('the First flight fund counts towards the ₦210,000 Benin City return', /₦210,000/.test(fundRow) && /Benin City is the cheapest/.test(fundRow), fundRow.trim().slice(0, 120));
await S(() => window.__retreva.store.getState().closePanel());

// ── book in the Travel app
log('Benin City is not loaded at the start (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('benin'))));
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-bni"] button:has-text("Book return")', { timeout: 30000 });
log('the Benin City flight is listed and its city pack loads for booking', await S(() => window.__retreva.cities.isCityLoaded('benin')));
log('the Travel app also lists the bus to Benin City from Ikeja (₦26,000)', (await p.textContent('[data-coach="benin-kings-square"]')).includes('₦26,000'));
let s = await st();
const pre = s.bal;
await p.click('.flight[data-route="los-bni"] button:has-text("Book return")');
await p.click('.flight[data-route="los-bni"] button:has-text("Confirm")');
await sleep(400);
s = await st();
log('a return ticket costs ₦210,000 once', pre - s.bal === 210000 && s.ledger.filter(([id]) => id.startsWith('flight:los-bni:')).length === 1 && s.ticket?.routeId === 'los-bni');
await S(() => window.__retreva.store.getState().closePanel());

// ── fly
await go('lagos-airport');
const out = await fly('benin-kings-square');
log('check-in asks for an ID card for Benin City (GC 308), gate A1', /ID card, please/.test(out.line) && /Benin City \(GC 308\)/.test(out.line) && /gate A1/.test(out.boardLine), out.line.slice(0, 120));
log('the flight is drawn on a map of Nigeria', out.nigeriaMap);
s = await st();
log('you land at King’s Square; the return ticket waits', s.dest === 'benin-kings-square' && s.ticket?.routeId === 'bni-los', s.dest);
await shot('kings-square-arrival');
await sleep(1500);
const perf = await S(() => window.__retreva.runtime.perf);
log('King’s Square stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── the moat, from the road
await place(0, -37, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.1; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('bnn-moat'), null, { timeout: 20000 }).catch(() => {});
log('the old city moat is found at the end of the road', (await st()).discovered.includes('bnn-moat'));
await shot('moat');

// ── the Charcoal Run, then the casting house
await setTime(1440 + 12 * 60);
await talk('pa-osayande');
log('Pa Osayande won’t let you cast before the Charcoal Run', !(await p.isVisible('button.choice:has-text("Cast some bronze")')));
await choose('I will');
await talk('mama-osas');
await choose("I'll carry it");
await talk('pa-osayande');
await choose('Hand over the sack');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:charcoal-run:'));
log('the Charcoal Run pays once (₦2,200 or more)', run.length === 1 && run[0][1] >= 2200, JSON.stringify(run));
await talk('pa-osayande');
await choose('Cast some bronze');
await p.waitForSelector('.repair .ticket');
const head1 = await p.textContent('.repair .sheet-head');
log('the casting house speaks bronze: “Bronze casting level”, “Casting 1 of 3”', /Bronze · Pa Osayande · Bronze casting level 1/.test(head1) && /Casting 1 of 3/.test(await p.textContent('.repair .ticket')), head1.slice(0, 80));
await shot('casting-house');
const ORDER = { 'Small bronze head': ['Model in wax', 'Coat in clay', 'Melt out the wax', 'Pour the bronze', 'Break the mould'], 'Court plaque': ['Shape the wax plaque', 'Add the figures', 'Coat in clay', 'Pour the bronze', 'Chase the details'], 'Leopard bell': ['Make the clay core', 'Wax over the core', 'Coat in clay', 'Pour the bronze', 'File and polish'] };
for (let piece = 0; piece < 3; piece++) {
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
log('three castings, paid once, and the casting skill grows', /Cast 3 of 3 castings/.test(done) && s.ledger.filter(([id]) => id.startsWith('repair:bronze-workshop:')).length === 1 && (await S(() => window.__retreva.store.getState().life.skills.casting ?? 0)) > 0, done.slice(0, 80));
await p.click('.repair .shift-done button:has-text("Done")');

// ── Ivie's Kitchen
await talk('ivie-cook');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Black soup"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Black soup"]');
await sleep(400);
s = await st();
log('black soup & pounded yam is ₦2,600 and goes in the bag', preFood - s.bal === 2600 && s.bag.includes('black-soup'));
await S(() => window.__retreva.store.getState().closePanel());

// ── Coming Home
await talk('nosa');
log('Nosa wants a guide who already knows the square (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[-4.6, -8, -Math.PI / 2], [4.6, -12, Math.PI / 2], [-4.6, 14, -Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['bnn-museum', 'bnn-igun', 'bnn-emotan'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
await shot('emotan');
await talk('nosa');
await choose('Guide Nosa');
s = await st();
log('with the sights found, Nosa hires you', s.active?.jobId === 'kings-square-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('nosa');
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
const stops = [[-4.4, -8], [4.4, -12], [-4.4, 14]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('the museum, Igun Street, Emotan — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('nosa');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:kings-square-walk:'));
log('Coming Home pays once (₦4,000 or more)', walk.length === 1 && walk[0][1] >= 4000, JSON.stringify(walk));

// ── Highlife in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="benin-highlife-night"]', { timeout: 10000 }).catch(() => {});
log('the Events app lists Highlife at King’s Square', await p.isVisible('.event-card[data-event="benin-highlife-night"]'));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the room and go in
await place(5.0, 12.4, Math.PI / 2);
await near('kings-square-room-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the King’s Square room (₦7,000) and walk inside', s.homes.includes('kings-square-room') && s.inside?.interiorId === 'kings-square-room' && s.ledger.some(([id, a]) => id === 'home:kings-square-room' && a === -7000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then the long bus home instead of the flight
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue at King’s Square with your ticket home', s.dest === 'benin-kings-square' && s.ticket?.routeId === 'bni-los');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
const t0 = await S(() => window.__retreva.store.getState().world.time);
await talk('driver-uyi');
await choose('Take the bus to Lagos');
await p.waitForSelector('button[aria-label="Bus to Lagos for ₦26,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Lagos for ₦26,000"]');
await p.waitForSelector('.coach-transit', { timeout: 10000 }).catch(() => {});
await sleep(800);
const nigeria = await p.isVisible('.coach-transit svg text:has-text("NIGERIA")') && await p.isVisible('.coach-transit svg text:has-text("Benin City")');
await p.screenshot({ path: `${OUT}/bus-to-lagos.png` });
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'ikeja-village' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Uyi’s bus goes to Lagos (Ojota, Ikeja) for ₦26,000 in six hours, drawn on the map of Nigeria', nigeria && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -26000).length === 1 && t1 - t0 === 360, `+${t1 - t0} min`);
log('the unused return flight is still yours', s.ticket?.routeId === 'bni-los');

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
