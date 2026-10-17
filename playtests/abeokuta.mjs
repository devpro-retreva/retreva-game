// Abeokuta playtest: the intercity bus and the seventh city pack. The Travel app lists the buses; a danfo to Ikeja;
// Alhaji Sule's bus at Ojota (₦4,000 once, the city loads first, the bus map, two hours on the clock, "Road trip" paid
// once); Itoku's draw-call budget; the dye pit locked until the Indigo Run (paid once), then three cloths dyed in
// order (paid once, "Adire dyeing" skill, in the bench's own words); ofada at Mama Ofada's; the Under the Rock tour
// (locked, led in order, paid once); the Adire Runway in Events; renting and entering the Itoku room; reload; the bus
// on to Ibadan (₦2,500) and from Dugbe back to Lagos (₦6,000). Bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('abeokuta');
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
await p.fill('#name', 'Bola');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 9 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 20000, ledger: [{ id: 'test-topup', amount: 20000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── the Travel app shows where the buses go from
await S(() => window.__retreva.store.getState().openPhone('travel'));
await p.waitForSelector('[data-coach="abeokuta-itoku"]');
const line = await p.textContent('[data-coach="abeokuta-itoku"]');
log('the Travel app lists intercity buses from Ikeja: Abeokuta ₦4,000, Ibadan ₦6,000', /Bus from Ikeja/.test(line) && /₦4,000/.test(line) && (await p.textContent('[data-coach="ibadan-dugbe"]')).includes('₦6,000'), line);
await S(() => window.__retreva.store.getState().closePanel());

// ── danfo to Ikeja, then the bus from Ojota
await talk('kunle');
await choose('Take a danfo');
await p.click('button[aria-label^="Ride to Ikeja"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'ikeja-village' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
log('Abeokuta is not loaded yet (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('abeokuta'))));
let s = await st();
const t0 = await S(() => window.__retreva.store.getState().world.time);
const ride1 = await bus('alhaji-sule', 'Bus to Abeokuta for ₦4,000', 'abeokuta-itoku');
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
const coach = s.ledger.filter(([id]) => id.startsWith('coach-'));
log('Alhaji Sule’s bus offers Abeokuta for ₦4,000 (the city loads first)', ride1.shown);
log('the ride is drawn on a map of the south-west', ride1.map);
log('you arrive in Itoku; ₦4,000 paid once; two hours on the clock', s.dest === 'abeokuta-itoku' && coach.length === 1 && coach[0][1] === -4000 && t1 - t0 === 120, `${JSON.stringify(coach)} +${t1 - t0} min`);
log('“Road trip” is paid once', s.ledger.filter(([id]) => id === 'goal:first-bus').length === 1);
await shot('itoku-arrival');
await budget('Itoku');
await place(0, -24, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = -0.08; });
await shot('itoku-olumo');

// ── the dye pit is locked until you bring Iya Alaro her leaves
await setTime(1440 + 12 * 60);
await talk('iya-alaro');
log('Iya Alaro won’t teach you before the Indigo Run', !(await p.isVisible('button.choice:has-text("Dye some cloth")')));
await choose('I will');
await talk('baba-ogunde');
await choose("I'll carry it");
await talk('iya-alaro');
await choose('Hand over the leaves');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:indigo-run:'));
log('the Indigo Run pays once (₦2,000 or more)', run.length === 1 && run[0][1] >= 2000, JSON.stringify(run));

// ── three cloths at the dye pit
await talk('iya-alaro');
await choose('Dye some cloth');
await p.waitForSelector('.repair .ticket');
const head1 = await p.textContent('.repair .sheet-head');
const ticket = await p.textContent('.repair .ticket');
log('the dye pit speaks adire: “Adire dyeing level”, “Cloth 1 of 3”', /Adire · Iya Alaro · Adire dyeing level 1/.test(head1) && /Cloth 1 of 3/.test(ticket), `${head1.slice(0, 80)} | ${ticket.slice(0, 60)}`);
await shot('dye-pit');
for (let cloth = 0; cloth < 3; cloth++) {
  await S(() => { const st = window.__retreva.store; st.setState({ repair: { ...st.getState().repair, deadline: Date.now() + 120000 } }); });
  const name = await p.getAttribute('.repair .ticket', 'data-device');
  const order = { 'Oniko wrapper': ['Fold the cloth', 'Tie with raffia', 'Dip in indigo', 'Air it out', 'Untie & rinse'], 'Eleko cloth': ['Stretch the cloth', 'Paint the paste', 'Dry in the sun', 'Dip in indigo', 'Scrape the paste'], 'Alabere scarf': ['Stitch the pattern', 'Pull threads tight', 'Dip in indigo', 'Air it out', 'Cut the stitches'] }[name];
  for (const step of order) {
    await p.click(`.repair-grid button[data-step="${step}"]`);
    await sleep(150);
  }
  await sleep(300);
}
await p.waitForSelector('.repair .shift-done');
const done = await p.textContent('.repair .shift-done');
s = await st();
log('three cloths dyed, paid once, and the dyeing skill grows', /Dyed 3 of 3 cloths/.test(done) && s.ledger.filter(([id]) => id.startsWith('repair:adire-pit:')).length === 1 && (await S(() => window.__retreva.store.getState().life.skills.dyeing ?? 0)) > 0, done.slice(0, 80));
await shot('dye-pit-done');
await p.click('.repair .shift-done button:has-text("Done")');

// ── Mama Ofada
await talk('mama-ofada');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Ofada rice"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Ofada rice"]');
await sleep(400);
s = await st();
log('ofada rice & ayamase is ₦2,300 and goes in the bag', preFood - s.bal === 2300 && s.bag.includes('ofada-ayamase-abk'));
await S(() => window.__retreva.store.getState().closePanel());

// ── Under the Rock
await talk('adaeze');
log('Adaeze wants a guide who already knows Itoku (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[-4.6, 14, -Math.PI / 2], [4.6, -10, Math.PI / 2], [0, -37, Math.PI]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['abk-centenary', 'abk-itoku', 'abk-olumo'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
s = await st();
log('walking Itoku discovers Centenary Hall, the adire market and the Olumo view', ['abk-centenary', 'abk-itoku', 'abk-olumo'].every((i) => s.discovered.includes(i)));
await talk('adaeze');
await choose('Guide Adaeze');
s = await st();
log('with the sights found, Adaeze hires you', s.active?.jobId === 'under-the-rock');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('adaeze');
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
const stops = [[-4.4, 14], [4.4, -10], [0, -36]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('Centenary Hall, the market, the Olumo view — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('adaeze');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:under-the-rock:'));
log('Under the Rock pays once (₦3,500 or more)', walk.length === 1 && walk[0][1] >= 3500, JSON.stringify(walk));

// ── the Adire Runway in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="adire-runway"]', { timeout: 10000 }).catch(() => {});
log('the Events app lists the Adire Runway', await p.isVisible('.event-card[data-event="adire-runway"]'));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the Itoku room and go in
await place(5.0, 13.4, Math.PI / 2);
await near('itoku-room-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Itoku room (₦6,000) and walk inside', s.homes.includes('itoku-room') && s.inside?.interiorId === 'itoku-room' && s.ledger.some(([id, a]) => id === 'home:itoku-room' && a === -6000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload in Abeokuta
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue in Itoku', s.dest === 'abeokuta-itoku');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));

// ── on to Ibadan, then back to Lagos
const ride2 = await bus('conductor-taiwo', 'Bus to Ibadan for ₦2,500', 'ibadan-dugbe');
s = await st();
log('Taiwo’s bus goes on to Ibadan for ₦2,500', ride2.shown && s.dest === 'ibadan-dugbe' && s.ledger.some(([id, a]) => id.startsWith('coach-') && a === -2500));
const ride3 = await bus('conductor-rasaki', 'Bus to Lagos for ₦6,000', 'ikeja-village');
s = await st();
log('Rasaki’s bus from Dugbe brings you back to Lagos (Ikeja) for ₦6,000; three bus fares in all', ride3.shown && s.dest === 'ikeja-village' && s.ledger.filter(([id]) => id.startsWith('coach-')).length === 3);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
