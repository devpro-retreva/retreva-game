// Kano playtest: the twelfth city pack, by domestic flight. Book Lagos → Kano (₦265,000 return, paid once; Benin
// City stays the cheaper flight fund), ID check, the Nigeria map, land by Kurmi Market in the old city; the draw-call
// budget; the gate in the old city wall found from the road; Malam Bashir's leather workshop locked until the Hide
// Run (paid once), then three pieces in order (paid once, "Leatherwork" skill, bench in its own words); tuwo and miyan
// kuka; the Old City Walk (locked, in order, paid once); the Durbar in Events, honest about Sallah; renting and entering
// the Kurmi room; reload; Musa's taxi to the airport (₦5,000) and the flight home (GC 315). Ticket money is topped up
// directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('kano');
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
// the airport staff at each end (data in lagosAirport.ts / kanoAirport.ts)
const STAFF = { 'lagos-airport': ['ifeoma', 'officer-musa', 'bisola'], 'kano-airport': ['rakiya', 'officer-lawan', 'nura'] };
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
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 300000, ledger: [{ id: 'test-topup', amount: 300000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── book in the Travel app
log('Kano is not loaded at the start (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('kano'))));
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-kan"] button:has-text("Book return")', { timeout: 30000 });
log('the Kano flight is listed and its city pack loads for booking', await S(() => window.__retreva.cities.isCityLoaded('kano')));
let s = await st();
const pre = s.bal;
await p.click('.flight[data-route="los-kan"] button:has-text("Book return")');
await p.click('.flight[data-route="los-kan"] button:has-text("Confirm")');
await sleep(400);
s = await st();
log('a return ticket costs ₦265,000 once', pre - s.bal === 265000 && s.ledger.filter(([id]) => id.startsWith('flight:los-kan:')).length === 1 && s.ticket?.routeId === 'los-kan');
await S(() => window.__retreva.store.getState().closePanel());

// ── fly
await go('lagos-airport');
const out = await fly('kano-kurmi');
log('check-in asks for an ID card for Kano (GC 314), gate A3', /ID card, please/.test(out.line) && /Kano \(GC 314\)/.test(out.line) && /gate A3/.test(out.boardLine), out.line.slice(0, 120));
log('the flight is drawn on a map of Nigeria', out.nigeriaMap);
s = await st();
log('you land by Kurmi Market; the return ticket waits', s.dest === 'kano-kurmi' && s.ticket?.routeId === 'kan-los', s.dest);
await shot('kurmi-arrival');
await sleep(1500);
const perf = await S(() => window.__retreva.runtime.perf);
log('the old city stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── the gate in the old city wall
await place(0, -36, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.05; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('kan-gate'), null, { timeout: 20000 }).catch(() => {});
log('the gate in the old city wall is found at the end of the road', (await st()).discovered.includes('kan-gate'));
await shot('city-wall');

// ── the Hide Run, then the leather workshop
await setTime(1440 + 12 * 60);
await talk('malam-bashir');
log('Malam Bashir won’t let you work leather before the Hide Run', !(await p.isVisible('button.choice:has-text("Work the leather")')));
await choose('I will');
await talk('baba-audu');
await choose("I'll carry it");
await talk('malam-bashir');
await choose('Hand over the hides');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:hide-run:'));
log('the Hide Run pays once (₦2,200 or more)', run.length === 1 && run[0][1] >= 2200, JSON.stringify(run));
await talk('malam-bashir');
await choose('Work the leather');
await p.waitForSelector('.repair .ticket');
const head1 = await p.textContent('.repair .sheet-head');
log('the workshop speaks leather: “Leatherwork level”, “Piece 1 of 3”', /Leather · Malam Bashir · Leatherwork level 1/.test(head1) && /Piece 1 of 3/.test(await p.textContent('.repair .ticket')), head1.slice(0, 80));
await shot('leather-workshop');
const ORDER = { Sandals: ['Cut the soles', 'Cut the straps', 'Stitch the straps', 'Glue the soles', 'Polish'], Pouffe: ['Cut the panels', 'Dye the leather', 'Stitch the pattern', 'Sew it together', 'Stuff and close'], Wallet: ['Cut the pieces', 'Tool the design', 'Dye the leather', 'Stitch the edges', 'Burnish the edges'] };
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
log('three pieces, paid once, and the leatherwork skill grows', /Made 3 of 3 pieces/.test(done) && s.ledger.filter(([id]) => id.startsWith('repair:leather-workshop:')).length === 1 && (await S(() => window.__retreva.store.getState().life.skills.leatherwork ?? 0)) > 0, done.slice(0, 80));
await p.click('.repair .shift-done button:has-text("Done")');

// ── Mama Hadiza
await talk('mama-hadiza');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Tuwo"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Tuwo"]');
await sleep(400);
s = await st();
log('tuwo & miyan kuka is ₦2,000 and goes in the bag', preFood - s.bal === 2000 && s.bag.includes('tuwo-kuka'));
await S(() => window.__retreva.store.getState().closePanel());

// ── the Old City Walk
await talk('yetunde');
log('Yetunde wants a guide who already knows the old city (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[4.6, -2, Math.PI / 2], [-4.6, -14, -Math.PI / 2], [-4.6, 12, -Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['kan-dyepits', 'kan-kurmi', 'kan-palace'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
await shot('palace');
await talk('yetunde');
await choose('Guide Yetunde');
s = await st();
log('with the sights found, Yetunde hires you', s.active?.jobId === 'old-city-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('yetunde');
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
const stops = [[4.4, -2], [-4.4, -14], [-4.4, 12]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('dye pits, Kurmi Market, the Emir’s palace — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('yetunde');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:old-city-walk:'));
log('the Old City Walk pays once (₦4,000 or more)', walk.length === 1 && walk[0][1] >= 4000, JSON.stringify(walk));

// ── the Durbar in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="kano-durbar"]', { timeout: 10000 }).catch(() => {});
const card = (await p.textContent('.event-card[data-event="kano-durbar"]').catch(() => '')) ?? '';
log('the Events app lists the Durbar and says it really rides at the Sallah festivals', /Sallah/.test(card), card.slice(0, 120));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the Kurmi room and go in
await place(5.0, 9.6, Math.PI / 2);
await near('kurmi-room-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Kurmi room (₦6,500) and walk inside', s.homes.includes('kurmi-room') && s.inside?.interiorId === 'kurmi-room' && s.ledger.some(([id, a]) => id === 'home:kurmi-room' && a === -6500));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then the taxi to the airport and home
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue in the old city with your ticket home', s.dest === 'kano-kurmi' && s.ticket?.routeId === 'kan-los');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
await talk('driver-musa');
await choose('Take a taxi');
await p.waitForSelector('button[aria-label="Taxi to Airport for ₦5,000"]', { timeout: 30000 }).catch(() => {});
log('Musa drives you to the airport for ₦5,000', await p.isVisible('button[aria-label="Taxi to Airport for ₦5,000"]'));
await p.click('button[aria-label="Taxi to Airport for ₦5,000"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'kano-airport' && g.phase === 'playing'; }, null, { timeout: 60000 });
await sleep(2000);
await shot('kano-airport');
const home = await fly('ikeja-village');
s = await st();
log('flying home: ID card at the desk, Lagos (GC 315), landing in Ikeja, two flights logged', /ID card, please/.test(home.line) && /Lagos \(GC 315\)/.test(home.line) && s.history.length === 2 && s.ticket === null, home.line.slice(0, 120));

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
