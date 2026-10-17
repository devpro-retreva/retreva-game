// Abuja playtest: the first domestic flight and the fourth city pack. Book Lagos → Abuja (₦270,000 return,
// confirm, paid once; the pack loads for booking), check-in asks for an ID card instead of a passport, the
// Nigeria map, land in Wuse, the draw-call budget, the Pepper Run (paid once), Mallam Sani's suya, the
// Capital Walk (locked until the sights are found, led in order, paid once), the Aso Rock view, Suya Night
// in the Events app, rent and walk into the Wuse studio, reload in Abuja, the green taxi to the airport and
// the flight home. Ticket money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('abuja');
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
await p.fill('#name', 'Tobenna');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(10 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 330000, ledger: [{ id: 'test-topup', amount: 330000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── book in the Travel app
log('Abuja is not loaded at the start (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('abuja'))));
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-abv"]');
await p.waitForSelector('.flight[data-route="los-abv"] button:has-text("Book return")', { timeout: 30000 });
log('the Abuja flight is listed and its city pack loads for booking', await S(() => window.__retreva.cities.isCityLoaded('abuja')));
const card = await p.textContent('.flight[data-route="los-abv"]');
log('the card says domestic, ID card, no passport — and is honest about the terminal', /Domestic · ID card, no passport/.test(card) && /domestic terminal/.test(card), card.slice(0, 160));
await p.locator('.flight[data-route="los-abv"]').scrollIntoViewIfNeeded();
await shot('travel-card');
let s = await st();
const pre = s.bal;
await p.click('.flight[data-route="los-abv"] button:has-text("Book return")');
log('booking asks first', (await st()).bal === pre);
await p.click('.flight[data-route="los-abv"] button:has-text("Confirm")');
await sleep(400);
s = await st();
log('a return ticket costs ₦270,000 once', pre - s.bal === 270000 && s.ledger.filter(([id]) => id.startsWith('flight:los-abv:')).length === 1 && s.ticket?.routeId === 'los-abv');
await S(() => window.__retreva.store.getState().closePanel());

// ── fly
await go('lagos-airport');
const out = await fly('abuja-wuse');
log('check-in asks for an ID card, not a passport, for Abuja (GC 302)', /ID card, please/.test(out.line) && !/Passport/.test(out.line) && /Abuja \(GC 302\)/.test(out.line), out.line.slice(0, 140));
log('the gate agent boards Abuja at gate A2', /Abuja \(GC 302\), gate A2/.test(out.boardLine));
log('the flight is drawn on a map of Nigeria (the Niger and Benue meet at Lokoja)', out.nigeriaMap);
s = await st();
log('you land in Wuse; the return ticket waits', s.dest === 'abuja-wuse' && s.ticket?.routeId === 'abv-los' && s.history.length === 1, s.dest);
await shot('wuse-arrival');
await sleep(1500);
const perf = await S(() => window.__retreva.runtime.perf);
log('Wuse stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── work: the Pepper Run
await setTime(1440 + 11 * 60);
await sleep(800);
await talk('hajiya-amina');
await choose("I'll carry it");
await talk('mallam-sani');
await choose('Hand over the bag');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:pepper-run:'));
log('the Pepper Run pays once (₦2,500 or more)', run.length === 1 && run[0][1] >= 2500, JSON.stringify(run));

// ── Mallam Sani's suya
await talk('mallam-sani');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Suya with onions"]');
const preSuya = (await st()).bal;
await p.click('button[aria-label^="Buy Suya with onions"]');
await sleep(400);
s = await st();
log('suya with onions is ₦2,500 and goes in the bag', preSuya - s.bal === 2500 && s.bag.includes('abuja-suya'));
await shot('suya');
await S(() => window.__retreva.store.getState().closePanel());

// ── the Capital Walk
await talk('chidinma');
log('Chidinma wants a guide who already knows Wuse (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[3.4, 10, Math.PI / 2], [3.4, -12, Math.PI / 2], [0, -38, Math.PI]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['abv-suya', 'abv-market', 'abv-asorock'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
s = await st();
log('walking the street discovers the suya street, Wuse Market and the Aso Rock view', ['abv-suya', 'abv-market', 'abv-asorock'].every((i) => s.discovered.includes(i)));
// the view north from the end of the street
await place(0, -39, Math.PI);
await S(() => { const c = window.__retreva.runtime.camera; c.yaw = Math.PI; c.pitch = 0.08; });
await sleep(2500);
await p.screenshot({ path: `${OUT}/aso-rock.png` });
await place(-3.4, 22, 0);
await sleep(800);
await talk('chidinma');
await choose('Show her round');
s = await st();
log('with the sights found, Chidinma hires you', s.active?.jobId === 'capital-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('chidinma');
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
const stops = [[3.4, 10], [3.4, -12], [0, -37]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('suya street, market, Aso Rock view — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('chidinma');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:capital-walk:'));
log('the Capital Walk pays once (₦4,000 or more)', walk.length === 1 && walk[0][1] >= 4000, JSON.stringify(walk));

// ── Suya Night in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="suya-night"]', { timeout: 10000 }).catch(() => {});
log('the Events app lists Wuse Suya Night', await p.isVisible('.event-card[data-event="suya-night"]'));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the Wuse studio and go in
await place(5.0, 20.8, Math.PI / 2);
await near('wuse-studio-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Wuse studio (₦12,000) and walk inside', s.homes.includes('wuse-studio') && s.inside?.interiorId === 'wuse-studio' && s.ledger.some(([id, a]) => id === 'home:wuse-studio' && a === -12000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload in Abuja
await S(() => window.__retreva.saves.saveNow());
await p.reload();
await p.click('text=Continue');
await playing();
s = await st();
log('after a reload you continue in Wuse with your ticket home', s.dest === 'abuja-wuse' && s.ticket?.routeId === 'abv-los');

// ── green taxi to the airport, fly home
await talk('mallam-garba');
await choose('Take a taxi');
await p.waitForSelector('button[aria-label="Taxi to Airport for ₦12,000"]');
log('Mallam Garba drives you to the airport for ₦12,000', await p.isVisible('button[aria-label="Taxi to Airport for ₦12,000"]'));
await p.click('button[aria-label="Taxi to Airport for ₦12,000"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'abuja-airport' && g.phase === 'playing'; }, null, { timeout: 60000 });
await sleep(2000);
await shot('abuja-airport');
const home = await fly('ikeja-village');
s = await st();
log('flying home: ID card at the desk, Lagos (GC 303), landing in Ikeja, two flights logged', /ID card, please/.test(home.line) && /Lagos \(GC 303\)/.test(home.line) && s.history.length === 2 && s.ticket === null, home.line.slice(0, 120));
log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
