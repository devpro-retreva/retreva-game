// Life-loop playtest (Architecture V6, milestone 1): needs, kitchen shift (skill, regard, pay), eating,
// bench rest, exhaustion, selling with confirmation, renting a home, sleeping, and persistence of it all.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('life');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launch();

async function play(name, viewport, mobile) {
  const ctx = await b.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  const tap = (sel) => (mobile ? p.tap(sel) : p.click(sel));
  const S = (fn, a) => p.evaluate(fn, a);
  const st = () => S(() => {
    const s = window.__retreva.store.getState();
    return { ui: s.ui, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => t.id), life: s.life, shift: s.shift, inv: s.inventory.entries.map((e) => [e.key, e.itemId, e.quantity]), toasts: s.toasts.map((t) => t.title), nearby: s.nearby?.id ?? null };
  });
  const place = (x, z, yaw = 0) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
  const shot = async (n) => { await sleep(700); await p.screenshot({ path: `${OUT}/${name}-${n}.png` }); };
  const L = `[${name}]`;

  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await S(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');
  await tap('text=Start a new life');
  await p.fill('#name', 'Funmi');
  await tap('text=Start my life');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
  await S(() => window.__retreva.store.getState().updateSettings({ shadows: 'off', tips: false }));
  await sleep(1500);

  let s = await st();
  log(`${L} new life starts rested and fed`, s.life.needs.energy > 84 && s.life.needs.fullness > 74 && s.life.homes.length === 0, `${s.life.needs.energy.toFixed(2)}/${s.life.needs.fullness.toFixed(2)}`);
  log(`${L} needs show in the HUD with text, not colour alone`, await p.isVisible('.need[aria-label^="Energy 8"]'));

  // time passes → needs fall
  await S(() => window.__retreva.store.getState().tick(10 * 60000));
  s = await st();
  log(`${L} needs drain over time`, s.life.needs.fullness < 75 && s.life.needs.energy < 85, `energy ${s.life.needs.energy.toFixed(1)}, fullness ${s.life.needs.fullness.toFixed(1)}`);

  // ── kitchen shift #1 (one deliberate mistake)
  const before = s;
  async function runShift(wrongAt = -1) {
    await place(4.0, 36.6, Math.PI / 2);
    await p.waitForFunction(() => window.__retreva.store.getState().nearby?.id === 'mama-titi', null, { timeout: 15000 });
    if (mobile) await tap('.action-btn');
    else await p.keyboard.press('KeyE');
    await sleep(300);
    if (!mobile) await p.keyboard.press('Space');
    await p.waitForSelector('button.choice:has-text("Help in the kitchen")', { timeout: 10000 });
    await tap('button.choice:has-text("Help in the kitchen")');
    await p.waitForSelector('.shift .ticket');
    for (let i = 0; i < 8; i++) {
      const cur = await S(() => window.__retreva.store.getState().shift);
      const want = cur.orders[cur.index];
      const pick = i === wrongAt ? (want === 'zobo' ? 'jollof' : 'zobo') : want;
      if (i === 1 && wrongAt >= 0) await shot('shift-ticket');
      // The order timer is wall-clock (5 s); software GL can take longer than that per tap,
      // so hold the timer here. Late orders are covered by the scoreShift unit tests.
      await S(() => { const st = window.__retreva.store; const r = st.getState().shift; st.setState({ shift: { ...r, deadline: Date.now() + 60000 } }); });
      await tap(`.dish[data-dish="${pick}"]`);
      await sleep(120);
    }
    await p.waitForSelector('.shift-done');
  }
  await runShift(3);
  s = await st();
  const o1 = s.shift.outcome;
  log(`${L} shift: 7 of 8 served pays 7 × ₦150, no tip`, o1.served === 7 && o1.pay === 1050 && o1.tip === 0, JSON.stringify({ served: o1.served, pay: o1.pay, tip: o1.tip }));
  log(`${L} shift pay lands in the wallet once, with its own ledger entry`, s.bal === before.bal + 1050 && s.ledger.filter((id) => id.startsWith('shift:buka-kitchen:')).length === 1, `${before.bal} → ${s.bal}`);
  log(`${L} shift gives cooking XP, Mama Titi's regard and a staff meal`, s.life.skills.cooking === 70 && s.life.regard['mama-titi'] > 0 && s.life.needs.fullness > before.life.needs.fullness, JSON.stringify({ xp: s.life.skills.cooking, regard: s.life.regard }));
  log(`${L} shift costs energy`, s.life.needs.energy < before.life.needs.energy - 15);
  await shot('shift-done');
  await tap('.shift-done button:has-text("Done")');

  // ── shift #2, perfect → tip + level up
  const mid = await st();
  await runShift(-1);
  s = await st();
  const o2 = s.shift.outcome;
  log(`${L} perfect shift tips ₦300 and levels cooking up`, o2.served === 8 && o2.tip === 300 && o2.levelUp === true && s.bal === mid.bal + 1200 + 300, JSON.stringify({ pay: o2.pay, tip: o2.tip, lvlUp: o2.levelUp }));
  await tap('.shift-done button:has-text("Done")');
  await sleep(300);
  s = await st();
  log(`${L} level-up toast after the shift`, s.toasts.some((t) => t.startsWith('Cooking skill up')));
  const lvl2 = await S(() => window.__retreva.store.getState().shift);
  log(`${L} shift panel closed, back to play`, s.ui === 'play' && lvl2 === null);

  // ── exhausted: no shift, no running, fair recovery on the bench
  await S(() => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { energy: 10, fullness: 60 } } }); });
  await S(() => window.__retreva.store.getState().startShift('buka-kitchen'));
  s = await st();
  log(`${L} too tired to start a shift — told to rest`, s.ui === 'play' && s.toasts.some((t) => t === 'Too tired to work'));
  if (!mobile) {
    await place(0, 0, 0);
    await sleep(300);
    await p.keyboard.down('ShiftLeft');
    await p.keyboard.down('KeyW');
    let maxSpeed = 0;
    for (let i = 0; i < 10; i++) { await sleep(150); maxSpeed = Math.max(maxSpeed, await S(() => window.__retreva.runtime.player.speed)); }
    await p.keyboard.up('KeyW');
    await p.keyboard.up('ShiftLeft');
    log(`${L} exhausted players walk but can't run`, maxSpeed > 1 && maxSpeed < 4.5, `max ${maxSpeed.toFixed(2)} m/s (walk 3.4, run 6.4)`);
  }
  await place(-9.4, -3.6, Math.PI);
  await p.waitForFunction(() => window.__retreva.store.getState().nearby?.id === 'okada-bench', null, { timeout: 15000 });
  if (mobile) await tap('.action-btn'); else await p.keyboard.press('KeyE');
  await p.waitForSelector('.rest-overlay');
  await shot('bench');
  await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 15000 });
  s = await st();
  log(`${L} free bench rest restores energy to 70`, Math.round(s.life.needs.energy) === 70, `${s.life.needs.energy}`);

  // ── eat: buy puff-puff and eat it from the bag
  const preEat = (await st()).life.needs.fullness;
  await S(() => window.__retreva.store.getState().buy('mama-titi', 'puff-puff'));
  await S(() => window.__retreva.store.getState().openPhone('bag'));
  await tap('button[aria-label^="Eat Puff-puff"]');
  await sleep(200);
  s = await st();
  log(`${L} eating restores fullness by the item's nutrition`, Math.abs(s.life.needs.fullness - Math.min(100, preEat + 20)) < 0.5 && !s.inv.some((e) => e[1] === 'puff-puff'), `${preEat.toFixed(1)} → ${s.life.needs.fullness.toFixed(1)}`);
  await S(() => window.__retreva.store.getState().closePanel());

  // ── sell with confirmation
  await S(() => window.__retreva.store.getState().openShop('iya-bisi'));
  await p.waitForSelector('.sheet');
  const toteBuy = await S(() => window.__retreva.store.getState().buy('iya-bisi', 'ankara-tote'));
  const preSell = await st();
  await tap('[role="tab"]:has-text("Sell")');
  await tap('button[aria-label^="Sell Ankara tote"]');
  const askedFirst = (await st()).bal === preSell.bal && (await p.isVisible('button[aria-label^="Confirm: sell Ankara tote"]'));
  await shot('sell-confirm');
  await tap('button[aria-label^="Confirm: sell Ankara tote"]');
  await sleep(200);
  s = await st();
  log(`${L} selling asks to confirm, then pays half price and removes the item`, toteBuy && askedFirst && s.bal === preSell.bal + 1750 && !s.inv.some((e) => e[1] === 'ankara-tote') && s.ledger.some((id) => id.startsWith('sell')), `${preSell.bal} → ${s.bal}`);
  await S(() => window.__retreva.store.getState().closePanel());

  // ── rent a home (test setup: top the wallet up via a normal ledger credit)
  await place(-5.0, 23.4, -Math.PI / 2);
  await p.waitForFunction(() => window.__retreva.store.getState().nearby?.id === 'yaba-room-door', null, { timeout: 15000 });
  if (mobile) await tap('.action-btn'); else await p.keyboard.press('KeyE');
  await p.waitForSelector('.sheet:has-text("Room on Adeniyi Street")');
  const poor = (await st()).bal < 6000 ? await p.isVisible('button:has-text("more")') : true;
  log(`${L} rent button shows the shortfall when you can't afford it`, poor);
  await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 8000, ledger: [{ id: 'test-topup', amount: 8000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });
  await sleep(200);
  const preRent = await st();
  await tap('button:has-text("Rent this room")');
  await shot('rent-confirm');
  await tap('button:has-text("Confirm · pay")');
  await sleep(300);
  s = await st();
  log(`${L} renting debits ₦6,000 once and gives you a home`, s.life.homes.includes('yaba-room') && s.bal === preRent.bal - 6000 && s.ledger.filter((id) => id === 'home:yaba-room').length === 1);
  await S(() => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, energy: 30 } } }); });
  await tap('button:has-text("Sleep")');
  await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play' && window.__retreva.store.getState().life.needs.energy > 99, null, { timeout: 15000 });
  log(`${L} sleeping at home restores full energy`, true);
  await S(() => window.__retreva.store.getState().openPhone('profile'));
  await shot('profile');
  log(`${L} profile lists skills and people`, (await p.isVisible('text=Level 2')) && (await p.isVisible('text=Mama Titi')));
  await S(() => window.__retreva.store.getState().closePanel());

  // ── persistence
  const pre = await st();
  await S(() => window.__retreva.saves.saveNow());
  await p.reload();
  await tap('text=Continue');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 40000 });
  s = await st();
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  log(`${L} home, skills, regard and shifts survive reload`, same(s.life.homes, pre.life.homes) && same(s.life.skills, pre.life.skills) && same(s.life.regard, pre.life.regard) && s.life.shiftsDone === pre.life.shiftsDone);
  log(`${L} needs survive reload`, Math.abs(s.life.needs.energy - pre.life.needs.energy) < 1.5 && Math.abs(s.life.needs.fullness - pre.life.needs.fullness) < 1.5);
  log(`${L} money and ledger survive reload (no duplicate payouts)`, s.bal === pre.bal && s.ledger.length === pre.ledger.length);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  log(`${L} no horizontal overflow`, !overflow);
  log(`${L} no page errors`, errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

await play('desktop', { width: 1280, height: 760 }, false);
await play('mobile', { width: 390, height: 844 }, true);
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
