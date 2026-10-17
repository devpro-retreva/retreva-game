// Osogbo playtest: the eighth city pack, reached by the intercity bus from Ibadan. Danfo to Ikeja, bus to Ibadan, then
// Rasaki's bus on to Osogbo (₦3,500 once, the south-west map, the city loads first); Oja Oba's draw-call budget; the
// sacred grove's gate found from the road (no work there); the Yam Run (paid once); Yinka's batik table locked until
// then, three pieces in order (paid once, "Batik" skill); pounded yam at Iya Iyan's; the Osogbo Art Walk (locked, in
// order, paid once); Festival Night in Events (and honest about the real festival); renting and entering the Osun
// room; reload; Bayo's bus back to Ibadan. Bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('osogbo');
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
await p.fill('#name', 'Funke');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 9 * 60 + 30);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 30000, ledger: [{ id: 'test-topup', amount: 30000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── Yaba → Ikeja (danfo) → Ibadan (bus)
await talk('kunle');
await choose('Take a danfo');
await p.click('button[aria-label^="Ride to Ikeja"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'ikeja-village' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
await bus('alhaji-sule', 'Bus to Ibadan for ₦6,000', 'ibadan-dugbe');
let s = await st();
log('the bus from Ojota reaches Dugbe (₦6,000)', s.dest === 'ibadan-dugbe');

// ── Ibadan → Osogbo
log('Osogbo is not loaded yet (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('osogbo'))));
const t0 = await S(() => window.__retreva.store.getState().world.time);
const ride = await bus('conductor-rasaki', 'Bus to Osogbo for ₦3,500', 'osogbo-oja-oba');
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Rasaki’s bus offers Osogbo for ₦3,500 (the city loads first), on the south-west map', ride.shown && ride.map);
log('you arrive at Oja Oba; ₦3,500 paid once; 1 h 50 on the clock', s.dest === 'osogbo-oja-oba' && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -3500).length === 1 && t1 - t0 === 110, `+${t1 - t0} min`);
await shot('oja-oba-arrival');
await budget('Oja Oba');

// ── the grove gate, from the road
await place(0, -37, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.05; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('osg-grove'), null, { timeout: 20000 }).catch(() => {});
s = await st();
log('the gate of the Sacred Grove is found from the road (seen, not worked in)', s.discovered.includes('osg-grove'));
await shot('grove-gate');

// ── Yam Run, then the batik table
await setTime(1440 + 12 * 60);
await talk('yinka');
log('Yinka won’t teach batik before you’ve helped at the market', !(await p.isVisible('button.choice:has-text("Make some batik")')));
await choose('Later');
await talk('mama-folake');
await choose("I'll carry it");
await talk('iya-iyan');
await choose('Hand over the basket');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:yam-run:'));
log('the Yam Run pays once (₦2,000 or more)', run.length === 1 && run[0][1] >= 2000, JSON.stringify(run));

await talk('yinka');
await choose('Make some batik');
await p.waitForSelector('.repair .ticket');
const head1 = await p.textContent('.repair .sheet-head');
log('the batik table speaks batik: “Batik level”, “Piece 1 of 3”', /Batik · Yinka · Batik level 1/.test(head1) && /Piece 1 of 3/.test(await p.textContent('.repair .ticket')), head1.slice(0, 80));
await shot('batik-table');
const ORDER = { 'Market-day wrapper': ['Draw the design', 'Wax the lines', 'Dip in yellow', 'Wax again', 'Dip in indigo'], 'Crackle panel': ['Draw the design', 'Wax it all', 'Crack the wax', 'Dip in indigo', 'Boil off the wax'], 'Drummer cushion': ['Stretch the cloth', 'Draw the design', 'Wax the lines', 'Dip in brown', 'Boil off the wax'] };
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
log('three pieces finished, paid once, and the batik skill grows', /Finished 3 of 3 pieces/.test(done) && s.ledger.filter(([id]) => id.startsWith('repair:batik-table:')).length === 1 && (await S(() => window.__retreva.store.getState().life.skills.batik ?? 0)) > 0, done.slice(0, 80));
await p.click('.repair .shift-done button:has-text("Done")');

// ── Iya Iyan
await talk('iya-iyan');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Pounded yam"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Pounded yam"]');
await sleep(400);
s = await st();
log('pounded yam & efo riro is ₦2,500 and goes in the bag', preFood - s.bal === 2500 && s.bag.includes('iyan-efo'));
await S(() => window.__retreva.store.getState().closePanel());

// ── the Osogbo Art Walk
await talk('kwame-osogbo');
log('Kwame wants a guide who already knows Osogbo (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[-4.6, -10, -Math.PI / 2], [4.6, -14, Math.PI / 2], [4.6, 20, Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['osg-palace', 'osg-ojaoba', 'osg-artists'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
await shot('artists-street');
await talk('kwame-osogbo');
await choose('Guide Kwame');
s = await st();
log('with the sights found, Kwame hires you', s.active?.jobId === 'osogbo-art-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('kwame-osogbo');
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
const stops = [[-4.4, -10], [4.4, -14], [4.4, 20]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('the palace, Oja Oba, the artists’ street — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('kwame-osogbo');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:osogbo-art-walk:'));
log('the Osogbo Art Walk pays once (₦3,500 or more)', walk.length === 1 && walk[0][1] >= 3500, JSON.stringify(walk));

// ── Festival Night in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="osun-festival-night"]', { timeout: 10000 }).catch(() => {});
const ev = (await p.isVisible('.event-card[data-event="osun-festival-night"]')) ? await p.textContent('.event-card[data-event="osun-festival-night"]') : '';
log('the Events app lists Festival Night, and says the real procession is free, in August', /Festival Night at Oja Oba/.test(ev) && /free and once a year, in August/.test(ev), ev.slice(0, 120));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the Osun room and go in
await place(5.0, -0.6, Math.PI / 2);
await near('osun-room-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Osun room (₦5,500) and walk inside', s.homes.includes('osun-room') && s.inside?.interiorId === 'osun-room' && s.ledger.some(([id, a]) => id === 'home:osun-room' && a === -5500));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then the bus back to Ibadan
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue at Oja Oba', s.dest === 'osogbo-oja-oba');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
const back = await bus('conductor-bayo', 'Bus to Ibadan for ₦3,500', 'ibadan-dugbe');
s = await st();
log('Bayo’s bus takes you back to Ibadan for ₦3,500; three bus fares in all', back.shown && s.dest === 'ibadan-dugbe' && s.ledger.filter(([id]) => id.startsWith('coach-')).length === 3);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
