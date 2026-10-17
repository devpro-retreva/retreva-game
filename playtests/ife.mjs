// Ile-Ife playtest: the sixteenth city pack, first of the south-west hills. A danfo to Ikeja, the bus to Ibadan, then
// Rasaki's bus on to Ile-Ife (city loads first, ₦4,000 once, 1 h 30, south-west map); Enuwa's draw-call budget; Opa
// Oranmiyan found at the end of the road; Baba Ayinde's bead bench locked until the Bead Run (paid once), then three
// strands in order (paid once, "Beadwork" skill, bench in its own words); ewa riro; the Enuwa Walk (museum → palace
// → Opa Oranmiyan: locked, in order, paid once); Olojo in Events, honest about the real festival; rent and enter the
// Enuwa room; reload; Tunde's bus on to Osogbo (₦2,500 once, one hour). Bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('ife');
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
await p.fill('#name', 'Adunni');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 8 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 40000, ledger: [{ id: 'test-topup', amount: 40000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── Yaba → Ikeja (danfo) → Ibadan (bus) → Ile-Ife (bus)
await talk('kunle');
await choose('Take a danfo');
await p.click('button[aria-label^="Ride to Ikeja"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'ikeja-village' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
await bus('alhaji-sule', 'Bus to Ibadan for ₦6,000', 'ibadan-dugbe');
let s = await st();
log('the bus from Ojota reaches Dugbe (₦6,000)', s.dest === 'ibadan-dugbe');
log('Ile-Ife is not loaded yet (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('ife'))));
const t0 = await S(() => window.__retreva.store.getState().world.time);
const ride = await bus('conductor-rasaki', 'Bus to Ile-Ife for ₦4,000', 'ife-enuwa');
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Rasaki’s bus offers Ile-Ife for ₦4,000 (the city loads first), on the south-west map', ride.shown && ride.map);
log('you arrive at Enuwa; ₦4,000 paid once; 1 h 30 on the clock', s.dest === 'ife-enuwa' && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -4000).length === 1 && t1 - t0 === 90, `+${t1 - t0} min`);
await shot('enuwa-arrival');
await budget('Enuwa');

// ── Opa Oranmiyan, from the road
await place(0, -36, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.08; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('ife-oranmiyan'), null, { timeout: 20000 }).catch(() => {});
log('Opa Oranmiyan is found at the end of the road', (await st()).discovered.includes('ife-oranmiyan'));
await shot('opa-oranmiyan');

// ── the Bead Run, then the bead bench
await setTime(1440 + 12 * 60);
await talk('baba-ayinde');
log('Baba Ayinde won’t teach beadwork before the Bead Run', !(await p.isVisible('button.choice:has-text("String some beads")')));
await choose('I will');
await talk('iya-ronke');
await choose("I'll carry it");
await talk('baba-ayinde');
await choose('Hand over the beads');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:bead-run:'));
log('the Bead Run pays once (₦2,200 or more)', run.length === 1 && run[0][1] >= 2200, JSON.stringify(run));
await talk('baba-ayinde');
await choose('String some beads');
await p.waitForSelector('.repair .ticket');
const head1 = await p.textContent('.repair .sheet-head');
log('the bench speaks beads: “Beadwork level”, “Strand 1 of 3”', /Beads · Baba Ayinde · Beadwork level 1/.test(head1) && /Strand 1 of 3/.test(await p.textContent('.repair .ticket')), head1.slice(0, 80));
await shot('bead-bench');
const ORDER = { 'Coral necklace': ['Sort the coral', 'Measure the thread', 'String the beads', 'Knot between beads', 'Tie the clasp'], 'Waist beads': ['Sort the glass', 'Measure the waist', 'String the beads', 'Add the charm', 'Knot the ends'], 'Bead bracelet': ['Pick the colours', 'Cut the cord', 'String the pattern', 'Close the loop', 'Polish'] };
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
log('three strands, paid once, and the beadwork skill grows', /Strung 3 of 3 strands/.test(done) && s.ledger.filter(([id]) => id.startsWith('repair:bead-workshop:')).length === 1 && (await S(() => window.__retreva.store.getState().life.skills.beadwork ?? 0)) > 0, done.slice(0, 80));
await p.click('.repair .shift-done button:has-text("Done")');

// ── Mama Tinuke
await talk('mama-tinuke');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Ewa riro"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Ewa riro"]');
await sleep(400);
s = await st();
log('ewa riro is ₦1,800 and goes in the bag', preFood - s.bal === 1800 && s.bag.includes('ewa-riro'));
await S(() => window.__retreva.store.getState().closePanel());

// ── the Enuwa Walk
await talk('damilola');
log('Damilola wants a guide who already knows Enuwa (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[4.6, -1, Math.PI / 2], [-4.6, 12, -Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['ife-museum', 'ife-palace', 'ife-oranmiyan'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
await shot('palace');
await talk('damilola');
await choose('Guide Damilola');
s = await st();
log('with the sights found, Damilola hires you', s.active?.jobId === 'enuwa-walk');
const walkTo = async (tx, tz) => {
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('damilola');
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
const stops = [[4.4, -1], [-4.4, 12], [0, -37.5]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
}
s = await st();
log('the museum, the palace, Opa Oranmiyan — in order', s.active?.collected?.join(',') === '0,1,2', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('damilola');
await choose('Finish the walk');
s = await st();
const walk = s.ledger.filter(([id]) => id.startsWith('job:enuwa-walk:'));
log('the Enuwa Walk pays once (₦4,000 or more)', walk.length === 1 && walk[0][1] >= 4000, JSON.stringify(walk));

// ── Olojo in the Events app
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="olojo"]', { timeout: 10000 }).catch(() => {});
const card = (await p.textContent('.event-card[data-event="olojo"]').catch(() => '')) ?? '';
log('the Events app lists Olojo and says the real festival is once a year and free to watch', /once a year/.test(card) && /free/.test(card), card.slice(0, 120));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the Enuwa room and go in
await place(5.0, 11, Math.PI / 2);
await near('enuwa-room-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Enuwa room (₦6,000) and walk inside', s.homes.includes('enuwa-room') && s.inside?.interiorId === 'enuwa-room' && s.ledger.some(([id, a]) => id === 'home:enuwa-room' && a === -6000));
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();

// ── reload, then on to Osogbo
await sleep(2500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you continue at Enuwa', s.dest === 'ife-enuwa');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
const t2 = await S(() => window.__retreva.store.getState().world.time);
await bus('conductor-tunde', 'Bus to Osogbo for ₦2,500', 'osogbo-oja-oba');
s = await st();
const t3 = await S(() => window.__retreva.store.getState().world.time);
log('Tunde’s bus goes on to Osogbo for ₦2,500 in an hour', s.dest === 'osogbo-oja-oba' && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -2500).length === 1 && t3 - t2 === 60, `+${t3 - t2} min`);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
