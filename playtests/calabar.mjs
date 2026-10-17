// Calabar playtest: the second domestic flight and the fifth city pack. Book Lagos → Calabar (₦285,000 return,
// confirm, paid once; the pack loads for booking), check-in asks for an ID card, the Nigeria map, land on the
// Marina, the draw-call budget, the Afang Run (paid once), Mma Affiong's edikang ikong, the Marina Walk (locked
// until the sights are found, led in order, paid once), the river boardwalk, Carnival Band Night in the Events
// app, rent and walk into the Marina flat, reload in Calabar, the taxi to the airport and the flight home.
// Ticket money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('calabar');
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
// the airport staff at each end (data in lagosAirport.ts / calabarAirport.ts)
const STAFF = { 'lagos-airport': ['ifeoma', 'officer-musa', 'bisola'], 'calabar-airport': ['eno', 'officer-etim', 'bassey'] };
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
await p.fill('#name', 'Ini');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(10 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 330000, ledger: [{ id: 'test-topup', amount: 330000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── book in the Travel app
log('Calabar is not loaded at the start (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('calabar'))));
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-cbq"]');
await p.waitForSelector('.flight[data-route="los-cbq"] button:has-text("Book return")', { timeout: 30000 });
log('the Calabar flight is listed and its city pack loads for booking', await S(() => window.__retreva.cities.isCityLoaded('calabar')));
const card = await p.textContent('.flight[data-route="los-cbq"]');
log('the card says domestic, ID card, no passport — and is honest about the terminal', /Domestic · ID card, no passport/.test(card) && /domestic terminal/.test(card), card.slice(0, 160));
await p.locator('.flight[data-route="los-cbq"]').scrollIntoViewIfNeeded();
await shot('travel-card');
let s = await st();
const pre = s.bal;
await p.click('.flight[data-route="los-cbq"] button:has-text("Book return")');
log('booking asks first', (await st()).bal === pre);
await p.click('.flight[data-route="los-cbq"] button:has-text("Confirm")');
await sleep(400);
s = await st();
log('a return ticket costs ₦285,000 once', pre - s.bal === 285000 && s.ledger.filter(([id]) => id.startsWith('flight:los-cbq:')).length === 1 && s.ticket?.routeId === 'los-cbq');
await S(() => window.__retreva.store.getState().closePanel());

// ── fly
await go('lagos-airport');
const out = await fly('calabar-marina');
log('check-in asks for an ID card, not a passport, for Calabar (GC 306)', /ID card, please/.test(out.line) && !/Passport/.test(out.line) && /Calabar \(GC 306\)/.test(out.line), out.line.slice(0, 140));
log('the gate agent boards Calabar at gate A4', /Calabar \(GC 306\), gate A4/.test(out.boardLine));
log('the flight is drawn on a map of Nigeria (the Niger and Benue meet at Lokoja)', out.nigeriaMap);
s = await st();
log('you land on the Marina; the return ticket waits', s.dest === 'calabar-marina' && s.ticket?.routeId === 'cbq-los' && s.history.length === 1, s.dest);
await shot('marina-arrival');
await sleep(1500);
const perf = await S(() => window.__retreva.runtime.perf);
log('the Marina stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── work: the Afang Run
await setTime(1440 + 11 * 60);
await sleep(800);
await talk('ekaette');
await choose("I'll carry it");
await talk('mma-affiong');
await choose('Hand over the basket');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:afang-run:'));
log('the Afang Run pays once (₦2,400 or more)', run.length === 1 && run[0][1] >= 2400, JSON.stringify(run));

// ── Mma Affiong's chop house
await talk('mma-affiong');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Edikang ikong"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Edikang ikong"]');
await sleep(400);
s = await st();
log('edikang ikong & fufu is ₦3,000 and goes in the bag', preFood - s.bal === 3000 && s.bag.includes('edikang-ikong'));
await shot('chop-house');
await S(() => window.__retreva.store.getState().closePanel());

// ── the river boardwalk, on foot
const hold = async (key, ms) => { await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); await sleep(300); };
await place(7.6, -20, Math.PI / 2);
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
log('you can walk out along the river boardwalk', pl.x > 10 && Math.abs(pl.z + 20) < 1.2, `x ${trail.join(' → ')}, z ${pl.z.toFixed(2)}`);
await shot('boardwalk');

// ── the Marina Walk
await talk('tolani');
log('Tolani wants a guide who already knows the Marina (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[6.6, 4, Math.PI / 2], [-4.6, -8, -Math.PI / 2], [-4.6, -32, -Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['cbq-marina', 'cbq-museum', 'cbq-residency'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
s = await st();
log('walking the Marina discovers the port front, the museum and the Old Residency', ['cbq-marina', 'cbq-museum', 'cbq-residency'].every((i) => s.discovered.includes(i)));
await place(3.4, 30, 0);
await sleep(800);
await talk('tolani');
await choose('Guide Tolani');
s = await st();
log('with the sights found, Tolani hires you', s.active?.jobId === 'marina-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('tolani');
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
const stops = [[6.4, 4], [-4.6, -8], [-4.6, -32]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('port front, museum, Old Residency — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('tolani');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:marina-walk:'));
log('the Marina Walk pays once (₦4,000 or more)', walk.length === 1 && walk[0][1] >= 4000, JSON.stringify(walk));

// ── Carnival Band Night in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="carnival-night"]', { timeout: 10000 }).catch(() => {});
log('the Events app lists Carnival Band Night', await p.isVisible('.event-card[data-event="carnival-night"]'));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the Marina flat and go in
await place(-5.0, 4.5, -Math.PI / 2);
await near('marina-flat-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Marina flat (₦10,000) and walk inside', s.homes.includes('marina-flat') && s.inside?.interiorId === 'marina-flat' && s.ledger.some(([id, a]) => id === 'home:marina-flat' && a === -10000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload in Calabar
await S(() => window.__retreva.saves.saveNow());
await p.reload();
await p.click('text=Continue');
await playing();
s = await st();
log('after a reload you continue on the Marina with your ticket home', s.dest === 'calabar-marina' && s.ticket?.routeId === 'cbq-los');

// ── taxi to the airport, fly home
await talk('okokon');
await choose('Take a taxi');
await p.waitForSelector('button[aria-label="Taxi to Airport for ₦5,000"]');
log('Okokon drives you to the airport for ₦5,000', await p.isVisible('button[aria-label="Taxi to Airport for ₦5,000"]'));
await p.click('button[aria-label="Taxi to Airport for ₦5,000"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'calabar-airport' && g.phase === 'playing'; }, null, { timeout: 60000 });
await sleep(2000);
await shot('calabar-airport');
const home = await fly('ikeja-village');
s = await st();
log('flying home: ID card at the desk, Lagos (GC 307), landing in Ikeja, two flights logged', /ID card, please/.test(home.line) && /Lagos \(GC 307\)/.test(home.line) && s.history.length === 2 && s.ticket === null, home.line.slice(0, 120));
log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
