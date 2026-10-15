// Homes playtest: buy furniture, rent, walk inside, furnish (comfort → well rested), the storage chest,
// persistence inside a room, leaving, buying and selling the home (belongings come back), and a sit-down
// meal at the Adeniyi Eatery (opening hours, joy). Money is topped up directly (noted below).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('homes');
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
  return { ui: s.ui, phase: s.phase, nearby: s.nearby?.id ?? null, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]), inside: s.world.inside, time: s.world.time, needs: s.life.needs, homes: s.life.homes, property: s.life.property, rested: s.life.wellRestedUntil ?? 0, bag: s.inventory.entries.map((e) => [e.itemId, e.quantity]) };
});
const place = (x, z, yaw) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
const near = (id, timeout = 15000) => p.waitForFunction((id) => window.__retreva.store.getState().nearby?.id === id, id, { timeout });
const playing = () => p.waitForFunction(() => window.__retreva.store.getState().phase === 'playing' && window.__retreva.store.getState().ui === 'play', null, { timeout: 60000 });
const setTime = (t) => S((t) => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, time: t } }); }, t);
const shot = async (n) => { await sleep(500); await p.screenshot({ path: `${OUT}/${n}.png` }); };
const noSideScroll = () => S(() => [...document.querySelectorAll('.sheet')].every((el) => el.scrollWidth <= el.clientWidth + 1) && document.documentElement.scrollWidth <= innerWidth + 1);

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Kemi');
await p.click('text=Start my life');
await playing();
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
// test setup: money for furniture, rent and buying (a normal ledger credit)
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 80000, ledger: [{ id: 'test-topup', amount: 80000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });
log('the joy need shows next to energy and fullness', await p.isVisible('.need[data-need="joy"]'));

// ── furniture from Okon's shop
await place(5.2 - 1.2, 4.6, Math.PI / 2);
await near('okon');
await p.keyboard.press('KeyE'); await sleep(250); await p.keyboard.press('Space');
await p.waitForSelector('button.choice');
await p.click('button.choice:has-text("Show me the furniture")');
await p.waitForSelector('button[aria-label="Bargain for Wooden bed frame"]');
let s = await st();
const preShop = s.bal;
// Okon's shop is a bargaining shop; buying at the asking price goes through the same store action as the Buy button
await S(() => { const g = window.__retreva.store.getState(); for (const id of ['wooden-bed', 'rechargeable-lamp', 'potted-plant']) g.buy('okon-home', id); });
await sleep(250);
s = await st();
log('furniture is for sale in Yaba and lands in the bag', ['wooden-bed', 'rechargeable-lamp', 'potted-plant'].every((id) => s.bag.some(([i]) => i === id)) && preShop - s.bal === 9500 + 1800 + 1500, `spent ${preShop - s.bal}`);
await S(() => window.__retreva.store.getState().closePanel());

// ── rent and go in
await place(-5.0, 23.4, -Math.PI / 2);
await near('yaba-room-door');
await p.keyboard.press('KeyE');
await p.waitForSelector('.sheet:has-text("Room on Adeniyi Street")');
log('the door shows both renting and the price to buy', await p.isVisible('.sheet :text("Or buy it outright")'));
await p.click('button:has-text("Rent this room")');
await p.click('button:has-text("Confirm · pay")');
await p.waitForSelector('button[data-act="enter"]');
s = await st();
log('renting creates a home record (rent, nothing placed)', s.property['yaba-room']?.tenure === 'rent' && Object.keys(s.property['yaba-room'].placed).length === 0);
await p.click('button[data-act="enter"]');
await playing();
await sleep(1500);
s = await st();
log('going inside loads the room (you stand inside the door)', s.inside?.interiorId === 'yaba-room' && Math.abs(s.inside.from.x + 5.0) < 0.6);
await shot('room-empty');
await near('exit');
log('by the door the prompt is to go outside', await p.isVisible('.prompt:has-text("outside")'));

// walls: try to walk straight out through the side wall
await place(2.0, 0, Math.PI / 2);
await p.keyboard.down('KeyD'); await p.keyboard.down('KeyW');
await sleep(2500);
await p.keyboard.up('KeyD'); await p.keyboard.up('KeyW');
const pos = await S(() => [window.__retreva.runtime.player.x, window.__retreva.runtime.player.z]);
log('the walls keep you in the room', Math.abs(pos[0]) < 2.5 && Math.abs(pos[1]) < 2.2, JSON.stringify(pos.map((v) => v.toFixed(2))));

// ── furnish
await place(-1.4, 1.2, -Math.PI / 2);
await near('slot:corner');
await p.keyboard.press('KeyE');
await p.waitForSelector('.furnish');
await p.click('.slot-chip[data-slot="bed"]');
await p.click('button[data-place="wooden-bed"]');
await sleep(250);
await p.click('.slot-chip[data-slot="side"]');
await p.click('button[data-place="rechargeable-lamp"]');
await sleep(250);
s = await st();
const placed = s.property['yaba-room'].placed;
log('furniture goes from the bag into its spots', placed.bed === 'wooden-bed' && placed.side === 'rechargeable-lamp' && !s.bag.some(([i]) => i === 'wooden-bed'));
log('comfort reaches 4 (well-rested threshold) and the panel says so', (await p.getAttribute('.comfort', 'data-comfort')) === '4' && (await p.isVisible('.comfort :text("well rested")')));
await p.setViewportSize({ width: 390, height: 844 });
await sleep(600);
await p.screenshot({ path: `${OUT}/furnish-mobile.png` });
log('the furnish panel fits a phone with no sideways scroll', await noSideScroll());
await p.setViewportSize({ width: 1280, height: 760 });
await S(() => window.__retreva.store.getState().closePanel());
await shot('room-furnished');
// walk straight at the new bed (it is bigger than the mattress was): you stop at its foot
await place(-1.6, 1.2, Math.PI);
await S(() => { window.__retreva.runtime.camera.yaw = Math.PI; });
await p.keyboard.down('KeyW');
await sleep(2000);
await p.keyboard.up('KeyW');
const atBed = await S(() => window.__retreva.runtime.player.z);
log('the new bed is solid (collision rebuilt for it)', atBed > -1.1 + 1.1 + 0.25 && atBed < 1.0, `stopped at z=${atBed.toFixed(2)}`);

// ── sleep at night in a comfy room
await setTime(22 * 60);
await S(() => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, energy: 30 } } }); });
await place(-0.5, -0.2, -Math.PI / 2);
await near('use:0');
await p.keyboard.press('KeyE');
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play' && window.__retreva.store.getState().life.needs.energy > 99, null, { timeout: 20000 });
s = await st();
log('sleeping in your bed: next morning 07:00, full energy, well rested', s.time % 1440 === 7 * 60 && Math.floor(s.time / 1440) === 1 && s.rested > s.time, `time=${s.time} rested=${s.rested}`);
await sleep(1800);
log('the energy chip shows you are well rested', await p.isVisible('.need.is-rested'));

// ── the storage chest
await place(1.2, -1.0, Math.PI);
await near('use:1');
await p.keyboard.press('KeyE');
await p.waitForSelector('.storage');
await p.click('button[data-store="potted-plant"]');
await sleep(250);
s = await st();
log('storing moves an item from the bag into the chest', s.property['yaba-room'].storage.some((x) => x.itemId === 'potted-plant') && !s.bag.some(([i]) => i === 'potted-plant'));
await p.click('button[data-take="potted-plant"]'); await sleep(250);
s = await st();
log('taking it back works', s.bag.some(([i]) => i === 'potted-plant') && s.property['yaba-room'].storage.length === 0);
await p.click('button[data-store="potted-plant"]'); await sleep(250);
await p.setViewportSize({ width: 360, height: 800 });
await sleep(600);
await p.screenshot({ path: `${OUT}/storage-mobile.png` });
log('the storage panel fits a 360px phone', await noSideScroll());
await p.setViewportSize({ width: 1280, height: 760 });
await S(() => window.__retreva.store.getState().closePanel());

// ── persistence while inside
await S(() => window.__retreva.saves.saveNow());
await p.reload();
await p.click('text=Continue');
await playing();
await sleep(1500);
s = await st();
log('after a reload you are still in your room, furniture and chest as you left them', s.inside?.interiorId === 'yaba-room' && s.property['yaba-room'].placed.bed === 'wooden-bed' && s.property['yaba-room'].storage[0]?.itemId === 'potted-plant');

// ── leave
await place(1.6, 1.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();
await sleep(1000);
s = await st();
const outPos = await S(() => [window.__retreva.runtime.player.x, window.__retreva.runtime.player.z]);
log('the door takes you back to the street where you came in', s.inside === null && Math.hypot(outPos[0] + 5.0, outPos[1] - 23.4) < 1, JSON.stringify(outPos));

// ── buy the home, then sell it
await place(-5.0, 23.4, -Math.PI / 2);
await near('yaba-room-door');
await p.keyboard.press('KeyE');
await p.waitForSelector('button[data-act="buy"]');
const preBuy = (await st()).bal;
await p.click('button[data-act="buy"]');
await p.click('button[data-act="confirm-buy"]');
await sleep(300);
s = await st();
log('buying the room you rent: ₦45,000 once, now owned, furniture stays', s.property['yaba-room'].tenure === 'own' && preBuy - s.bal === 45000 && s.ledger.filter(([id]) => id.startsWith('buyhome:yaba-room')).length === 1 && s.property['yaba-room'].placed.bed === 'wooden-bed');
log('an owned home shows its valuation (85%)', await p.isVisible('.tenure :text("Worth ₦38,000")'));
await shot('owned');
await p.click('button[data-act="sell"]');
await p.waitForSelector('button[data-act="confirm-sell"]');
const preSell = await st();
log('selling asks first (nothing changes yet)', preSell.homes.includes('yaba-room') && preSell.bal === s.bal);
await p.click('button[data-act="confirm-sell"]');
await sleep(300);
s = await st();
log('selling pays the valuation once and returns furniture and stored things to the bag', s.bal - preSell.bal === 38000 && s.ledger.filter(([id]) => id.startsWith('sellhome:')).length === 1 && !s.homes.includes('yaba-room') && ['wooden-bed', 'rechargeable-lamp', 'potted-plant'].every((id) => s.bag.some(([i]) => i === id)));

// ── a sit-down meal at the Adeniyi Eatery
await setTime(1440 + 13 * 60);
await place(6.5, -25.4, Math.PI);
await near('yaba-eatery-door');
await p.keyboard.press('KeyE');
await playing();
await sleep(1500);
s = await st();
log('the eatery door leads into the restaurant', s.inside?.interiorId === 'yaba-eatery');
await shot('eatery');
await S(() => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, fullness: 30, joy: 40 } } }); });
await place(1.2, 1.0, Math.PI);
await near('use:1');
await p.keyboard.press('KeyE');
await p.waitForSelector('.menu');
const preMeal = await st();
await p.click('button[data-dish="jollof-plate"]');
await p.click('button[data-act="order"]');
await p.waitForFunction(() => window.__retreva.store.getState().resting?.at === 'meal', null, { timeout: 5000 }).catch(() => {});
await sleep(800);
await p.screenshot({ path: `${OUT}/eating.png` });
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 15000 });
s = await st();
const meals = s.ledger.filter(([id]) => id.startsWith('meal'));
log('ordering a meal: paid once, you sit and eat, fuller and happier', preMeal.bal - s.bal === 3000 && meals.length === 1 && s.needs.fullness > 30 && s.needs.joy >= 40 + 22 - 1, `fullness ${s.needs.fullness.toFixed(0)} joy ${s.needs.joy.toFixed(0)}`);
await place(2.2, 2.6, 0);
await near('exit');
await p.keyboard.press('KeyE');
await playing();
await setTime(1440 + 23 * 60 + 30);
await place(6.5, -25.4, Math.PI);
await near('yaba-eatery-door');
await p.keyboard.press('KeyE');
await sleep(500);
s = await st();
log('late at night the eatery is closed (and says when it opens)', s.inside === null && (await p.isVisible('.toast:has-text("closed")')));
log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
