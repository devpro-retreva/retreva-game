// Work playtest: requirements, the repair bench (a sequencing mini-game) and guiding a tour (an escort
// mechanic), plus courier ranks. Unlocks are reached by setting history directly where earning them
// would take many minutes (noted per check).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('work');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
const S = (fn, a) => p.evaluate(fn, a);
const st = () => S(() => { const s = window.__retreva.store.getState(); return { ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]), skills: s.life.skills, regard: s.life.regard, active: s.jobs.active, repair: s.repair, history: s.jobs.history.length }; });
const place = (x, z, yaw) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
const talk = async (npcId) => {
  const at = await S((id) => { const a = window.__retreva.runtime.actors.get(id); return [a.x, a.z]; }, npcId);
  await place(at[0] + (at[0] > 0 ? -1.2 : 1.2), at[1], at[0] > 0 ? Math.PI / 2 : -Math.PI / 2);
  await p.waitForFunction((id) => window.__retreva.store.getState().nearby?.id === id, npcId, { timeout: 20000 });
  await p.keyboard.press('KeyE');
  await sleep(250);
  await p.keyboard.press('Space');
  await p.waitForSelector('button.choice', { timeout: 10000 });
};
const choose = async (label) => { await p.click(`button.choice:has-text("${label}")`); await sleep(350); };
const go = async (area) => {
  await S((a) => window.__retreva.store.getState().travelTo(a), area);
  await p.waitForFunction((a) => window.__retreva.store.getState().destinationId === a && window.__retreva.store.getState().phase === 'playing', area, { timeout: 60000 });
  await sleep(4000);
};

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Ngozi');
await p.click('text=Start my life');
await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
// mid-morning, so every shop is open (Tobi opens at 09:00; the clock is held by ?clock=paused)
await S(() => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, time: 10 * 60 } }); });

// ── repair bench: locked until you've done Tobi's Phone Run
await go('ikeja-village');
await talk('tobi');
await choose('Work the repair bench');
let s = await st();
log('the repair bench is locked until you finish the Phone Run (and says so)', s.ui !== 'repair' && (await p.isVisible('.toast:has-text("Finish Phone Run")')));
await S(() => window.__retreva.store.getState().openPhone('jobs'));
await p.waitForSelector('.job-card[data-locked="yes"]');
log('the Jobs app lists the locked bench with what it needs', await p.isVisible('.job-card[data-locked="yes"] .req:has-text("Phone Run")'));
await S(() => window.__retreva.store.getState().closePanel());
// do the Phone Run for real
await talk('tobi');
await choose("I'll deliver it");
await talk('okafor');
await choose('Hand over the phone');
s = await st();
log('Phone Run done (paid)', s.ledger.some(([id]) => id.startsWith('job:phone-run:')));

// now the bench opens; play a session: first phone with one slip, the rest clean
await talk('tobi');
await choose('Work the repair bench');
await p.waitForSelector('.repair .ticket');
await S(() => { const st = window.__retreva.store; st.setState({ repair: { ...st.getState().repair, deadline: Date.now() + 120000 } }); });
// The correct order is game data (Ikeja pack). It is mirrored here so the test plays like a person who knows the job.
const ORDER = {
  'Cracked screen': ['Power off', 'Open the back', 'Disconnect battery', 'Swap the screen', 'Close & test'],
  'Dead battery': ['Power off', 'Open the back', 'Unplug old battery', 'Fit new battery', 'Close & test'],
  'Charging port': ['Power off', 'Open the back', 'Clean the port', 'Replace the port', 'Close & test'],
};
await shotRepair();
async function shotRepair() { await sleep(400); await p.screenshot({ path: `${OUT}/repair.png` }); }
for (let phone = 0; phone < 3; phone++) {
  await S(() => { const st = window.__retreva.store; st.setState({ repair: { ...st.getState().repair, deadline: Date.now() + 120000 } }); });
  const name = await p.getAttribute('.repair .ticket', 'data-device');
  const order = ORDER[name];
  if (phone === 0) {
    // one deliberate slip: tap the last step first
    await p.click(`.repair-grid button[data-step="${order[order.length - 1]}"]`);
    await sleep(200);
  }
  for (const step of order) {
    await p.click(`.repair-grid button[data-step="${step}"]`);
    await sleep(150);
  }
  await sleep(300);
}
await p.waitForSelector('.repair .shift-done');
s = await st();
const o = s.repair.outcome;
log('a slip on one phone still counts; 3 of 3 fixed; no clean-work tip because of the slip', o.fixed === 3 && o.tip === 0, JSON.stringify({ fixed: o.fixed, pay: o.pay, tip: o.tip }));
log('repair pay lands once in the ledger and builds the repair skill', s.ledger.filter(([id]) => id.startsWith('repair:tobi-bench:')).length === 1 && (s.skills.repair ?? 0) === o.xp);
await p.screenshot({ path: `${OUT}/repair-done.png` });
await p.click('.repair .shift-done button:has-text("Done")');

// ── tour: locked until you've found the Island's sights
await go('lagos-island');
await S(() => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, time: 10 * 60 } }); });
await talk('sophie');
log('Sophie only hires a guide who knows the Island (locked until the three sights are discovered)', await p.isVisible('.dialogue .line:has-text("Explore a bit")'));
await choose('I will');
// walk past the three sights to discover them (teleport next to each)
for (const [x, z] of [[0, 8], [3.0, -12], [0, -30]]) { await place(x, z, 0); await sleep(1200); }
await p.waitForFunction(() => ['island-lane', 'island-asooke', 'island-brazilian'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 });
await place(0, 30, 0);
await sleep(800);
await talk('sophie');
await choose('Lead the tour');
s = await st();
log('with the sights found, Sophie hires you and the tour starts', s.active?.jobId === 'island-tour');
// lead her: walk (not run) toward each stop; she follows at walking pace
const walkTo = async (tx, tz) => {
  // software GL runs at 2–5 fps, and the guest walks in game time, so allow a couple of real minutes
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('sophie');
      const d = Math.hypot(tx - pl.x, tz - pl.z);
      const gap = Math.hypot(g.x - pl.x, g.z - pl.z);
      // step the player 1 m toward the target, but wait for Sophie if she is more than 4 m behind
      if (gap < 4 && d > 0.5) { const k = Math.min(1, d) / d; pl.x += (tx - pl.x) * k; pl.z += (tz - pl.z) * k; }
      return { d, gap };
    }, [tx, tz]);
    if (r.d < 1) break;
    await sleep(350);
  }
  const end = await S(() => { const pl = window.__retreva.runtime.player; const g = window.__retreva.runtime.actors.get('sophie'); return { p: [pl.x.toFixed(1), pl.z.toFixed(1)], g: [g.x.toFixed(1), g.z.toFixed(1)], collected: window.__retreva.store.getState().jobs.active?.collected }; });
  console.log(`   walkTo(${tx}, ${tz}) →`, JSON.stringify(end));
};
// hold the tour clock: at 2–10 fps software GL, walking takes far longer than on a phone
await S(() => { window.__hold = setInterval(() => { const st = window.__retreva.store; const j = st.getState().jobs; if (j.active) st.setState({ jobs: { ...j, active: { ...j.active, remainingMs: 200000 } } }); }, 500); });
await walkTo(0, 8);
await p.waitForFunction(() => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= 1, null, { timeout: 30000 }).catch(() => {});
s = await st();
log('stop 1: reached the market lane together', s.active?.collected?.length === 1);
await p.screenshot({ path: `${OUT}/tour-stop1.png` });
// run far ahead: she stops and calls out
await place(1, -20, Math.PI);
await p.waitForSelector('.toast:has-text("Wait for me")', { timeout: 15000 }).catch(() => {});
log('run too far ahead and she stops: "Wait for me!"', await p.isVisible('.toast:has-text("Wait for me")'));
await place(0, 6, Math.PI);
await sleep(1500);
await walkTo(3.0, -12);
await p.waitForFunction(() => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= 2, null, { timeout: 30000 }).catch(() => {});
await walkTo(0, -30);
await p.waitForFunction(() => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= 3, null, { timeout: 30000 }).catch(() => {});
s = await st();
log('stops 2 and 3, in order', s.active?.collected?.length === 3);
await S(() => clearInterval(window.__hold));
await talk('sophie');
await choose('Finish the tour');
s = await st();
const tourTx = s.ledger.filter(([id]) => id.startsWith('job:island-tour:'));
log('finishing the tour pays once (no courier bonus on tours)', tourTx.length === 1 && tourTx[0][1] >= 2500, JSON.stringify(tourTx));
await sleep(1500);
const home = await S(() => window.__retreva.runtime.actors.get('sophie'));
log('after the tour Sophie goes back to her spot', Math.hypot(home.x + 2.2, home.z - 31.5) < 0.1);

// ── courier rank: with 5 errands done, deliveries pay 10% more (history set directly)
await S(() => {
  const st = window.__retreva.store; const j = st.getState().jobs;
  const fake = Array.from({ length: 5 }, (_, i) => ({ jobId: 'bale-run', runId: `fake-${i}`, outcome: 'completed', at: 0, elapsedMs: 1000, payout: 0 }));
  st.setState({ jobs: { ...j, history: [...j.history, ...fake], cooldownUntil: {} } });
});
await talk('femi');
await choose("I'll carry it");
await talk('bayo');
await choose('Hand over');
s = await st();
const bale = s.ledger.filter(([id]) => id.startsWith('job:bale-run:') && !id.includes('fake'));
log('a Regular courier earns a 10% rank bonus on errands', bale.length === 1 && bale[0][1] >= 2200 + 220, JSON.stringify(bale));
await S(() => window.__retreva.store.getState().openPhone('jobs'));
await p.waitForSelector('.careers');
log('the Jobs app shows the courier rank and skills', await p.isVisible('.careers :text("Courier · Regular")') && (await p.isVisible('.careers :text("Repair · level")')));
await p.screenshot({ path: `${OUT}/careers.png` });
log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
