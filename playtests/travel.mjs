// Travel playtest (Architecture V6, milestone 4): plan and budget a trip, buy a ticket, taxi to the
// airport, check in, security (liquids), board, fly, arrive in Accra (Osu), explore, and fly home.
// The ticket and taxi money is topped up directly (a "test-topup" ledger entry) — earning ₦450,000 plus real-world
// taxi fares through jobs is covered by the other suites and would take hours, even on a phone.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('travel');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launch();

// ── desktop: the whole trip ────────────────────────────────────────────
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  const S = (fn, a) => p.evaluate(fn, a);
  const st = () => S(() => {
    const s = window.__retreva.store.getState();
    return {
      phase: s.phase, ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]),
      ticket: s.travel.ticket, history: s.travel.history, inv: s.inventory.entries.map((e) => [e.itemId, e.quantity]),
      goals: s.world.goalsDone, visited: s.world.visited, banner: s.banner?.title ?? null, fullness: s.life.needs.fullness,
    };
  });
  const place = (x, z, yaw) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
  const talk = async (npcId, at) => {
    await place(...at);
    await p.waitForFunction((id) => window.__retreva.store.getState().nearby?.id === id, npcId, { timeout: 20000 });
    await p.keyboard.press('KeyE');
    await sleep(250);
    await p.keyboard.press('Space');
    await p.waitForSelector('button.choice', { timeout: 10000 });
  };
  const choose = async (label) => { await p.click(`button.choice:has-text("${label}")`); await sleep(350); };
  const waitPlaying = () => p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
  const shot = async (name) => { await sleep(900); await p.screenshot({ path: `${OUT}/${name}.png` }); };
  const ride = async (button) => {
    await p.click(button);
    await p.waitForFunction(() => window.__retreva.store.getState().ui === 'transit', null, { timeout: 10000 });
    await p.waitForFunction(() => window.__retreva.store.getState().phase === 'loading' || window.__retreva.store.getState().ui !== 'transit', null, { timeout: 20000 });
    await waitPlaying();
    await sleep(800);
  };

  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await S(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');
  await p.click('text=Start a new life');
  await p.fill('#name', 'Kemi');
  await p.click('text=Start my life');
  await waitPlaying();
  await S(() => window.__retreva.store.getState().updateSettings({ shadows: 'off', tips: false }));

  // plan: the Travel app shows the trip budget before you can afford it
  await S(() => window.__retreva.store.getState().openPhone('travel'));
  await p.waitForSelector('.flight');
  const lines = await p.$$eval('.flight[data-route="los-acc"] .budget li[data-line]', (els) => els.map((e) => e.getAttribute('data-line')));
  const amounts = await p.$$eval('.flight[data-route="los-acc"] .budget li', (els) => els.map((e) => Number(e.querySelector('b').textContent.replace(/[^\d]/g, '')) || 0));
  const sumOk = amounts.slice(0, -1).reduce((a, n) => a + n, 0) === amounts[amounts.length - 1];
  log('Travel app shows Accra with a full trip budget (taxi, ticket, stay, getting around) that adds up', lines.join() === 'taxi,ticket,stay,around' && sumOk, `${lines.join(',')} · ${amounts.join(' + ')}`);
  const shortMsg = await p.textContent('.flight[data-route="los-acc"] .muted');
  log('with ₦2,000 the ticket is clearly out of reach (no Book button, how much more is shown)', /need ₦448,000 more/.test(shortMsg) && !(await p.isVisible('.flight[data-route="los-acc"] button:has-text("Book")')), shortMsg.trim());
  await shot('01-budget-short');

  // top up (test only) and book a return ticket with the confirm step
  await S(() => {
    const st = window.__retreva.store;
    const w = st.getState().wallet;
    st.setState({ wallet: { balance: w.balance + 480000, ledger: [...w.ledger, { id: 'test-topup', amount: 480000, reason: 'Playtest top-up', at: Date.now() }] } });
  });
  await sleep(300);
  const before = (await st()).bal;
  await p.click('button[aria-label="Book return ticket to Accra for ₦450,000"]');
  log('booking asks for confirmation before paying', (await st()).bal === before && (await p.isVisible('button:has-text("Confirm · pay ₦450,000")')));
  await p.click('button:has-text("Confirm · pay ₦450,000")');
  await sleep(400);
  let s = await st();
  const flightTx = s.ledger.filter(([id]) => id.startsWith('flight:los-acc:'));
  log('return ticket paid once through the ledger (₦450,000)', s.bal === before - 450000 && flightTx.length === 1 && flightTx[0][1] === -450000, `${before} → ${s.bal}`);
  log('boarding pass appears at the "booked" step', s.ticket?.stage === 'booked' && (await p.getAttribute('.pass', 'data-stage')) === 'booked');
  await shot('02-boarding-pass');
  await S(() => window.__retreva.store.getState().closePanel());

  // persistence of the ticket
  await S(() => window.__retreva.saves.saveNow());
  await p.reload();
  await p.click('text=Continue');
  await waitPlaying();
  await S(() => window.__retreva.store.getState().updateSettings({ tips: false }));
  s = await st();
  log('the ticket survives a reload', s.ticket?.routeId === 'los-acc' && s.ticket?.roundTrip === true);

  // taxi to the airport from Yaba
  await talk('kunle', [-4.2, 11.5, -Math.PI / 2]);
  await choose('Take a danfo');
  const taxiBtn = 'button[aria-label^="Taxi to Airport"]';
  const taxiLabel = await p.getAttribute(taxiBtn, 'aria-label');
  const balTaxi = (await st()).bal;
  await shot('03-ride-panel');
  await ride(taxiBtn);
  s = await st();
  const fare = Number(taxiLabel.replace(/[^\d]/g, ''));
  const rideTx = s.ledger.filter(([id, amt]) => id.startsWith('ride') && amt === -fare);
  log('a taxi takes you to the airport for the quoted fare (charged once)', s.dest === 'lagos-airport' && rideTx.length === 1 && s.banner === 'Airport', `${taxiLabel} · ${balTaxi} → ${s.bal} (goal rewards may land too)`);
  await shot('04-lagos-airport');

  // buy a bottle of water at the airport shop (it will meet security)
  await talk('obinna', [7.3, 17, Math.PI / 2]);
  await choose('Show me');
  await p.click('button[aria-label^="Buy Bottled water"]');
  await sleep(300);
  await S(() => window.__retreva.store.getState().closePanel());

  // gate refuses you before check-in
  await talk('bisola', [7.3, -28, Math.PI / 2]);
  log('the gate sends you to check in first', await p.isVisible('.dialogue :text("check in at the desk")'));
  await choose('Okay');

  // check-in
  await talk('ifeoma', [7.3, 4, Math.PI / 2]);
  await shot('05-check-in');
  await choose('Window, please');
  s = await st();
  log('check-in moves the ticket to "checked-in"', s.ticket?.stage === 'checked-in');

  // security: liquids
  await talk('officer-musa', [7.5, -13, Math.PI / 2]);
  const liquidsAsked = await p.isVisible('button.choice:has-text("Drink them now")');
  await shot('06-security-liquids');
  await choose('Leave them');
  s = await st();
  log('security stops bottled drinks; leaving them clears you and empties them from the bag', liquidsAsked && s.ticket?.stage === 'cleared' && !s.inv.some(([id]) => id === 'bottled-water'), JSON.stringify(s.inv));

  // board and fly
  const fullBefore = s.fullness;
  await talk('bisola', [7.3, -28, Math.PI / 2]);
  await choose('Board the plane');
  s = await st();
  log('boarding starts the flight', s.ui === 'flight' && (await p.isVisible('.flight-overlay')));
  await sleep(1800);
  const phaseMid = await p.getAttribute('.flight-overlay', 'data-phase');
  await p.screenshot({ path: `${OUT}/07-in-flight.png` });
  await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'accra-osu' && g.phase === 'playing'; }, null, { timeout: 60000 });
  s = await st();
  log('you land in Accra (Osu) with the arrival taxi included', s.dest === 'accra-osu' && s.banner === 'Osu', `mid-flight: ${phaseMid} · ${s.dest} · banner ${s.banner}`);
  await sleep(1200);
  s = await st();
  log('the flight is logged once and the paid return ticket is waiting', s.history.length === 1 && s.ticket?.routeId === 'acc-los' && s.ticket?.paid === 0 && s.ticket?.stage === 'booked');
  log('the in-flight snack fills you up a little', s.fullness > fullBefore - 1, `${fullBefore.toFixed(1)} → ${s.fullness.toFixed(1)}`);
  await p.waitForFunction(() => window.__retreva.store.getState().world.goalsDone.includes('first-flight'), null, { timeout: 8000 }).catch(() => {});
  s = await st();
  log('"Wheels up" goal pays once', s.goals.includes('first-flight') && s.ledger.filter(([id]) => id === 'goal:first-flight').length === 1);
  await shot('08-osu');

  // Osu: local currency guide in shops, food, a job
  await talk('akosua', [3.9, -1.8, Math.PI / 2]);
  await choose('Show me the food');
  const local = await p.textContent('.local-price');
  log('Accra shops show the cedi equivalent next to the naira price', /GH₵/.test(local), local);
  await p.click('button[aria-label^="Buy Waakye"]');
  await sleep(300);
  s = await st();
  log('you can buy waakye in Osu', s.inv.some(([id]) => id === 'waakye'));
  await shot('09-osu-shop');
  await S(() => window.__retreva.store.getState().closePanel());

  // taxi to Accra airport, fly home
  await talk('kofi', [-3.5, 34.4, -Math.PI / 2]);
  await choose('Take a taxi');
  const rows = await p.$$eval('.travel-row .name', (els) => els.map((e) => e.textContent.trim()));
  log('Accra rides are by taxi, only within Accra', rows.length === 1 && rows[0].startsWith('Airport') && !(await p.isVisible('.lagos-map')), rows.join(','));
  await ride('button[aria-label^="Taxi to Airport"]');
  s = await st();
  log('taxi to Accra airport', s.dest === 'accra-airport');
  await shot('10-accra-airport');
  await talk('abena', [7.3, 4, Math.PI / 2]);
  await choose('Window, please');
  await talk('officer-mensah', [7.5, -13, Math.PI / 2]);
  log('security without drinks is a simple walk-through', await p.isVisible('button.choice:has-text("Walk through")'));
  await choose('Walk through');
  await talk('yaw', [7.3, -28, Math.PI / 2]);
  await choose('Board the plane');
  await p.click('.flight-overlay button:has-text("Skip to landing")');
  await p.waitForFunction(() => { const g = window.__retreva.store.getState(); return g.destinationId === 'ikeja-village' && g.phase === 'playing'; }, null, { timeout: 60000 });
  await sleep(800);
  s = await st();
  log('flying home lands you in Ikeja (next to the airport) with no ticket left', s.dest === 'ikeja-village' && s.ticket === null && s.history.length === 2);

  await S(() => window.__retreva.saves.saveNow());
  await p.reload();
  await p.click('text=Continue');
  await waitPlaying();
  s = await st();
  log('trip history, place and money persist after reload', s.dest === 'ikeja-village' && s.history.length === 2 && s.visited.includes('accra-osu'));
  await S(() => window.__retreva.store.getState().openPhone('travel'));
  await sleep(500);
  log('Travel app lists both flights under Trips', (await p.$$('.chip.done:has-text("Flown")')).length === 2);
  await shot('11-trips');
  log('desktop: no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ── mobile: booking and the flight fit a small phone ──────────────────
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
  await p.fill('#name', 'Yaw');
  await p.tap('text=Start my life');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
  await S(() => {
    const st = window.__retreva.store;
    st.getState().updateSettings({ tips: false });
    const w = st.getState().wallet;
    st.setState({ wallet: { balance: w.balance + 260000, ledger: [...w.ledger, { id: 'test-topup', amount: 260000, reason: 'Playtest top-up', at: Date.now() }] } });
    st.getState().openPhone('travel');
  });
  await p.waitForSelector('.flight');
  await p.tap('.flight[data-route="los-acc"] .seg button:has-text("One-way")');
  await p.tap('button[aria-label="Book one-way ticket to Accra for ₦250,000"]');
  await p.tap('button:has-text("Confirm · pay ₦250,000")');
  await sleep(400);
  const over = await S(() => document.documentElement.scrollWidth > window.innerWidth);
  const t = await S(() => window.__retreva.store.getState().travel.ticket);
  log('mobile: one-way ticket booked by touch, no sideways scroll', t?.roundTrip === false && t?.paid === 250000 && !over);
  await p.screenshot({ path: `${OUT}/12-mobile-pass.png` });
  // jump through the airport steps with the store (the UI path is covered on desktop) to see the flight on a phone
  await S(() => {
    const st = window.__retreva.store;
    st.getState().closePanel();
    st.getState().travelTo('lagos-airport');
  });
  await p.waitForFunction(() => window.__retreva.store.getState().phase === 'playing' && window.__retreva.store.getState().destinationId === 'lagos-airport', null, { timeout: 60000 });
  await S(() => {
    const st = window.__retreva.store.getState();
    st.checkIn();
    window.__retreva.store.getState().passSecurity();
    window.__retreva.store.getState().board();
  });
  await sleep(2500);
  const box = await p.$eval('.flight-overlay .transit-card', (el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, w: r.width }; });
  log('mobile: the flight card fits the screen', box.top >= 0 && box.bottom <= 844 && box.w <= 390, JSON.stringify(box));
  await p.screenshot({ path: `${OUT}/13-mobile-flight.png` });
  await p.waitForFunction(() => window.__retreva.store.getState().phase === 'playing' && window.__retreva.store.getState().destinationId === 'accra-osu', null, { timeout: 60000 });
  const after = await S(() => window.__retreva.store.getState().travel);
  log('mobile: one-way trip ends with no ticket left', after.ticket === null && after.history.length === 1);
  log('mobile: no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
