// Ibadan playtest: the Lagos–Ibadan train and the sixth city pack. Book a Business return (₦13,000, confirm, paid once;
// the pack loads for booking), a danfo to Ebute Metta, a drink allowed through the bag scan, the ticket check, waiting on
// board for the 16:00, the railway map, arriving at Moniya (joy from the class, "All aboard" paid, not "Wheels up"),
// the taxi into Dugbe, the draw-call budget at both, the Dugbe Run (paid once), abula at the buka, the Grandfather's
// City tour (locked until the sights are found, led in order, paid once), Fuji Night in the Events app, renting and
// walking into the Dugbe room, reload in Ibadan, and the train home. Ticket money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('ibadan');
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
// the station staff at each end (data in lagosStation.ts / ibadanStation.ts)
const STAFF = { 'lagos-station': ['mr-ogunleye', 'officer-bisi', 'guard-femi'], 'ibadan-station': ['mrs-oyelaran', 'officer-akande', 'guard-kehinde'] };
const ride = async (to) => {
  const [inspector, security, guard] = STAFF[await S(() => window.__retreva.store.getState().destinationId)];
  await talk(inspector);
  const line = await p.textContent('.dialogue');
  await choose('Show my ticket');
  await talk(security);
  const scanLine = await p.textContent('.dialogue');
  await choose('Walk through');
  await talk(guard);
  const boardLine = await p.textContent('.dialogue');
  // record every phase the ride shows (the game runs at a few fps here, so one look could miss one)
  await S(() => { window.__phases = []; window.__ph = setInterval(() => { const v = document.querySelector('.flight-overlay')?.getAttribute('data-phase'); if (v && window.__phases.at(-1) !== v) window.__phases.push(v); }, 50); });
  await choose('Board the train');
  await p.waitForSelector('.flight-overlay');
  await sleep(1500);
  const overlay = { phase: (await S(() => window.__phases)).join(' | '), railMap: await p.isVisible('.flight-overlay text:has-text("Abeokuta")') && await p.isVisible('.flight-overlay text:has-text("Ogun River")'), skip: await p.isVisible('.flight-overlay button:has-text("Skip to arrival")') };
  await p.screenshot({ path: `${OUT}/train-${to}.png` });
  await p.evaluate(() => [...document.querySelectorAll('.flight-overlay button')].find((b) => b.textContent.includes('Skip to arrival'))?.click());
  await p.waitForFunction((a) => { const g = window.__retreva.store.getState(); return g.destinationId === a && g.phase === 'playing'; }, to, { timeout: 60000 });
  await S(() => clearInterval(window.__ph));
  await sleep(1500);
  return { line, scanLine, boardLine, overlay };
};
const taxi = async (npc, label, to) => {
  await talk(npc);
  await choose(['kunle', 'conductor-wale'].includes(npc) ? 'Take a danfo' : 'Take a taxi');
  await p.waitForSelector(`button[aria-label="${label}"]`, { timeout: 10000 }).catch(() => {});
  const shown = await p.isVisible(`button[aria-label="${label}"]`);
  await p.click(`button[aria-label^="${label.split(' for ')[0]}"]`);
  await p.waitForFunction((a) => { const g = window.__retreva.store.getState(); return g.destinationId === a && g.phase === 'playing' && g.ui === 'play'; }, to, { timeout: 60000 });
  await sleep(2500);
  return shown;
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
await p.fill('#name', 'Tayo');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 10 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 20000, ledger: [{ id: 'test-topup', amount: 20000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── book the train in the Travel app
log('Ibadan is not loaded at the start (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('ibadan'))));
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-mode="rail"]');
log('the Travel app lists trains from Ebute Metta as well as flights', await p.isVisible('h3:has-text("Trains from Ebute Metta")') && await p.isVisible('.flight[data-route="los-abv"]'));
const classes = await p.$$eval('.flight[data-mode="rail"] .seg[aria-label^="Class"] button', (bs) => bs.map((b) => b.textContent));
log('three classes: Standard, Business, First', classes.join(',') === 'Standard,Business,First', classes.join(','));
await p.click('.flight[data-mode="rail"] .seg[aria-label^="Class"] button:has-text("Business")');
await p.waitForSelector('.flight[data-route="los-ibd-b"] button:has-text("Book return")', { timeout: 30000 });
log('the Ibadan city pack loads for booking', await S(() => window.__retreva.cities.isCityLoaded('ibadan')));
const card = await p.textContent('.flight[data-route="los-ibd-b"]');
log('the card gives the timetable, the platform and the taxi on from Moniya', /leaves 08:00 and 16:00/.test(card) && /platform 2/.test(card) && /Taxi from Moniya into Dugbe/.test(card) && /no return discount/.test(card), card.slice(0, 200));
await p.locator('.flight[data-mode="rail"]').scrollIntoViewIfNeeded();
await shot('travel-card');
let s = await st();
const pre = s.bal;
await p.click('.flight[data-route="los-ibd-b"] button:has-text("Book return")');
log('booking asks first', (await st()).bal === pre);
await p.click('.flight[data-route="los-ibd-b"] button:has-text("Confirm")');
await sleep(400);
s = await st();
log('a Business return costs ₦13,000 once (two singles)', pre - s.bal === 13000 && s.ledger.filter(([id]) => id.startsWith('flight:los-ibd-b:')).length === 1 && s.ticket?.routeId === 'los-ibd-b');
await S(() => window.__retreva.store.getState().closePanel());

// ── danfo to the station
const toStation = await taxi('kunle', 'Ride to Ebute Metta for ₦300', 'lagos-station');
s = await st();
log('Kunle’s danfo goes to Ebute Metta station for ₦300', toStation && s.dest === 'lagos-station' && s.ledger.some(([, a]) => a === -300));
await shot('lagos-station');
await budget('Mobolaji Johnson Station');

// a drink in the bag is fine on a train
await talk('mama-tope');
await choose('Show me');
await p.waitForSelector('button[aria-label^="Buy Zobo"]');
await p.click('button[aria-label^="Buy Zobo"]');
await sleep(300);
await S(() => window.__retreva.store.getState().closePanel());

// ── the train: ticket check, bag scan, platform; it's 11:00, so you wait on board for the 16:00
await setTime(1440 + 11 * 60);
const before = await S(() => window.__retreva.store.getState().life.needs.joy);
const out = await ride('ibadan-station');
log('the inspector checks a Business ticket to Ibadan (WX 1) and names the next train', /Ticket, please/.test(out.line) && /Business class to Ibadan \(WX 1\)/.test(out.line) && /16:00/.test(out.line), out.line.slice(0, 160));
log('the bag scan lets drinks through', /Drinks are fine/.test(out.scanLine));
log('the guard boards at platform 2 for the 16:00', /platform 2/.test(out.boardLine) && /16:00/.test(out.boardLine), out.boardLine.slice(0, 160));
log('the ride starts with the wait for the 16:00 on the railway map (Abeokuta, the Ogun River)', /Waiting on board/.test(out.overlay.phase ?? '') && /16:00/.test(out.overlay.phase ?? '') && out.overlay.railMap && out.overlay.skip, out.overlay.phase);
s = await st();
const after = await S(() => ({ joy: window.__retreva.store.getState().life.needs.joy, time: window.__retreva.store.getState().world.time }));
log('you step off at Moniya at 18:30 with the return ticket; Business lifts your mood', s.dest === 'ibadan-station' && s.ticket?.routeId === 'ibd-los-b' && s.history.length === 1 && after.time === 1440 + 18 * 60 + 30 && after.joy > before, JSON.stringify(after));
log('the bag still has the zobo', s.bag.includes('ls-zobo'));
log('“All aboard” is paid once; “Wheels up” is not (a train is not a flight)', s.ledger.filter(([id]) => id === 'goal:first-train').length === 1 && !s.ledger.some(([id]) => id === 'goal:first-flight'));
await shot('moniya-arrival');

// ── taxi into Dugbe
const toDugbe = await taxi('driver-ade', 'Taxi to Dugbe for ₦5,000', 'ibadan-dugbe');
s = await st();
log('Ade drives you from Moniya into Dugbe for ₦5,000', toDugbe && s.dest === 'ibadan-dugbe' && s.ledger.some(([, a]) => a === -5000));
await shot('dugbe-arrival');
await budget('Dugbe');
await place(0, -30, Math.PI);
await S(() => { window.__retreva.runtime.camera.yaw = Math.PI; });
await shot('dugbe-north-roofs');

// ── work: the Dugbe Run
await setTime(2 * 1440 + 11 * 60);
await sleep(800);
await talk('mama-risi');
await choose("I'll carry it");
await talk('iya-sikiru');
await choose('Hand over the basket');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:dugbe-run:'));
log('the Dugbe Run pays once (₦2,200 or more)', run.length === 1 && run[0][1] >= 2200, JSON.stringify(run));

// ── Iya Sikiru's buka
await talk('iya-sikiru');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Abula"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Abula"]');
await sleep(400);
s = await st();
log('abula is ₦2,200 and goes in the bag', preFood - s.bal === 2200 && s.bag.includes('abula'));
await shot('buka');
await S(() => window.__retreva.store.getState().closePanel());

// ── Grandfather's City
await talk('dayo');
log('Dayo wants a guide who already knows Dugbe (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[-4.6, -6, -Math.PI / 2], [4.6, -11, Math.PI / 2], [4.6, 28, Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['ibd-cocoa', 'ibd-dugbe', 'ibd-mapo'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
s = await st();
log('walking Dugbe discovers Cocoa House, the market and Mapo Hall', ['ibd-cocoa', 'ibd-dugbe', 'ibd-mapo'].every((i) => s.discovered.includes(i)));
await shot('mapo-hall');
await talk('dayo');
await choose('Guide Dayo');
s = await st();
log('with the sights found, Dayo hires you', s.active?.jobId === 'dugbe-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('dayo');
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
const stops = [[-4.4, -6], [4.4, -13], [4.4, 30]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('Cocoa House, Dugbe Market, Mapo Hall — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('dayo');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:dugbe-walk:'));
log('Grandfather’s City pays once (₦3,800 or more)', walk.length === 1 && walk[0][1] >= 3800, JSON.stringify(walk));

// ── Fuji Night in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="fuji-night"]', { timeout: 10000 }).catch(() => {});
log('the Events app lists Fuji Night at Dugbe', await p.isVisible('.event-card[data-event="fuji-night"]'));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the Dugbe room and go in
await place(5.0, 9.6, Math.PI / 2);
await near('dugbe-room-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Dugbe room (₦7,000) and walk inside', s.homes.includes('dugbe-room') && s.inside?.interiorId === 'dugbe-room' && s.ledger.some(([id, a]) => id === 'home:dugbe-room' && a === -7000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload in Ibadan
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue in Dugbe with your ticket back', s.dest === 'ibadan-dugbe' && s.ticket?.routeId === 'ibd-los-b');

// ── taxi to Moniya and the train home, then a danfo to Yaba
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
const toMoniya = await taxi('baba-tunde', 'Taxi to Moniya station for ₦5,000', 'ibadan-station');
log('Baba Tunde drives you to Moniya for ₦5,000', toMoniya);
await shot('ibadan-station');
await setTime(2 * 1440 + 15 * 60 + 30);
const home = await ride('lagos-station');
s = await st();
log('the train home: WX 2 from platform 1, the 16:00, arriving at Ebute Metta; two trips logged', /Lagos \(WX 2\)/.test(home.line) && /platform 1/.test(home.boardLine) && s.dest === 'lagos-station' && s.ticket === null && s.history.length === 2, home.line.slice(0, 120));
const toYaba = await taxi('conductor-wale', 'Ride to Yaba for ₦300', 'lagos-adeniyi');
log('Sola’s danfo takes you back to Yaba for ₦300', toYaba && (await st()).dest === 'lagos-adeniyi');

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
