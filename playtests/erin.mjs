// Erin-Ijesha playtest: the seventeenth city pack and the waterfall climb. Danfo to Ikeja, buses to Ibadan and Ile-Ife,
// then Tunde's bus from Ife on to Erin-Ijesha (city loads first, ₦2,500 once, 70 min, south-west map);
// the draw-call budget; the falls gate; the Water Run (paid once); too tired → no climb; the climb: ₦1,500 gate fee
// once a day, on foot up the path beside the falls, the levels reached one by one; a reload mid-climb puts you back
// at the gate; climb again free the same day, all the way to Level 7 and back (joy, energy, 2 h 30); then a short
// climb, turning back after Level 2 (less joy, less time); pounded yam; rent and enter the guesthouse room; reload;
// Ayo's bus to Osogbo (₦2,500 once). Bus money is topped up directly (test-topup).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('erin');
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
await p.fill('#name', 'Akinla');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
await setTime(1440 + 7 * 60);
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 40000, ledger: [{ id: 'test-topup', amount: 40000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── Yaba → Ikeja → Ibadan → Ile-Ife → Erin-Ijesha
await talk('kunle');
await choose('Take a danfo');
await p.click('button[aria-label^="Ride to Ikeja"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'ikeja-village' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
await bus('alhaji-sule', 'Bus to Ibadan for ₦6,000', 'ibadan-dugbe');
await bus('conductor-rasaki', 'Bus to Ile-Ife for ₦4,000', 'ife-enuwa');
let s = await st();
log('you reach Ile-Ife by bus from Ibadan', s.dest === 'ife-enuwa');
log('Erin-Ijesha is not loaded yet (it is a city pack)', !(await S(() => window.__retreva.cities.isCityLoaded('erin'))));
const t0 = await S(() => window.__retreva.store.getState().world.time);
const ride = await bus('conductor-tunde', 'Bus to Erin-Ijesha for ₦2,500', 'erin-olumirin');
s = await st();
const t1 = await S(() => window.__retreva.store.getState().world.time);
log('Tunde’s bus goes on to Erin-Ijesha for ₦2,500 in 70 minutes, on the south-west map (the city loads first)', ride.shown && ride.map && s.dest === 'erin-olumirin' && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -2500).length === 1 && t1 - t0 === 70, `+${t1 - t0} min`);
await shot('erin-arrival');
await budget('Erin-Ijesha');

// ── the falls gate
await place(0, -35, Math.PI);
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = Math.PI; r.camera.pitch = 0.1; });
await p.waitForFunction(() => window.__retreva.store.getState().world.discovered.includes('erin-gate'), null, { timeout: 20000 }).catch(() => {});
log('the falls gate is found at the top of the street', (await st()).discovered.includes('erin-gate'));
await shot('falls-from-gate');

// ── the Water Run
await setTime(2 * 1440 + 9 * 60);
await talk('baba-femi');
await choose("I'll carry it");
await talk('iya-bose');
await choose('Hand over the crate');
s = await st();
const run = s.ledger.filter(([id]) => id.startsWith('job:water-run:'));
log('the Water Run pays once (₦1,800 or more)', run.length === 1 && run[0][1] >= 1800, JSON.stringify(run));

// ── too tired to climb
const needs = (energy, joy) => S(([energy, joy]) => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, energy, joy } } }); }, [energy, joy]);
const toGate = async () => {
  await place(2.4, -34.6, Math.PI);
  await near('olumirin-gate');
};
await needs(20, 40);
await toGate();
await p.keyboard.press('KeyE');
await sleep(800);
s = await st();
log('too tired: the gate won’t let you start (and charges nothing)', s.ui === 'play' && !s.ledger.some(([id]) => id.startsWith('climb:')));

// ── the climb, and a reload half way
const day = await S(() => Math.floor(window.__retreva.store.getState().world.time / 1440) + 1);
await needs(80, 40);
await toGate();
s = await st();
const preFee = s.bal;
await p.keyboard.press('KeyE');
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'drive', null, { timeout: 10000 }).catch(() => {});
s = await st();
log('at the gate you pay ₦1,500 once and start up the path on foot', s.ui === 'drive' && preFee - s.bal === 1500 && s.ledger.filter(([id]) => id === `climb:olumirin:d${day}`).length === 1 && (await p.isVisible('.drive-hud[data-climb="olumirin"]')));
await p.waitForFunction(() => window.__retreva.runtime.player.y >= 6, null, { timeout: 90000 }).catch(() => {});
const mid = await S(() => ({ y: window.__retreva.runtime.player.y, z: window.__retreva.runtime.player.z, reached: window.__retreva.store.getState().drive?.spotted }));
log('climbing: you rise up the steps, the levels reached in order', mid.y >= 6 && JSON.stringify(mid.reached) === JSON.stringify(['olumirin-1', 'olumirin-2', 'olumirin-3'].slice(0, mid.reached.length)) && mid.reached.length >= 2, JSON.stringify(mid));
await shot('climb-steps');
await S(() => window.__retreva.saves.saveNow());
await sleep(500);
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Continue');
await playing();
await sleep(1500);
const back = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z, ui: window.__retreva.store.getState().ui, dest: window.__retreva.store.getState().destinationId }));
log('a reload mid-climb puts you back at the gate', back.dest === 'erin-olumirin' && back.ui === 'play' && Math.abs(back.z + 34) < 1.5 && Math.abs(back.x - 3.4) < 1.5, JSON.stringify(back));
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));

// ── all the way to the top, free the second time today
await needs(80, 40);
const tTop = await S(() => window.__retreva.store.getState().world.time);
await toGate();
await p.keyboard.press('KeyE');
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'drive', null, { timeout: 10000 }).catch(() => {});
await p.waitForFunction(() => window.__retreva.store.getState().drive?.spotted.includes('olumirin-5'), null, { timeout: 120000 }).catch(() => {});
await shot('climb-level-5');
await p.waitForFunction(() => window.__retreva.store.getState().drive?.spotted.includes('olumirin-7'), null, { timeout: 120000 }).catch(() => {});
await S(() => { const r = window.__retreva.runtime; r.camera.yaw = 0; });
await shot('climb-top');
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 120000 });
await sleep(800);
s = await st();
const top = await S(() => ({ z: window.__retreva.runtime.player.z, y: window.__retreva.runtime.player.y, t: window.__retreva.store.getState().world.time, n: window.__retreva.store.getState().life.needs, d: window.__retreva.store.getState().world.discovered }));
const levels = Array.from({ length: 7 }, (_, i) => `olumirin-${i + 1}`).filter((id) => top.d.includes(id));
log('to Level 7 and back down: every level reached, joy up, tired, 2 h 30 on the clock, back at the gate', levels.length === 7 && top.n.joy >= 70 && top.n.energy < 80 && top.t - tTop === 150 && Math.abs(top.z + 34) < 1.5 && top.y === 0, JSON.stringify({ levels: levels.length, joy: top.n.joy.toFixed(0), energy: top.n.energy.toFixed(0), dt: top.t - tTop }));
log('the gate fee was paid once for the day (climbing again is free)', s.ledger.filter(([id]) => id.startsWith('climb:')).length === 1);

// ── a short climb: turn back after Level 2
await needs(80, 40);
const tShort = await S(() => window.__retreva.store.getState().world.time);
await toGate();
await p.keyboard.press('KeyE');
await p.waitForFunction(() => window.__retreva.store.getState().drive?.spotted.includes('olumirin-2'), null, { timeout: 90000 }).catch(() => {});
await p.click('.drive-hud button:has-text("Head back down")');
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 10000 }).catch(() => {});
const short = await S(() => ({ t: window.__retreva.store.getState().world.time, n: window.__retreva.store.getState().life.needs, z: window.__retreva.runtime.player.z }));
log('turning back after Level 2: less joy than the top, less time, back at the gate', short.n.joy > 40 && short.n.joy < 70 && short.t - tShort < 150 && short.t - tShort >= 10 && Math.abs(short.z + 34) < 1.5, JSON.stringify({ joy: short.n.joy.toFixed(0), dt: short.t - tShort }));

// ── Mama Funmi
await talk('mama-funmi');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Pounded yam"]');
const preFood = (await st()).bal;
await p.click('button[aria-label^="Buy Pounded yam"]');
await sleep(400);
s = await st();
log('pounded yam & efo is ₦2,000 and goes in the bag', preFood - s.bal === 2000 && s.bag.includes('ijesha-iyan'));
await S(() => window.__retreva.store.getState().closePanel());

// ── rent the guesthouse room and go in
await place(5.0, -5, Math.PI / 2);
await near('erin-guesthouse-door');
await p.keyboard.press('KeyE');
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.click('button[data-act="enter"]');
await playing();
await sleep(1200);
s = await st();
log('rent the Falls View room (₦5,500) and walk inside', s.homes.includes('erin-guesthouse') && s.inside?.interiorId === 'erin-guesthouse' && s.ledger.some(([id, a]) => id === 'home:erin-guesthouse' && a === -5500));
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
log('after a reload you continue at Erin-Ijesha', s.dest === 'erin-olumirin');
await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
await bus('conductor-ayo', 'Bus to Osogbo for ₦2,500', 'osogbo-oja-oba');
s = await st();
log('Ayo’s bus goes to Osogbo for ₦2,500', s.dest === 'osogbo-oja-oba' && s.ledger.filter(([id, a]) => id.startsWith('coach-') && a === -2500).length === 2);

log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
await b.close();
process.exit(passed === results.length ? 0 : 1);
