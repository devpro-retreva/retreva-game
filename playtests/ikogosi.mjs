// Ikogosi playtest: the eighteenth city pack, the warm and cold springs. Danfo to Ikeja, buses to Ibadan, Ile-Ife and
// Erin-Ijesha, then Ayo's bus over the hills to Ikogosi (city loads first, ₦2,000 once, 45 min, south-west map); the
// draw-call budget; where the springs meet, from the road; a swim in the cold spring, then the warm one (each in its
// own words: the warm one gives back more energy and more joy, 40 minutes each); the Cocoa Run (paid once); pounded
// yam and egusi; the Springs Walk (warm → cold → where they meet: locked, in order, paid once); rent and enter the
// spring chalet; reload; Dele's bus back to Erin-Ijesha (₦2,000 once). Bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('ikogosi');
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
  // people are placed a moment after an area loads
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
await p.fill('#name', 'Tolu');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 7 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 50000, ledger: [{ id: 'test-topup', amount: 50000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── Yaba → Ikeja → Ibadan → Ile-Ife → Erin-Ijesha → Ikogosi
await talk('kunle');
await choose('Take a danfo');
await p.click('button[aria-label^="Ride to Ikeja"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'ikeja-village' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
await bus('alhaji-sule', 'Bus to Ibadan for ₦6,000', 'ibadan-dugbe');
await bus('conductor-rasaki', 'Bus to Ile-Ife for ₦4,000', 'ife-enuwa');
await bus('conductor-tunde', 'Bus to Erin-Ijesha for ₦2,500', 'erin-olumirin');
let s = await st();
log('you reach Erin-Ijesha by bus', s.dest === 'erin-olumirin');
log('Ikogosi is not loaded yet (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('ikogosi'))));
const t0 = await S(() => window.__retreva.store.getState().world.time);
const ride = await bus('conductor-ayo', 'Bus to Ikogosi for ₦2,000', 'ikogosi-springs');
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Ayo’s bus goes over the hills to Ikogosi for ₦2,000 in 45 minutes, on the south-west map (the city loads first)', ride.shown && ride.map && s.dest === 'ikogosi-springs' && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -2000).length === 1 && t1 - t0 === 45, `+${t1 - t0} min`);
await shot('ikogosi-arrival');
await budget('Ikogosi');

// ── where the springs meet
await place(0, -38, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.3; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('iko-meet'), null, { timeout: 20000 }).catch(() => {});
log('where warm meets cold is found at the end of the road', (await st()).discovered.includes('iko-meet'));
await shot('springs-meet');

// ── two swims
const needs = (energy, joy) => S(([energy, joy]) => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, energy, joy } } }); }, [energy, joy]);
const swim = async (spot, x) => {
  await needs(50, 40);
  const t = await S(() => window.__retreva.store.getState().world.time);
  await place(x, -11, x > 0 ? Math.PI / 2 : -Math.PI / 2);
  await S(([yaw]) => { const r = window.__retreva.runtime; r.camera.yaw = yaw; r.camera.pitch = 0.35; }, [x > 0 ? Math.PI / 2 : -Math.PI / 2]);
  await near(spot);
  await shot(spot);
  await p.keyboard.press('KeyE');
  await p.waitForFunction(() => window.__retreva.store.getState().resting?.at === 'swim', null, { timeout: 5000 }).catch(() => {});
  const text = (await p.textContent('.rest-overlay').catch(() => '')) ?? '';
  await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 20000 });
  const after = await S(() => ({ n: window.__retreva.store.getState().life.needs, t: window.__retreva.store.getState().world.time }));
  return { text, energy: after.n.energy - 50, joy: after.n.joy - 40, dt: after.t - t };
};
const cold = await swim('iko-cold-swim', -5.4);
const warm = await swim('iko-warm-swim', 5.4);
log('the cold spring: “Swimming in the cold spring…”, a little energy and joy, 40 minutes', /Swimming in the cold spring/.test(cold.text) && cold.energy > 0 && cold.joy > 0 && cold.dt === 40, JSON.stringify(cold));
log('the warm spring: “Swimming in the warm spring…”, more energy and more joy than the cold one', /Swimming in the warm spring/.test(warm.text) && warm.energy > cold.energy && warm.joy > cold.joy && warm.dt === 40, JSON.stringify(warm));
s = await st();
log('both springs are found on the way', s.discovered.includes('iko-warm') && s.discovered.includes('iko-cold'));

// ── the Cocoa Run
await setTime(2 * 1440 + 9 * 60);
await talk('pa-ojo');
await choose("I'll carry it");
await talk('baba-tayo');
await choose('Hand over the sack');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:cocoa-run:'));
log('the Cocoa Run pays once (₦2,200 or more)', run.length === 1 && run[0][1] >= 2200, JSON.stringify(run));

// ── Mama Kemi
await talk('mama-kemi');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Pounded yam"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Pounded yam"]');
await sleep(400);
s = await st();
log('pounded yam & egusi is ₦2,200 and goes in the bag', preFood - s.bal === 2200 && s.bag.includes('ekiti-iyan'));
await S(() => window.__retreva.store.getState().closePanel());

// ── the Springs Walk
await talk('seyi');
await choose('Guide Seyi');
s = await st();
log('with the springs found, Seyi hires you', s.active?.jobId === 'springs-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('seyi');
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
const stops = [[4.4, -10], [-4.4, -10], [0, -38.5]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('the warm spring, the cold spring, where they meet — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('seyi');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:springs-walk:'));
log('the Springs Walk pays once (₦3,800 or more)', walk.length === 1 && walk[0][1] >= 3800, JSON.stringify(walk));

// ── rent the chalet and go in
await place(5.0, 21, Math.PI / 2);
await near('ikogosi-chalet-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the spring chalet (₦12,000) and walk inside', s.homes.includes('ikogosi-chalet') && s.inside?.interiorId === 'ikogosi-chalet' && s.ledger.some(([id, a]) => id === 'home:ikogosi-chalet' && a === -12000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then back to Erin-Ijesha
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue at Ikogosi', s.dest === 'ikogosi-springs');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
await bus('conductor-dele', 'Bus to Erin-Ijesha for ₦2,000', 'erin-olumirin');
s = await st();
log('Dele’s bus goes back to Erin-Ijesha for ₦2,000', s.dest === 'erin-olumirin' && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -2000).length === 2);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
