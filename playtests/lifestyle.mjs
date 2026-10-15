// Lifestyle playtest (Architecture V6 phase 3): owning a vehicle (buy with confirm, ride, park where you
// get off, persists, auto-parks before a danfo, sell back) and social life (chat, gifts, friendship tiers,
// friend prices). Money for the bicycle is topped up directly ("test-topup" ledger entry); earning is
// covered by the other suites. One friendship level is set directly to test the friend discount, because
// reaching Friend through chats takes real minutes of cooldown.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('lifestyle');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launch();
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  const S = (fn, a) => p.evaluate(fn, a);
  const st = () => S(() => {
    const s = window.__retreva.store.getState();
    return { ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]), life: s.life, nearby: s.nearby, inv: s.inventory.entries.map((e) => [e.itemId, e.quantity, e.key]), dialogue: s.dialogue, messages: s.world.messages.map((m) => m.from) };
  });
  const place = (x, z, yaw) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
  const waitNearby = (pred, arg) => p.waitForFunction(pred, arg, { timeout: 20000 });
  const talk = async (npcId, at) => {
    await place(...at);
    await waitNearby((id) => window.__retreva.store.getState().nearby?.id === id, npcId);
    await p.keyboard.press('KeyE');
    await sleep(250);
    await p.keyboard.press('Space');
    await p.waitForSelector('button.choice', { timeout: 10000 });
  };
  const choose = async (label) => { await p.click(`button.choice:has-text("${label}")`); await sleep(350); };
  const waitPlaying = () => p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
  const shot = async (name) => { await sleep(700); await p.screenshot({ path: `${OUT}/${name}.png` }); };
  const hold = async (key, ms) => { await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); await sleep(300); };

  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await S(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');
  await p.click('text=Start a new life');
  await p.fill('#name', 'Funmi');
  await p.click('text=Start my life');
  await waitPlaying();
  await S(() => {
    const st = window.__retreva.store;
    st.getState().updateSettings({ shadows: 'off', tips: false });
    const w = st.getState().wallet;
    st.setState({ wallet: { balance: w.balance + 9000, ledger: [...w.ledger, { id: 'test-topup', amount: 9000, reason: 'Playtest top-up', at: Date.now() }] } });
  });
  await sleep(4000);

  // ── buy a bicycle from Chidi (confirm first)
  await talk('chidi', [-8.4, -6.6, -Math.PI / 2]);
  await choose('Bicycles');
  await p.waitForSelector('.sheet:has-text("Chidi\'s Bicycles")');
  const before = (await st()).bal;
  await p.click('button[aria-label="Buy City bicycle for ₦8,000"]');
  log('buying a bicycle asks for confirmation first', (await st()).bal === before && (await p.isVisible('button:has-text("Confirm · pay ₦8,000")')));
  await shot('01-dealer');
  await p.click('button:has-text("Confirm · pay ₦8,000")');
  await sleep(400);
  let s = await st();
  const buyTx = s.ledger.filter(([id]) => id.startsWith('vehicle:'));
  log('bicycle paid once (₦8,000) and parked by the lot', s.bal === before - 8000 && buyTx.length === 1 && s.life.vehicles.length === 1 && s.life.vehicles[0].parked?.areaId === 'lagos-adeniyi', `${before} → ${s.bal}`);
  await S(() => window.__retreva.store.getState().closePanel());

  // ── get on
  await place(-8.2, -7.3, Math.PI);
  await waitNearby(() => window.__retreva.store.getState().nearby?.kind === 'vehicle');
  s = await st();
  log('walking up to your bicycle offers "Ride"', s.nearby?.verb === 'Ride' && (await p.isVisible('.prompt:has-text("Ride")')), s.nearby?.label);
  await p.keyboard.press('KeyE');
  await sleep(500);
  s = await st();
  log('you get on (riding, no longer parked)', s.life.riding === s.life.vehicles[0].uid && s.life.vehicles[0].parked === null);
  await shot('02-riding');

  // ── faster than walking: ride north for a while, then walk the same time, compare
  await place(-3.0, -30, 0);
  await S(() => { window.__retreva.runtime.camera.yaw = 0; });
  await sleep(600);
  const z0 = await S(() => window.__retreva.runtime.player.z);
  await hold('KeyW', 2500);
  const rideDist = (await S(() => window.__retreva.runtime.player.z)) - z0;
  await waitNearby(() => window.__retreva.store.getState().nearby?.kind === 'dismount');
  await p.keyboard.press('KeyE');
  await sleep(400);
  s = await st();
  const parkedAt = s.life.vehicles[0].parked;
  log('getting off parks the bike exactly where you are', s.life.riding === null && parkedAt?.areaId === 'lagos-adeniyi' && Math.abs(parkedAt.z - (z0 + rideDist)) < 0.6, JSON.stringify(parkedAt));
  await place(-3.0, -30, 0);
  await S(() => { window.__retreva.runtime.camera.yaw = 0; });
  await sleep(600);
  const w0 = await S(() => window.__retreva.runtime.player.z);
  await hold('KeyW', 2500);
  const walkDist = (await S(() => window.__retreva.runtime.player.z)) - w0;
  log('riding covers much more ground than walking in the same time', rideDist > walkDist * 1.4, `ride ${rideDist.toFixed(1)} m vs walk ${walkDist.toFixed(1)} m`);

  // ── persistence: the parked bike is still there after a reload
  await S(() => window.__retreva.saves.saveNow());
  await p.reload();
  await p.click('text=Continue');
  await waitPlaying();
  await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
  s = await st();
  log('owned bicycle and where it was parked survive a reload', s.life.vehicles.length === 1 && Math.abs(s.life.vehicles[0].parked.z - parkedAt.z) < 0.01);

  // ride it to Kunle and take a danfo: the bike is parked first
  await place(parkedAt.x, parkedAt.z + 0.8, Math.PI);
  await waitNearby(() => window.__retreva.store.getState().nearby?.kind === 'vehicle');
  await p.keyboard.press('KeyE');
  await sleep(400);
  await talk('kunle', [-4.2, 11.5, -Math.PI / 2]);
  await choose('Take a danfo');
  await p.click('button[aria-label^="Ride to Lekki"]');
  await p.waitForFunction(() => window.__retreva.store.getState().destinationId === 'lekki-beach' && window.__retreva.store.getState().phase === 'playing', null, { timeout: 60000 });
  s = await st();
  log('taking a danfo parks your bike in Yaba first (it doesn’t come along)', s.life.riding === null && s.life.vehicles[0].parked?.areaId === 'lagos-adeniyi');
  await sleep(4000);

  // ── social: chat with Tolu, then a gift she loves
  // Tolu's live position (she stands in the pack's spot)
  const tolu = await S(() => { const a = window.__retreva.runtime.actors.get('tolu'); return [a.x, a.z]; });
  await talk('tolu', [tolu[0] + (tolu[0] > 0 ? -1.2 : 1.2), tolu[1], tolu[0] > 0 ? Math.PI / 2 : -Math.PI / 2]);
  log('people you can befriend offer "Chat a while" and "Give a gift"', (await p.isVisible('button.choice:has-text("Chat a while")')) && (await p.isVisible('button.choice:has-text("Give a gift")')));
  await choose('Chat a while');
  s = await st();
  log('chatting raises regard and Tolu replies', (s.life.regard.tolu ?? 0) === 3 && s.dialogue?.nodeId === '__social' && (await p.isVisible('.dialogue .line')), `regard ${s.life.regard.tolu}`);
  await shot('03-chat');
  await choose('Back');
  await choose('Chat a while');
  s = await st();
  log('chatting again right away is just small talk (no extra regard)', s.life.regard.tolu === 3);
  await choose('Bye');
  // buy a coconut (Tolu likes them) from Musa, then give it
  const musa = await S(() => { const a = window.__retreva.runtime.actors.get('musa'); return [a.x, a.z]; });
  await talk('musa', [musa[0] + (musa[0] > 0 ? -1.2 : 1.2), musa[1], musa[0] > 0 ? Math.PI / 2 : -Math.PI / 2]);
  await choose('What do you have?');
  await p.waitForSelector('.sheet');
  await p.click('button[aria-label^="Buy Fresh coconut"]');
  await sleep(300);
  await S(() => window.__retreva.store.getState().closePanel());
  await talk('tolu', [tolu[0] + (tolu[0] > 0 ? -1.2 : 1.2), tolu[1], tolu[0] > 0 ? Math.PI / 2 : -Math.PI / 2]);
  await choose('Give a gift');
  await p.waitForSelector('.sheet:has-text("Give a gift")');
  log('gift list marks what she would love', await p.isVisible('.sheet .desc:has-text("would love")'));
  await p.click('button[aria-label="Give Fresh coconut"]');
  await p.click('button[aria-label="Confirm: give Fresh coconut"]');
  await sleep(500);
  s = await st();
  log('a loved gift: +8 regard, the coconut leaves your bag, she becomes an Acquaintance', s.life.regard.tolu === 11 && !s.inv.some(([id]) => id === 'coconut') && (await p.isVisible('.dialogue .regard:has-text("Acquaintance")')), `regard ${s.life.regard.tolu}`);
  await p.waitForFunction(() => window.__retreva.store.getState().world.messages.some((m) => m.from === 'Tolu'), null, { timeout: 8000 }).catch(() => {});
  s = await st();
  log('a new friendship level sends you a text', s.messages.includes('Tolu'));
  await shot('04-gift');
  await choose('Bye');

  // ── friend price at Musa's (regard set directly — see header)
  await S(() => { const st = window.__retreva.store; const l = st.getState().life; st.setState({ life: { ...l, regard: { ...l.regard, musa: 32 } } }); });
  await talk('musa', [musa[0] + (musa[0] > 0 ? -1.2 : 1.2), musa[1], musa[0] > 0 ? Math.PI / 2 : -Math.PI / 2]);
  await choose('What do you have?');
  await p.waitForSelector('.sheet');
  const label = await p.getAttribute('button[aria-label^="Buy Fresh coconut"]', 'aria-label');
  const b0 = (await st()).bal;
  await p.click('button[aria-label^="Buy Fresh coconut"]');
  await sleep(300);
  const paid = b0 - (await st()).bal;
  const shown = Number(label.replace(/[^\d]/g, ''));
  log('a Friend pays 10% less, and the shop shows the friend price', paid === shown && (await p.isVisible('.sheet s')) && (await p.isVisible('.eyelabel:has-text("friend price")')), `${label} · paid ${paid}`);
  await shot('05-friend-price');
  await S(() => window.__retreva.store.getState().closePanel());

  // ── back to Yaba and sell the bike to Chidi
  const emeka = await S(() => { const a = window.__retreva.runtime.actors.get('emeka'); return [a.x, a.z]; });
  await talk('emeka', [emeka[0] + (emeka[0] > 0 ? -1.2 : 1.2), emeka[1], emeka[0] > 0 ? Math.PI / 2 : -Math.PI / 2]);
  const danfoOpt = await p.$$eval('button.choice', (els) => els.map((e) => e.textContent.replace(/^\d/, '').trim()));
  await choose(danfoOpt.find((t) => /danfo|ride/i.test(t)));
  await p.click('button[aria-label^="Ride to Yaba"]');
  await p.waitForFunction(() => window.__retreva.store.getState().destinationId === 'lagos-adeniyi' && window.__retreva.store.getState().phase === 'playing', null, { timeout: 60000 });
  await sleep(4000);
  await talk('chidi', [-8.4, -6.6, -Math.PI / 2]);
  await choose('Bicycles');
  await p.waitForSelector('button[aria-label="Sell City bicycle for ₦4,000"]');
  const b1 = (await st()).bal;
  await p.click('button[aria-label="Sell City bicycle for ₦4,000"]');
  log('selling asks for confirmation and shows what you get back', (await st()).bal === b1 && (await p.isVisible('button[aria-label="Confirm: sell City bicycle for ₦4,000"]')));
  await p.click('button[aria-label="Confirm: sell City bicycle for ₦4,000"]');
  await sleep(400);
  s = await st();
  log('sold for half (₦4,000), once; the bike is gone', s.bal === b1 + 4000 && s.life.vehicles.length === 0 && s.ledger.filter(([id]) => id.startsWith('sellvehicle:')).length === 1);
  await S(() => window.__retreva.store.getState().closePanel());

  // ── eating shows a hand-to-mouth animation
  await S(() => window.__retreva.store.getState().buy('mama-titi', 'puff-puff'));
  const key = (await st()).inv.find(([id]) => id === 'puff-puff')?.[2];
  await S((k) => window.__retreva.store.getState().consume(k), key);
  log('eating plays the eat animation', await S(() => window.__retreva.runtime.player.eatUntil > performance.now()));

  await S(() => window.__retreva.saves.saveNow());
  await p.reload();
  await p.click('text=Continue');
  await waitPlaying();
  s = await st();
  log('friendships and the sale persist after reload', s.life.regard.tolu === 11 && s.life.vehicles.length === 0 && s.life.social.tolu?.gifts === 1);
  log('desktop: no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ── mobile: get on and off by touch
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  const S = (fn, a) => p.evaluate(fn, a);
  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await S(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');
  await p.tap('text=Start a new life');
  await p.fill('#name', 'Kola');
  await p.tap('text=Start my life');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
  await S(() => {
    const st = window.__retreva.store;
    st.getState().updateSettings({ tips: false });
    const w = st.getState().wallet;
    st.setState({ wallet: { balance: w.balance + 9000, ledger: [...w.ledger, { id: 'test-topup', amount: 9000, reason: 'Playtest top-up', at: Date.now() }] } });
    st.getState().openDealer('chidi-bikes');
  });
  await p.waitForSelector('button[aria-label="Buy City bicycle for ₦8,000"]');
  await p.tap('button[aria-label="Buy City bicycle for ₦8,000"]');
  await p.tap('button:has-text("Confirm · pay ₦8,000")');
  await sleep(300);
  await S(() => window.__retreva.store.getState().closePanel());
  await S(() => { const r = window.__retreva.runtime; r.player.x = -8.2; r.player.z = -7.3; });
  await p.waitForSelector('.action-btn:has-text("Ride")', { timeout: 20000 });
  await p.tap('.action-btn');
  await sleep(500);
  const riding = await S(() => !!window.__retreva.store.getState().life.riding);
  await S(() => { const r = window.__retreva.runtime; r.player.x = -3; r.player.z = -25; });
  await p.waitForSelector('.action-btn:has-text("Get off")', { timeout: 20000 });
  const big = await S(() => { const r = document.querySelector('.action-btn').getBoundingClientRect(); return r.height >= 44 && r.width >= 44; });
  await p.screenshot({ path: `${OUT}/06-mobile-riding.png` });
  await p.tap('.action-btn');
  await sleep(400);
  const parked = await S(() => window.__retreva.store.getState().life.vehicles[0].parked);
  log('mobile: tap to ride and tap "Get off" (big touch target); bike parks where you stop', riding && big && parked?.areaId === 'lagos-adeniyi' && Math.abs(parked.z + 25) < 0.5, JSON.stringify(parked));
  log('mobile: no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
