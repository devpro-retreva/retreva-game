// Expansion playtest: travel between Lagos areas, collect job, haggling, goals, tips, messages, persistence.
import { launch, BASE_URL, outDir } from './lib.mjs';
import fs from 'node:fs';
const OUT = outDir('expansion');
fs.mkdirSync(OUT, { recursive: true });
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
const st = () => S(() => {
  const s = window.__retreva.store.getState();
  return { queue: s.tipQueue, phase: s.phase, ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, world: s.world, tip: s.tip?.id ?? null, active: s.jobs.active, inv: s.inventory.entries.map((e) => [e.itemId, e.quantity, e.purchasePrice]), haggle: s.haggle, banner: s.banner?.title ?? null, ledger: s.wallet.ledger.map((t) => t.id) };
});
const placeNear = (x, z, yaw = 0) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
const talk = async (npcId) => {
  await p.waitForFunction((id) => window.__retreva.store.getState().nearby?.id === id, npcId, { timeout: 15000 });
  await p.keyboard.press('KeyE');
  await sleep(250);
  await p.keyboard.press('Space');
  await sleep(300);
};
const choose = async (label) => { await p.click(`button.choice:has-text("${label}")`); await sleep(300); };
const waitPlaying = () => p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
const shot = async (name) => { await sleep(1200); await p.screenshot({ path: `${OUT}/${name}.png` }); };

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Tayo');
await p.click('text=Start my life');
await waitPlaying();
let s = await st();
log('area title card shows on arrival', s.banner === 'Yaba', `banner=${s.banner}`);
const tipHiddenUnderBanner = !(await p.isVisible('.tip-card'));
await S(() => window.__retreva.store.getState().updateSettings({ shadows: 'off' }));
// mid-morning: every stall is open (Ada opens at 09:00, and ?clock=paused holds the time; rides still add their minutes)
await S(() => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, time: 10 * 60 } }); });
await sleep(4500);
s = await st();
log('welcome tip waits for the title card, then appears', tipHiddenUnderBanner && s.tip === 'welcome' && (await p.isVisible('.tip-card')));
await shot('01-yaba-tip');
await p.click('.tip-card button:has-text("Got it")');
s = await st();
log('tip dismisses and is remembered', s.tip === null && s.world.seenTips.includes('welcome'));

// ── travel from Yaba to Lekki via Kunle
await placeNear(-4.2, 11.5, -Math.PI / 2);
await talk('kunle');
await choose('Take a danfo');
s = await st();
log('conductor opens the travel picker', s.ui === 'travel');
await shot('02-travel-panel');
const balBefore = s.bal;
await p.click('button[aria-label^="Ride to Lekki"]');
await sleep(600);
s = await st();
log('transit overlay plays the trip', s.ui === 'transit');
await p.screenshot({ path: `${OUT}/03-transit.png` });
await waitPlaying();
await sleep(1500);
s = await st();
log('arrives in Lekki at the bus stop', s.dest === 'lekki-beach', `dest=${s.dest}`);
log('fare charged once', balBefore - s.bal === 1000 || s.bal - balBefore === 200 - 1000, `before ${balBefore}, after ${s.bal}`);
log('Lekki marked visited and ride counted', s.world.visited.includes('lekki-beach') && s.world.rides === 1);
log('new-area tip shown or queued', s.tip === 'new-area' || s.queue.includes('new-area'), `showing ${s.tip}, queued ${s.queue}`);
await shot('04-lekki-arrival');
await sleep(2500);
s = await st();
log('first-ride goal paid once', s.world.goalsDone.includes('first-ride') && s.ledger.filter((id) => id === 'goal:first-ride').length === 1);
log('welcome text arrives in Messages', s.world.messages.some((m) => m.from === 'Tolu'));
const badge = await p.isVisible('.phone-btn .hud-badge');
log('unread badge on the phone button', badge);
await p.click('.tip-card button:has-text("Got it")').catch(() => {});

// ── beach clean-up (collect job)
await placeNear(5.0, 2.4, Math.PI / 2);
await talk('tolu');
await choose("I'll clean up");
s = await st();
log('clean-up job accepted', s.active?.jobId === 'beach-cleanup');
await shot('05-cleanup-active');
const spots = [[4, 26], [-2, 18], [7.5, 15], [1, 4], [-4.5, -2], [6, -12]];
for (const [x, z] of spots) {
  await placeNear(x + 0.2, z + 0.2);
  await p.waitForFunction((n) => (window.__retreva.store.getState().jobs.active?.collected?.length ?? 0) >= n, spots.indexOf(spots.find(([a, b2]) => a === x && b2 === z)) + 1, { timeout: 15000 }).catch(() => {});
}
s = await st();
log('walking over litter picks it up (6/6)', (s.active?.collected?.length ?? 0) === 6, `collected ${s.active?.collected?.length}`);
const preClean = s.bal;
await placeNear(5.0, 2.4, Math.PI / 2);
await talk('tolu');
await choose('Hand over the bag');
await sleep(500);
s = await st();
log('report pays the clean-up', s.bal - preClean >= 1800, `+${s.bal - preClean}`);
await sleep(2500);
s = await st();
log('beach guardian goal completes', s.world.goalsDone.includes('beach-clean'));
log('after the first pay a tip points to saving for a trip', s.tip === 'save-up' || s.queue.includes('save-up') || s.world.seenTips.includes('save-up'), `showing ${s.tip}, queued ${s.queue}`);
await S(() => window.__retreva.store.getState().openPhone('jobs'));
await p.click('button[role="tab"]:has-text("Goals")');
await p.waitForSelector('.goal-row:has-text("First flight fund")');
const fundRow = (await p.textContent('.goal-row:has-text("First flight fund")')) ?? '';
log('the First flight fund goal counts savings in naira towards the ₦450,000 Accra return', new RegExp(`₦${s.bal.toLocaleString('en-NG')} of ₦450,000`).test(fundRow), fundRow.trim());
await shot('08b-flight-fund');
await S(() => window.__retreva.store.getState().closePanel());

// ── landmark discovery
await placeNear(7.2, 1.0);
await sleep(1200);
s = await st();
log('walking near a landmark discovers it', s.world.discovered.includes('lekki-tower'), JSON.stringify(s.world.discovered));

// ── haggling with Ada
await placeNear(-3.8, -14, -Math.PI / 2);
await talk('ada');
await choose('Let me see');
await p.click('button[aria-label="Bargain for Shell necklace"]');
await sleep(300);
await shot('06-haggle-open');
await p.click('.haggle .pill-btn:has-text("−30%")');
await p.click('.haggle-actions .btn:has-text("Offer")');
await sleep(300);
s = await st();
log('seller counters a low offer', s.haggle?.mood === 'counter' || s.haggle?.status === 'deal', `mood=${s.haggle?.mood} ask=${s.haggle?.ask}`);
await shot('07-haggle-counter');
for (let i = 0; i < 4 && s.haggle && s.haggle.status === 'open'; i++) {
  await p.click('.haggle .pill-btn:has-text("−20%")');
  await p.click('.haggle-actions .btn:has-text("Offer")');
  await sleep(300);
  s = await st();
}
if (s.haggle?.status === 'final') { await p.click('.haggle-actions .btn:has-text("Pay")'); await sleep(300); s = await st(); }
const necklace = s.inv.find((e) => e[0] === 'shell-necklace');
log('bargain ends in a purchase below list price', !!necklace && necklace[2] < 2500, `paid ${necklace?.[2]}`);
log('best bargain recorded', s.world.bestBargain > 0, `${Math.round(s.world.bestBargain * 100)}%`);
await shot('08-haggle-deal');
await p.keyboard.press('Escape');

// ── visit the other areas
// test setup: three cross-town danfo rides (₦700 + ₦700 + ₦1,900 at real-world fares) cost more than the
// clean-up job paid, so the fares are topped up directly (a normal ledger credit)
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 5000, ledger: [{ id: 'test-topup', amount: 5000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lekki-beach' }, ...w.ledger] } }); });
for (const [conductor, label, dest, name] of [['emeka', 'Lagos Island', 'lagos-island', '09-island'], ['sade', 'Ikeja', 'ikeja-village', '10-ikeja'], ['wale', 'Badagry', 'badagry-marina', '11-badagry']]) {
  const npc = await S((id) => window.__retreva.store.getState() && null, conductor);
  const pos = { emeka: [-3.4, 35.2], sade: [1.6, 36.2], wale: [-3.4, 34.4] }[conductor];
  await placeNear(pos[0], pos[1]);
  await talk(conductor);
  await choose(conductor === 'sade' ? 'Take a ride' : 'Take a danfo');
  await p.click(`button[aria-label^="Ride to ${label}"]`);
  await p.waitForFunction((d) => { const g = window.__retreva.store.getState(); return g.destinationId === d && g.phase === 'playing'; }, dest, { timeout: 40000 });
  await sleep(1500);
  s = await st();
  log(`arrives in ${label}`, s.dest === dest);
  await p.click('.tip-card button:has-text("Got it")').catch(() => {});
  await shot(name);
}
await sleep(2500);
s = await st();
log('Lagos explorer goal after visiting all 5 areas', s.world.goalsDone.includes('explorer'), `visited ${s.world.visited.length}`);
log('goal rewards each paid exactly once', s.ledger.filter((id) => id.startsWith('goal:')).length === new Set(s.ledger.filter((id) => id.startsWith('goal:'))).size);

// ── phone apps
await p.keyboard.press('KeyP');
await p.click('button[aria-label^="Messages"]');
await sleep(400);
await shot('11-messages');
s = await st();
log('opening Messages marks them read', s.world.messages.every((m) => m.read));
await p.click('button[aria-label="Back to home"]');
await p.click('button[aria-label="Travel"]');
await shot('12-travel-app');
await p.click('button[aria-label="Back to home"]');
await p.click('button[aria-label="Jobs"]');
await p.click('button[role="tab"]:has-text("Goals")');
await shot('13-goals');
await p.keyboard.press('KeyP');

// ── persistence
const pre = await st();
await sleep(1200);
await p.reload();
await p.click('text=Continue');
await waitPlaying();
s = await st();
log('area survives refresh', s.dest === pre.dest);
log('visited, landmarks, goals and messages survive refresh',
  s.world.visited.length === pre.world.visited.length && s.world.discovered.length === pre.world.discovered.length && s.world.goalsDone.length === pre.world.goalsDone.length && s.world.messages.length === pre.world.messages.length);
log('money survives refresh', s.bal === pre.bal, `${s.bal}`);
log('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await ctx.close();

// ── mobile look at Lekki and the travel picker
const m = await b.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const mp = await m.newPage();
const merr = [];
mp.on('pageerror', (e) => merr.push(String(e)));
await mp.goto(BASE_URL);
await mp.waitForSelector('.wordmark');
await mp.evaluate(() => indexedDB.deleteDatabase('retriever'));
await mp.reload();
await mp.tap('text=Start a new life');
await mp.fill('#name', 'Ife');
await mp.tap('text=Start my life');
await mp.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
await sleep(2500);
await mp.screenshot({ path: `${OUT}/m-01-tip.png` });
await mp.tap('.tip-card button:has-text("Got it")');
await mp.evaluate(() => { const r = window.__retreva.runtime; r.player.x = -4.2; r.player.z = 11.5; });
await mp.waitForSelector('.action-btn', { timeout: 15000 });
await mp.tap('.action-btn');
await sleep(1500);
await mp.tap('button.choice:has-text("Take a danfo")');
await sleep(500);
await mp.screenshot({ path: `${OUT}/m-02-travel.png` });
await mp.tap('button[aria-label^="Ride to Lekki"]');
await mp.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing' && window.__retreva.store.getState().destinationId === 'lekki-beach', null, { timeout: 40000 });
await sleep(2000);
await mp.screenshot({ path: `${OUT}/m-03-lekki.png` });
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
log('[mobile] travel works and no horizontal overflow', !overflow);
log('[mobile] no page errors', merr.length === 0, merr.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
