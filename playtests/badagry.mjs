// Badagry playtest: the new Lagos district on the lagoon. Danfo from Yaba (fare once), the map pin, the
// explorer goal now counting five areas, landmarks, the Heritage Walk (an escort tour), the Catch Run
// delivery (paid once, then cooldown), Mama Dossou's buka, renting the room by the marina, the Heritage
// Drums in the Events app, the jetty and the ferry to Lekki and back, the draw-call budget, reload, and a 360px phone.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('badagry');
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
  return { ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]), active: s.jobs.active,
    world: s.world, bag: s.inventory.entries.map((e) => [e.itemId, e.quantity]), property: s.life.property };
});
const place = (x, z, yaw) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
const near = (id) => p.waitForFunction((id) => window.__retreva.store.getState().nearby?.id === id, id, { timeout: 20000 });
const talk = async (npcId) => {
  // people are placed a moment after an area loads
  await p.waitForFunction((id) => window.__retreva.runtime.actors.has(id), npcId, { timeout: 15000 }).catch(() => {});
  const at = await S((id) => { const a = window.__retreva.runtime.actors.get(id); return [a.x, a.z]; }, npcId);
  await place(at[0] + (at[0] > 0 ? -1.2 : 1.2), at[1], at[0] > 0 ? Math.PI / 2 : -Math.PI / 2);
  await near(npcId);
  await p.keyboard.press('KeyE');
  await sleep(250);
  await p.keyboard.press('Space');
  await p.waitForSelector('button.choice', { timeout: 10000 });
};
const choose = async (label) => { await p.click(`button.choice:has-text("${label}")`); await sleep(350); };
const playing = () => p.waitForFunction(() => window.__retreva.store.getState().phase === 'playing', null, { timeout: 60000 });
const topUp = (n) => S((n) => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + n, ledger: [{ id: `test-topup-${Date.now()}`, amount: n, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); }, n);

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Ayo');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
// mid-morning, so the museum, the buka and the craft stall are all open (the clock is held by ?clock=paused)
await S(() => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, time: 10 * 60 } }); });
// test setup: the four older Lagos areas count as visited, so Badagry is the last one for the explorer goal
await S(() => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, visited: ['lagos-adeniyi', 'lagos-island', 'lekki-beach', 'ikeja-village'] } }); });
await sleep(2500);
let s = await st();
log('four areas are no longer "every area of Lagos" (Badagry counts too)', !s.world.goalsDone.includes('explorer'));

// ── danfo from Yaba
await talk('kunle');
await choose('Take a danfo');
await p.waitForSelector('button[aria-label^="Ride to Badagry"]');
log('the Travel picker offers Badagry for ₦1,800', await p.isVisible('button[aria-label="Ride to Badagry for ₦1,800"]'));
log('the Lagos map has a Badagry pin', await p.isVisible('svg.lagos-map text:has-text("Badagry")'));
await p.screenshot({ path: `${OUT}/01-travel-map.png` });
await p.click('button[aria-label^="Ride to Badagry"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'badagry-marina' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(3000);
s = await st();
// the balance also moves by the goal rewards paid on arrival, so the fare is read from the ledger
const fares = s.ledger.filter(([, a]) => a < 0);
log('arrives at Badagry Marina; fare ₦1,800 charged once', s.dest === 'badagry-marina' && fares.length === 1 && fares[0][1] === -1800, JSON.stringify(fares));
log('Badagry marked visited; explorer goal paid once', s.world.visited.includes('badagry-marina') && s.world.goalsDone.includes('explorer') && s.ledger.filter(([id]) => id === 'goal:explorer').length === 1);
log('Mr. Hunpatin’s welcome arrives in Messages', s.world.messages.some((m) => m.from === 'Mr. Hunpatin'));
await p.screenshot({ path: `${OUT}/02-arrival.png` });

// ── the scene: budget
await sleep(2000);
const perf = await S(() => window.__retreva.runtime.perf);
log('scene stays within budget (≤ 80 draw calls, ≤ 60k triangles)', perf.drawCalls <= 80 && perf.triangles <= 60000, JSON.stringify(perf));

// ── Heritage Walk: locked until the four sights are found
await talk('marcus');
log('Marcus only hires a guide who knows the sights (locked first)', await p.isVisible('.dialogue .line:has-text("Find them first")'));
await choose('I will');
for (const [x, z, yaw] of [[-4.6, 16, -Math.PI / 2], [6.6, 3, Math.PI / 2], [-4.6, -8, -Math.PI / 2], [10.5, -28, Math.PI / 2]]) { await place(x, z, yaw); await sleep(1500); }
await p.waitForFunction(() => ['bdg-museum', 'bdg-agia', 'bdg-storey', 'bdg-jetty'].every((i) => window.__retreva.store.getState().world.discovered.includes(i)), null, { timeout: 20000 }).catch(() => {});
s = await st();
log('walking past the museum, Agia Tree, First Storey Building and jetty discovers all four', ['bdg-museum', 'bdg-agia', 'bdg-storey', 'bdg-jetty'].every((i) => s.world.discovered.includes(i)));
// on the jetty, looking out to Gberefu
await place(14.5, -28, Math.PI / 2);
await S(() => { const c = window.__retreva.runtime.camera; c.yaw = Math.PI / 2; c.pitch = 0.12; });
await sleep(2500);
await p.screenshot({ path: `${OUT}/03-jetty-gberefu.png` });
await place(0, 30, 0);
await sleep(800);
await talk('marcus');
await choose('Guide Marcus');
s = await st();
log('with the sights found, Marcus hires you and the walk starts', s.active?.jobId === 'heritage-walk');
const walkTo = async (tx, tz) => {
  // software GL runs at 2–5 fps and the guest walks in game time, so allow a couple of real minutes per stop
  for (let i = 0; i < 360; i++) {
    const r = await S(([tx, tz]) => {
      const pl = window.__retreva.runtime.player;
      const g = window.__retreva.runtime.actors.get('marcus');
      const d = Math.hypot(tx - pl.x, tz - pl.z);
      const gap = Math.hypot(g.x - pl.x, g.z - pl.z);
      if (gap < 4 && d > 0.5) { const k = Math.min(1, d) / d; pl.x += (tx - pl.x) * k; pl.z += (tz - pl.z) * k; }
      return { d };
    }, [tx, tz]);
    if (r.d < 1) break;
    await sleep(350);
  }
};
// hold the walk's clock: at 2–10 fps software GL, walking takes far longer than on a phone
await S(() => { window.__hold = setInterval(() => { const st = window.__retreva.store; const j = st.getState().jobs; if (j.active) st.setState({ jobs: { ...j, active: { ...j.active, remainingMs: 230000 } } }); }, 500); });
const stops = [[-4.6, 16], [6.6, 3], [-4.6, -8], [9.6, -28]];
for (let i = 0; i < stops.length; i++) {
  await walkTo(stops[i][0], stops[i][1]);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, i + 1, { timeout: 30000 }).catch(() => {});
  if (i === 0) await p.screenshot({ path: `${OUT}/04-walk-museum.png` });
}
s = await st();
// a tour records stops by their index in the job's list: museum, Agia Tree, First Storey Building, jetty
log('all four stops, in order', s.active?.collected?.join(',') === '0,1,2,3', JSON.stringify(s.active?.collected));
await S(() => clearInterval(window.__hold));
await talk('marcus');
await choose('Finish the walk');
s = await st();
const walkTx = s.ledger.filter(([id]) => id.startsWith('job:heritage-walk:'));
log('finishing the walk pays once (₦3,000 or more)', walkTx.length === 1 && walkTx[0][1] >= 3000, JSON.stringify(walkTx));

// ── Catch Run: jetty to the buka, paid once, then the next canoe is a while away
await talk('sewanu');
await choose("I'll carry it");
await talk('mama-dossou');
await choose('Hand over the fish');
s = await st();
const catchTx = s.ledger.filter(([id]) => id.startsWith('job:catch-run:'));
log('Catch Run pays once (₦1,600 or more)', catchTx.length === 1 && catchTx[0][1] >= 1600, JSON.stringify(catchTx));
await talk('sewanu');
log('straight after, Sewanu has no new basket yet (cooldown)', await p.isVisible('.dialogue .line:has-text("next canoe")'));
await choose('Will do');

// ── Mama Dossou's buka
await talk('mama-dossou');
await choose('What do you have?');
await p.waitForSelector('button[aria-label^="Buy Coconut candy"]');
const preShop = (await st()).bal;
await p.click('button[aria-label^="Buy Coconut candy"]');
await sleep(400);
s = await st();
log('the buka sells coconut candy for ₦300, into the bag', preShop - s.bal === 300 && s.bag.some(([i]) => i === 'coconut-candy'));
await p.screenshot({ path: `${OUT}/05-buka.png` });
await S(() => window.__retreva.store.getState().closePanel());

// ── the ferry: Badagry jetty → Lekki boat landing → back, boarded like a danfo (talk to the captain)
await topUp(8000);
const hold = async (key, ms) => { await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); await sleep(300); };
log('the ferry captain wears the travel marker and shows on the map like a conductor', await S(() => window.__retreva.runtime.actors.has('captain-ebi')));
// walk from the waterfront out along the jetty with the keys: it holds you up over the water
await place(7.6, -28, Math.PI / 2);
await S(() => { window.__retreva.runtime.camera.yaw = Math.PI / 2; });
await sleep(600);
await hold('KeyW', 4000);
let pl = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z }));
log('you can walk out onto the jetty over the lagoon', pl.x > 10 && Math.abs(pl.z + 28) < 1.2, JSON.stringify(pl));
await p.screenshot({ path: `${OUT}/05a-on-the-jetty.png` });
await talk('captain-ebi');
log('Captain Ebi offers the ferry to Lekki', await p.isVisible('button.choice:has-text("Take the ferry")'));
await choose('Take the ferry');
await p.waitForSelector('button[aria-label^="Boat to Lekki"]', { timeout: 10000 }).catch(() => {});
log('the ferry desk offers Lekki for ₦3,000 (and nothing by road)', await p.isVisible('button[aria-label="Boat to Lekki for ₦3,000"]') && (await p.locator('.travel-row').count()) === 1);
await p.screenshot({ path: `${OUT}/05b-ferry-picker.png` });
let preBoat = (await st()).bal;
await p.click('button[aria-label^="Boat to Lekki"]');
await sleep(1200);
log('the trip shows a ferry crossing the lagoon', await p.isVisible('.transit svg [data-boat="yes"]') && (await p.isVisible('.transit :text("On the ferry")')));
await p.screenshot({ path: `${OUT}/05c-ferry-crossing.png` });
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'lekki-beach' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
s = await st();
pl = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z }));
let boats = s.ledger.filter(([id]) => id.startsWith('boat'));
log('the ferry lands you at the Lekki boat landing; ₦3,000 once', s.dest === 'lekki-beach' && Math.hypot(pl.x - 10.4, pl.z - 34) < 1.5 && boats.length === 1 && boats[0][1] === -3000, JSON.stringify({ pl, boats }));
await p.screenshot({ path: `${OUT}/05d-lekki-landing.png` });
// in Lekki, board from the landing itself (the other way in)
await place(11.0, 34, Math.PI / 2);
await near('lekki-ferry');
await p.keyboard.press('KeyE');
await p.waitForSelector('button[aria-label^="Boat to Badagry"]', { timeout: 10000 });
await p.keyboard.press('Escape');
await sleep(400);
await talk('captain-tari');
await choose('Take the ferry');
await p.waitForSelector('button[aria-label^="Boat to Badagry"]', { timeout: 10000 });
log('in Lekki, Captain Tari (or the landing) takes you back to Badagry', await p.isVisible('button[aria-label="Boat to Badagry for ₦3,000"]'));
await p.click('button[aria-label^="Boat to Badagry"]');
await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'badagry-marina' && g.phase === 'playing' && g.ui === 'play'; }, null, { timeout: 60000 });
await sleep(2500);
s = await st();
pl = await S(() => ({ x: window.__retreva.runtime.player.x, z: window.__retreva.runtime.player.z }));
boats = s.ledger.filter(([id]) => id.startsWith('boat'));
log('and back: the ferry from Lekki ties up at the Badagry jetty (two boat fares in all)', s.dest === 'badagry-marina' && Math.hypot(pl.x - 10.4, pl.z + 28) < 1.5 && boats.length === 2, JSON.stringify(pl));
// put the clock back to mid-morning (two crossings took most of the day)
await S(() => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, time: 10 * 60 } }); });

// ── the room by the marina
await topUp(5000);
await place(-5.0, 4.5, -Math.PI / 2);
await near('badagry-room-door');
await p.keyboard.press('KeyE');
await p.waitForSelector('.sheet:has-text("Room by the Marina")');
const preRent = (await st()).bal;
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.waitForSelector('button[data-act="enter"]');
s = await st();
log('renting the room by the marina: ₦2,500 once', s.property['badagry-room']?.tenure === 'rent' && preRent - s.bal === 2500);
await p.click('button[data-act="enter"]');
await p.waitForFunction(() => window.__retreva.store.getState().world.inside?.interiorId === 'badagry-room', null, { timeout: 30000 }).catch(() => {});
await sleep(2000);
s = await st();
log('you can walk into the room', s.world.inside?.interiorId === 'badagry-room');
await p.screenshot({ path: `${OUT}/06-room.png` });

// ── Events app lists the drums
await S(() => window.__retreva.store.getState().openPhone('events'));
await p.waitForSelector('.event-card[data-event="heritage-drums"]', { timeout: 10000 }).catch(() => {});
log('the Events app lists Heritage Drums on the Marina', await p.isVisible('.event-card[data-event="heritage-drums"]:has-text("Badagry")'));
await S(() => window.__retreva.store.getState().closePanel());

// ── reload: still in Badagry, room kept
await S(() => window.__retreva.saves.saveNow());
await sleep(1500);
await p.reload();
await p.waitForSelector('text=Continue', { timeout: 20000 });
await p.click('text=Continue');
await playing();
await sleep(2000);
s = await st();
log('after a reload you are still in Badagry with the room rented', s.dest === 'badagry-marina' && s.property['badagry-room']?.tenure === 'rent');

// ── a 360px phone (same saved game, narrow viewport)
await p.setViewportSize({ width: 360, height: 800 });
await sleep(2500);
const fit = await S(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
log('on a 360px phone Badagry still fits with no sideways scroll', (await st()).dest === 'badagry-marina' && fit);
await p.screenshot({ path: `${OUT}/07-phone.png` });

log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
