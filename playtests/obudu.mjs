// Obudu playtest: the fifteenth city pack and the cable car. Fly to Calabar, then Okokon's bus up to the base station
// below the Obudu Plateau (city loads first, ₦10,000 once, 5 h 45, map of Nigeria); the base's draw-call budget; the
// escarpment from the road; the Corn Run (paid once); the cable car up: you ride in the cabin over the forest into
// the mist, pay nothing until the top, and a reload mid-air puts you back at the base station with nothing charged;
// ride it through: ₦5,000 once at the top, 25 minutes, the three views seen, off at the upper station on the plateau
// edge; the ranch's draw-call budget; the Milk Run; afia efere; the Ranch Walk (locked, in order, paid once); Bonfire
// night in Events; rent and enter the ranch chalet; reload; the cable car down (ridden backwards into the base
// station, ₦5,000 once); Etim's bus back to Calabar. Ticket and bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('obudu');
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
await p.fill('#name', 'Ekaete');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 7 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 360000, ledger: [{ id: 'test-topup', amount: 360000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── to Calabar by air, then the bus to Obudu
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('.flight[data-route="los-cbq"] button:has-text("Book return")', { timeout: 30000 });
await p.click('.flight[data-route="los-cbq"] button:has-text("Book return")');
await p.click('.flight[data-route="los-cbq"] button:has-text("Confirm")');
await sleep(400);
await S(() => window.__retreva.store.getState().closePanel());
await go('lagos-airport');
await fly('calabar-marina');
let s = await st();
log('you land on the Calabar Marina', s.dest === 'calabar-marina');
log('Obudu is not loaded yet (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('obudu'))));
await setTime(2 * 1440 + 5 * 60);
const t0 = await S(() => window.__retreva.store.getState().world.time);
await talk('okokon');
await choose('Take an intercity bus');
await p.waitForSelector('button[aria-label="Bus to Obudu for ₦10,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Obudu for ₦10,000"]');
await p.waitForSelector('.coach-transit', { timeout: 10000 }).catch(() => {});
await sleep(800);
const nigeria = (await p.isVisible('.coach-transit svg text:has-text("NIGERIA")')) && (await p.isVisible('.coach-transit svg text:has-text("Obudu")'));
await p.screenshot({ path: `${OUT}/bus-to-obudu.png` });
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'obudu-base' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Okokon’s bus takes you to the base station for ₦10,000 in 5 h 45, on the map of Nigeria (the city loads first)', nigeria && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -10000).length === 1 && t1 - t0 === 345, `+${t1 - t0} min`);
await shot('base-arrival');
await sleep(1500);
let perf = await S(() => window.__retreva.runtime.perf);
log('the base station stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── the escarpment, and the cable going up into the mist
await place(-2.5, -30, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.02; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('ob-escarpment'), null, { timeout: 20000 }).catch(() => {});
log('the escarpment is found at the end of the road', (await st()).discovered.includes('ob-escarpment'));
await shot('escarpment');

// ── the Corn Run
await talk('mama-agbo');
await choose('Take Oko his lunch');
await talk('oko-attendant');
await choose('Hand over the corn');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:corn-run:'));
log('the Corn Run pays once (₦1,800 or more)', run.length === 1 && run[0][1] >= 1800, JSON.stringify(run));

// ── the cable car up — and a reload in mid-air
const cableUp = async () => {
  await talk('oko-attendant');
  await choose('Ride the cable car');
  await p.waitForSelector('button[aria-label="Cable car to The Ranch for ₦5,000"]:not([disabled])', { timeout: 15000 });
  await p.click('button[aria-label="Cable car to The Ranch for ₦5,000"]');
  await p.waitForFunction(() => window.__retreva.store.getState().ui === 'drive', null, { timeout: 10000 });
};
s = await st();
const preUp = s.bal;
await cableUp();
await p.waitForFunction(() => window.__retreva.runtime.player.y > 14, null, { timeout: 60000 }).catch(() => {});
const mid = await S(() => ({ y: window.__retreva.runtime.player.y, z: window.__retreva.runtime.player.z, bal: window.__retreva.store.getState().wallet.balance }));
log('the cabin climbs out over the forest (and nothing is charged until the top)', mid.y > 14 && mid.z < -55 && mid.bal === preUp && (await p.isVisible('.drive-hud[data-cable="up"]')), JSON.stringify(mid));
await shot('cable-climb');
await S(() => window.__retreva.saves.saveNow());
await sleep(500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
const back = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z, ui: window.__retreva.store.getState().ui }));
log('a reload in mid-air puts you back at the base station, with nothing charged', s.dest === 'obudu-base' && back.ui === 'play' && Math.abs(back.z + 38) < 2 && s.bal === preUp && !s.ledger.some(([id]) => id.startsWith('cable-')), JSON.stringify(back));
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));

const tUp = await S(() => window.__retreva.store.getState().world.time);
await cableUp();
await p.waitForFunction(() => window.__retreva.store.getState().drive?.spotted.includes('ob-mist'), null, { timeout: 90000 }).catch(() => {});
await shot('cable-mist');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'obudu-ranch' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 120000 });
await sleep(2000);
s = await st();
const top = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z, t: window.__retreva.store.getState().world.time }));
const views = ['ob-canopy', 'ob-waterfall', 'ob-mist'].filter((id) => s.discovered.includes(id));
log('at the top: ₦5,000 paid once, 25 minutes on the clock, off at the upper station', s.ledger.filter(([id, a]) => id.startsWith('cable-') && a === -5000).length === 1 && top.t - tUp === 25 && Math.abs(top.x - 2.5) < 1 && Math.abs(top.z + 39.5) < 1, JSON.stringify(top));
log('on the way up you see the canopy, a waterfall and the mist', views.length === 3, views.join(','));
await shot('ranch-arrival');
perf = await S(() => window.__retreva.runtime.perf);
log('the ranch stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.15; });
await place(0, -39, Math.PI);
await sleep(1500);
log('the plateau edge is found by the station', (await st()).discovered.includes('ob-edge'));
await shot('plateau-edge');

// ── the Milk Run, afia efere
await setTime(2 * 1440 + 13 * 60);
await talk('pa-ushie');
await choose("I'll carry it");
await talk('mama-ogar');
await choose('Hand over the churn');
s = await st();
const milk = s.ledger.filter(([id]) => id.startsWith('job:milk-run:'));
log('the Milk Run pays once (₦2,200 or more)', milk.length === 1 && milk[0][1] >= 2200, JSON.stringify(milk));
await talk('mama-ogar');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Afia efere"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Afia efere"]');
await sleep(400);
s = await st();
log('afia efere is ₦3,200 and goes in the bag', preFood - s.bal === 3200 && s.bag.includes('afia-efere'));
await S(() => window.__retreva.store.getState().closePanel());

// ── the Ranch Walk
await talk('kelechi');
log('Kelechi wants a guide who already knows the ranch (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[4.6, -14, Math.PI / 2], [-4.6, -2, -Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['ob-grotto', 'ob-ranch', 'ob-edge'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
await shot('paddock');
await talk('kelechi');
await choose('Guide Kelechi');
s = await st();
log('with the sights found, Kelechi hires you', s.active?.jobId === 'ranch-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('kelechi');
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
const stops = [[4.4, -14], [-4.4, -2], [0, -38.5]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('the Grotto path, the cattle ranch, the plateau edge — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('kelechi');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:ranch-walk:'));
log('the Ranch Walk pays once (₦4,000 or more)', walk.length === 1 && walk[0][1] >= 4000, JSON.stringify(walk));

// ── Bonfire night in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="ranch-bonfire"]', { timeout: 10000 }).catch(() => {});
log('the Events app lists Bonfire night at the ranch', await p.isVisible('.event-card[data-event="ranch-bonfire"]'));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the chalet and go in
await place(5.0, 13, Math.PI / 2);
await near('ranch-chalet-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the ranch chalet (₦18,000) and walk inside', s.homes.includes('ranch-chalet') && s.inside?.interiorId === 'ranch-chalet' && s.ledger.some(([id, a]) => id === 'home:ranch-chalet' && a === -18000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then the cable car down
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue at the ranch', s.dest === 'obudu-ranch');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
const tDown = await S(() => window.__retreva.store.getState().world.time);
await talk('agbor-attendant');
await choose('Ride the cable car');
await p.waitForSelector('button[aria-label="Cable car to Base station for ₦5,000"]:not([disabled])', { timeout: 15000 });
await p.click('button[aria-label="Cable car to Base station for ₦5,000"]');
await p.waitForFunction(() => window.__retreva.store.getState().destinationId === 'obudu-base' && window.__retreva.store.getState().drive?.startedAt > 0, null, { timeout: 60000 }).catch(() => {});
await p.waitForFunction(() => window.__retreva.runtime.player.y > 0 && window.__retreva.runtime.player.y < 30, null, { timeout: 60000 }).catch(() => {});
log('going down the cabin leaves from the top and sinks towards the forest', (await p.isVisible('.drive-hud[data-cable="down"]')), JSON.stringify(await S(() => ({ y: window.__retreva.runtime.player.y, z: window.__retreva.runtime.player.z }))));
await shot('cable-down');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'obudu-base' && g.ui === 'play'; }, null, { timeout: 120000 });
await sleep(800);
s = await st();
const down = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z, t: window.__retreva.store.getState().world.time }));
log('down at the base station: ₦5,000 paid once more, 25 minutes', s.ledger.filter(([id, a]) => id.startsWith('cable-') && a === -5000).length === 2 && down.t - tDown === 25 && Math.abs(down.z + 38) < 1, JSON.stringify(down));

// ── the bus back to Calabar
await talk('conductor-etim');
await choose('Take an intercity bus');
await p.waitForSelector('button[aria-label="Bus to Calabar for ₦10,000"]:not([disabled])', { timeout: 30000 });
await p.click('button[aria-label="Bus to Calabar for ₦10,000"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'calabar-marina' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
s = await st();
log('Etim’s bus takes you back to Calabar for ₦10,000', s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -10000).length === 2);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
