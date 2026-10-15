// Living-city playtest (Architecture V6, milestone 2): traffic moves, keeps lanes, stops for people,
// steers around the parked danfo; pedestrians stop to do things; characters render; budgets hold.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('city');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const S = (fn, a) => p.evaluate(fn, a);
const cars = () => S(() => window.__retreva.runtime.traffic.map((c) => ({ x: c.x, z: c.z, speed: c.speed, lane: c.lane })));
const place = (x, z, yaw = 0) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Kola');
await p.click('text=Start my life');
await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
await S(() => window.__retreva.store.getState().updateSettings({ shadows: 'off', tips: false }));
await place(-9.4, -3.6, 0); // stand off the road while traffic is sampled
// a settings change can rebuild the canvas; wait for traffic to be back before sampling
await p.waitForFunction(() => window.__retreva.runtime.traffic.length > 0, null, { timeout: 60000 });
await sleep(2500);

let c0 = await cars();
log('Yaba has its 6 data-defined vehicles', c0.length === 6);
await sleep(2500);
let c1 = await cars();
const moved = c1.filter((c, i) => Math.abs(c.z - c0[i].z) > 1).length;
log('vehicles drive along the road', moved >= 5, `${moved}/6 moved`);
log('each vehicle keeps its lane side', c1.every((c) => (c.lane === 0 ? c.x > 0 : c.x < 0.6)));

// stop for a person standing in the lane ahead
const target = c1.findIndex((c) => c.lane === 0 && c.z < 10 && c.z > -40);
const t = c1[target >= 0 ? target : 0];
await place(2, t.z + 9, Math.PI);
let stopped = false;
let minGap = 99;
for (let i = 0; i < 60 && !stopped; i++) {
  await sleep(250);
  const c = (await cars())[target >= 0 ? target : 0];
  const pz = await S(() => window.__retreva.runtime.player.z);
  minGap = Math.min(minGap, pz - c.z);
  if (c.speed < 0.3 && pz - c.z > 2) stopped = true;
}
await p.screenshot({ path: `${OUT}/stopped-for-player.png` });
log('traffic stops for a person in its lane (no driving through you)', stopped && minGap > 2, `closest ${minGap.toFixed(2)} m`);
await place(-9.4, -3.6, 0);

// steer around the parked danfo at (-2.1, 11.5) in the southbound lane
let swerve = null;
for (let i = 0; i < 160 && swerve === null; i++) {
  await sleep(250);
  const near = (await cars()).find((c) => c.lane === 1 && Math.abs(c.z - 11.5) < 1.5);
  if (near) swerve = near.x;
}
log('southbound traffic swings out around the parked danfo', swerve !== null && swerve > -0.8, `x at the danfo: ${swerve?.toFixed(2)}`);

// pedestrians with a purpose
let seen = null;
for (let i = 0; i < 300 && !seen; i++) {
  await sleep(500);
  seen = await S(() => [...window.__retreva.runtime.activity.entries()].find(([, a]) => a) ?? null);
}
log('pedestrians stop to do things (shop, wait, eat, chat, photo)', !!seen, seen ? `${seen[0]} → ${seen[1]}` : 'none within the window');
await place(4.6, 30, Math.PI);
await sleep(1500);
await p.screenshot({ path: `${OUT}/street.png` });

const perf = await S(() => window.__retreva.runtime.perf);
log('scene stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// Ikeja traffic loads; island and beach stay pedestrian
for (const [id, want] of [['ikeja-village', 5], ['lagos-island', 0], ['lekki-beach', 0]]) {
  await S((id) => { const st = window.__retreva.store; st.setState({ transit: { from: st.getState().destinationId, to: id, fare: 0, firstVisit: false } }); st.getState().arrive(); }, id);
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
  await sleep(1500);
  const n = (await cars()).length;
  log(`${id}: ${want ? `${want} vehicles` : 'no road traffic'}`, n === want, `${n}`);
}
log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
