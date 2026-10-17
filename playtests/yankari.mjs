// Yankari playtest: the fourteenth city pack and the first ride of its kind — the game drive. Fly to Abuja, bus up to
// Jos, then Dauda's bus on to Wikki Camp in Yankari Game Reserve (city loads first, ₦12,000 once, five hours, map of
// Nigeria); the camp's draw-call budget; the camp gate found from the road; the Towel Run (paid once); a swim in the
// warm spring (joy, time); miyan taushe; the game drive booked in the Events app (₦7,000 once); boarding at the
// ranger post: the truck carries you out of the camp into the reserve; a reload mid-drive puts you back at camp with
// the ticket unused; board again and ride it through — every animal on the list spotted, back on the camp road,
// two hours on the clock, joy up, ticket used; rent and enter the chalet; reload; Haruna's bus back to Jos. Ticket
// and bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('yankari');
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
  return { phase: s.phase, ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]), ticket: s.travel.ticket, history: s.travel.history, inside: s.world.inside, homes: s.life.homes, active: s.jobs.active, discovered: s.world.discovered, bag: s.inventory.entries.map((e) => e.itemId), tickets: s.world.tickets ?? [] };
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
await p.fill('#name', 'Hauwa');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 8 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 340000, ledger: [{ id: 'test-topup', amount: 340000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── to Abuja by air, up to Jos by bus
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-abv"] button:has-text("Book return")', { timeout: 30000 });
await p.click('.flight[data-route="los-abv"] button:has-text("Book return")');
await p.click('.flight[data-route="los-abv"] button:has-text("Confirm")');
await sleep(400);
await S(() => window.__retreva.store.getState().closePanel());
await go('lagos-airport');
await fly('abuja-wuse');
await setTime(1440 + 9 * 60);
await talk('mallam-garba');
await choose('Take the bus to Jos');
await p.waitForSelector('button[aria-label="Bus to Jos for ₦6,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Jos for ₦6,000"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'jos-terminus' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2000);
let s = await st();
log('you reach Jos by the bus from Abuja', s.dest === 'jos-terminus');

// ── on to Yankari
log('Yankari is not loaded yet (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('yankari'))));
await setTime(2 * 1440 + 6 * 60);
const t0 = await S(() => window.__retreva.store.getState().world.time);
await talk('conductor-dauda');
await choose('Take an intercity bus');
await p.waitForSelector('button[aria-label="Bus to Yankari for ₦12,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Yankari for ₦12,000"]');
await p.waitForSelector('.coach-transit', { timeout: 10000 }).catch(() => {});
await sleep(800);
const nigeria = (await p.isVisible('.coach-transit svg text:has-text("NIGERIA")')) && (await p.isVisible('.coach-transit svg text:has-text("Yankari")'));
await p.screenshot({ path: `${OUT}/bus-to-yankari.png` });
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'yankari-wikki' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Dauda’s bus takes you on to Wikki Camp for ₦12,000 in five hours, on the map of Nigeria (the city loads first)', nigeria && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -12000).length === 1 && t1 - t0 === 300, `+${t1 - t0} min`);
await shot('wikki-arrival');
await sleep(1500);
const perf = await S(() => window.__retreva.runtime.perf);
log('Wikki Camp stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── the camp gate and the savanna beyond
await place(0, -38, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.12; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('yk-gate'), null, { timeout: 20000 }).catch(() => {});
log('the camp gate to the savanna is found at the end of the road', (await st()).discovered.includes('yk-gate'));
await shot('camp-gate');

// ── the Towel Run
await talk('mama-asabe');
await choose("I'll carry it");
await talk('baba-yusuf');
await choose('Hand over the towels');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:towel-run:'));
log('the Towel Run pays once (₦2,000 or more)', run.length === 1 && run[0][1] >= 2000, JSON.stringify(run));

// ── a swim in the warm spring
await S(() => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, joy: 40, energy: 60 } } }); });
const tSwim = await S(() => window.__retreva.store.getState().world.time);
await place(5.4, -3, Math.PI / 2);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI / 2; r.camera.pitch = 0.35; });
await near('yk-swim');
await shot('warm-spring');
await p.keyboard.press('KeyE');
await p.waitForFunction(() => window.__retreva.store.getState().resting?.at === 'swim', null, { timeout: 5000 }).catch(() => {});
const swimText = await p.textContent('.rest-overlay').catch(() => '');
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 20000 });
const afterSwim = await S(() => ({ n: window.__retreva.store.getState().life.needs, t: window.__retreva.store.getState().world.time, d: window.__retreva.store.getState().world.discovered }));
log('a swim in the warm spring: joy up, a little energy back, 40 minutes, the spring found', /Swimming/.test(swimText ?? '') && afterSwim.n.joy >= 55 && afterSwim.n.energy > 60 && afterSwim.t - tSwim === 40 && afterSwim.d.includes('yk-spring'), `joy=${afterSwim.n.joy.toFixed(0)} energy=${afterSwim.n.energy.toFixed(0)}`);

// ── miyan taushe
await talk('mama-saratu');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Tuwo"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Tuwo"]');
await sleep(400);
s = await st();
log('tuwo & miyan taushe is ₦2,200 and goes in the bag', preFood - s.bal === 2200 && s.bag.includes('miyan-taushe'));
await S(() => window.__retreva.store.getState().closePanel());

// ── book the game drive in the Events app
await setTime(2 * 1440 + 14 * 60);
const day = 3;
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="game-drive"] button[data-act="ticket"]', { timeout: 10000 });
const card = await p.textContent('.event-card[data-event="game-drive"]');
s = await st();
const preTicket = s.bal;
await p.click('.event-card[data-event="game-drive"] button[data-act="ticket"]');
await p.click('button[data-act="confirm-ticket"]');
await sleep(400);
s = await st();
log('the Events app sells a seat on today’s game drive, ₦7,000 once, and is honest that nothing is guaranteed', /Game drive/.test(card) && /Nothing is guaranteed/.test(card) && preTicket - s.bal === 7000 && s.ledger.filter(([id]) => id === `ticket:game-drive:d${day}`).length === 1, card.slice(0, 90));
await S(() => window.__retreva.store.getState().closePanel());

// ── board at the ranger post
const board = async () => {
  await place(5.0, -25.6, Math.PI / 2);
  await near('yk-drive-gate');
  await p.keyboard.press('KeyE');
  await p.waitForSelector('button[data-act="attend"]', { timeout: 10000 });
  const label = await p.textContent('button[data-act="attend"]');
  await p.click('button[data-act="attend"]');
  await p.waitForFunction(() => window.__retreva.store.getState().ui === 'drive', null, { timeout: 10000 });
  return label;
};
const label = await board();
await p.waitForSelector('.drive-hud', { timeout: 5000 }).catch(() => {});
log('at the ranger post you show your ticket and board; the drive card lists what to watch for', /board/.test(label) && (await p.locator('.drive-list li').count()) === 6, label);
await p.waitForFunction(() => window.__retreva.runtime.player.z < -60, null, { timeout: 60000 }).catch(() => {});
const out = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z }));
log('the truck carries you out of the camp gate into the reserve', out.z < -60, JSON.stringify(out));
await shot('drive-savanna');

// ── reload mid-drive
await S(() => window.__retreva.saves.saveNow());
await sleep(500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
const back = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z, ui: window.__retreva.store.getState().ui }));
log('a reload mid-drive puts you back at the ranger post in camp, ticket still unused', s.dest === 'yankari-wikki' && back.ui === 'play' && Math.abs(back.x) < 6.9 && back.z > -42 && s.tickets.find((t) => t.eventId === 'game-drive')?.status === 'booked', JSON.stringify(back));
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));

// ── board again and ride it through
await S(() => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, joy: 40, energy: 80 } } }); });
const tDrive = await S(() => window.__retreva.store.getState().world.time);
await board();
await p.waitForFunction(() => window.__retreva.store.getState().drive?.spotted.includes('yk-elephants'), null, { timeout: 120000 }).catch(() => {});
await sleep(600);
await shot('drive-elephants');
await p.waitForFunction(() => window.__retreva.store.getState().drive?.spotted.includes('yk-buffalo'), null, { timeout: 120000 }).catch(() => {});
await shot('drive-hud');
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 150000 });
await sleep(800);
s = await st();
const end = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z, t: window.__retreva.store.getState().world.time, n: window.__retreva.store.getState().life.needs }));
const seen = ['yk-baboons', 'yk-kob', 'yk-elephants', 'yk-hippos', 'yk-buffalo', 'yk-warthogs'].filter((id) => s.discovered.includes(id));
log('every animal on the list is spotted from the truck', seen.length === 6, seen.join(','));
log('the drive ends back on the camp road: two hours on the clock, joy up, a little tired, ticket used', Math.abs(end.x) < 6.9 && end.z > -42 && end.t - tDrive === 120 && end.n.joy >= 70 && end.n.energy < 80 && s.tickets.find((t) => t.eventId === 'game-drive')?.status === 'used', JSON.stringify({ x: end.x.toFixed(1), z: end.z.toFixed(1), dt: end.t - tDrive, joy: end.n.joy.toFixed(0) }));
await shot('back-at-camp');
s = await st();
log('the drive was paid once (no second charge for boarding again)', s.ledger.filter(([id]) => id.startsWith('ticket:game-drive')).length === 1);

// ── rent the chalet and go in
await place(5.0, 9, Math.PI / 2);
await near('wikki-chalet-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Wikki chalet (₦9,500) and walk inside', s.homes.includes('wikki-chalet') && s.inside?.interiorId === 'wikki-chalet' && s.ledger.some(([id, a]) => id === 'home:wikki-chalet' && a === -9500));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then the bus back to Jos
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue at Wikki Camp', s.dest === 'yankari-wikki');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
await talk('mallam-haruna');
await choose('Take an intercity bus');
await p.waitForSelector('button[aria-label="Bus to Jos for ₦12,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Jos for ₦12,000"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'jos-terminus' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
s = await st();
log('Haruna’s bus takes you back to Jos for ₦12,000', s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -12000).length === 2);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
