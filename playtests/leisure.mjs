// Leisure playtest: ticketed shows (Events app → ticket → venue gate at showtime → the show), paying at the
// gate, Bookings (upcoming / attended / missed), the Night out goal paid once, the stage coming alive at
// showtime, and the low-mood tip. The game clock is set directly to reach showtimes (noted per step).
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('leisure');
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
  return { ui: s.ui, dest: s.destinationId, bal: s.wallet.balance, ledger: s.wallet.ledger.map((t) => [t.id, t.amount]), time: s.world.time, tickets: s.world.tickets ?? [], needs: s.life.needs, goals: s.world.goalsDone, nearby: s.nearby?.id ?? null };
});
const place = (x, z, yaw) => S(([x, z, yaw]) => { const r = window.__retreva.runtime; r.player.x = x; r.player.z = z; r.player.yaw = yaw; }, [x, z, yaw]);
const setTime = (t) => S((t) => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, time: t } }); }, t);
const near = (id) => p.waitForFunction((id) => window.__retreva.store.getState().nearby?.id === id, id, { timeout: 15000 });
const go = async (area) => {
  await S((a) => window.__retreva.store.getState().travelTo(a), area);
  await p.waitForFunction((a) => window.__retreva.store.getState().destinationId === a && window.__retreva.store.getState().phase === 'playing', area, { timeout: 60000 });
  await sleep(3000);
};
const phone = async (app) => { await S((a) => window.__retreva.store.getState().openPhone(a), app); await sleep(400); };
const close = () => S(() => window.__retreva.store.getState().closePanel());

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Tunde');
await p.click('text=Start my life');
await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
// test setup: money for tickets (a normal ledger credit)
await S(() => { const st = window.__retreva.store; const w = st.getState().wallet; st.setState({ wallet: { balance: w.balance + 20000, ledger: [{ id: 'test-topup', amount: 20000, reason: 'Playtest top-up', at: Date.now(), destinationId: 'lagos-adeniyi' }, ...w.ledger] } }); });

// ── Events app
await phone('events');
const cards = await p.locator('.event-card').count();
log('the Events app lists the shows in every city', cards >= 3, `${cards} shows`);
log('the beach concert shows tonight\'s time', /Today 19:00–22:00/.test(await p.textContent('.event-card[data-event="beach-highlife"]')));
await p.screenshot({ path: `${OUT}/events-app.png` });
let s = await st();
const pre = s.bal;
await p.click('.event-card[data-event="beach-highlife"] button[data-act="ticket"]');
log('booking asks first (nothing paid yet)', (await st()).bal === pre && (await p.isVisible('button[data-act="confirm-ticket"]')));
await p.click('button[data-act="confirm-ticket"]');
await sleep(300);
s = await st();
log('a ticket costs ₦5,000 once and is for tonight (day 1)', pre - s.bal === 5000 && s.ledger.filter(([id]) => id === 'ticket:beach-highlife:d1').length === 1 && s.tickets[0]?.day === 1);
log('the show now says Booked and can\'t be bought twice', (await p.isVisible('.event-card[data-event="beach-highlife"] .chip.done')) && (await p.isDisabled('.event-card[data-event="beach-highlife"] button[data-act="ticket"]')));
await S(() => window.__retreva.store.getState().buyTicket('beach-highlife'));
s = await st();
log('a second purchase of the same showing is refused', s.ledger.filter(([id]) => id.startsWith('ticket:beach-highlife')).length === 1 && pre - s.bal === 5000);
await S(() => window.__retreva.store.getState().setPhoneApp('bookings'));
await sleep(300);
log('Bookings lists the ticket as upcoming', (await p.getAttribute('.booking[data-ticket="beach-highlife"]', 'data-state')) === 'upcoming');
await close();

// ── early at the gate
await go('lekki-beach');
await setTime(18 * 60);
await place(-0.2, -24, -Math.PI / 2);
await near('beach-highlife-gate');
await p.keyboard.press('KeyE');
await p.waitForSelector('.event-gate');
log('before showtime the gate says come back (no way in yet)', (await p.isVisible('.event-gate [data-state="booked"]')) && !(await p.isVisible('button[data-act="attend"]')));
await close();
await p.screenshot({ path: `${OUT}/stage-before.png` });

// ── showtime (clock set to 19:30)
await setTime(19 * 60 + 30);
await sleep(2500);
await place(4.5, -24, -Math.PI / 2);
await S(() => { const c = window.__retreva.runtime.camera; c.yaw = -Math.PI / 2; c.pitch = 0.25; });
await sleep(1500);
await p.screenshot({ path: `${OUT}/stage-live.png` });
// music: generated live; the band gets louder near the stage while the show is on
await sleep(1500);
let m = await S(() => window.__retreva.audio.status.music);
const bars0 = m.bars;
log('music is playing (generated live, no files) and the band is loud near the live stage', m.playing && m.intensity > 0.6, JSON.stringify(m));
await place(0, 30, 0);
await sleep(2500);
m = await S(() => window.__retreva.audio.status.music);
log('far from the stage it fades to a quiet street radio, and keeps going bar after bar', m.intensity < 0.3 && m.bars > bars0, JSON.stringify(m));
await S(() => window.__retreva.store.getState().updateSettings({ musicVolume: 0 }));
await sleep(800);
log('Music volume 0 turns it off', !(await S(() => window.__retreva.audio.status.music.playing)));
await S(() => window.__retreva.store.getState().updateSettings({ musicVolume: 0.4 }));
await place(-0.2, -24, -Math.PI / 2);
await near('beach-highlife-gate');
await S(() => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, joy: 40, energy: 80 } } }); });
await p.keyboard.press('KeyE');
await p.waitForSelector('button[data-act="attend"]');
const preShow = await st();
await p.click('button[data-act="attend"]');
await p.waitForFunction(() => window.__retreva.store.getState().resting?.at === 'event', null, { timeout: 5000 }).catch(() => {});
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 20000 });
s = await st();
log('the show: time moves to its end (22:00), joy +30, a little tired, ticket used', s.time === 22 * 60 && Math.round(s.needs.joy) >= 70 && s.needs.energy < 80 && s.tickets[0].status === 'used', `time=${s.time} joy=${s.needs.joy.toFixed(0)} energy=${s.needs.energy.toFixed(0)}`);
await sleep(1500);
s = await st();
log('Night out goal pays once', s.goals.includes('night-out') && s.ledger.filter(([id]) => id === 'goal:night-out').length === 1);
log('nothing else was charged for going in with a ticket', preShow.bal - s.bal <= 0);

// ── pay at the gate: comedy on Lagos Island (every other day; day 3 at 20:30)
await go('lagos-island');
await setTime(2 * 1440 + 20 * 60 + 30);
await place(-3.8, -12.5, -Math.PI / 2);
await near('glover-laughs-gate');
await p.keyboard.press('KeyE');
await p.waitForSelector('button[data-act="gate"]');
const preGate = await st();
await p.click('button[data-act="gate"]');
await p.click('button[data-act="confirm-gate"]');
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play' && window.__retreva.store.getState().world.time >= 2 * 1440 + 22 * 60, null, { timeout: 20000 });
s = await st();
const gateTx = s.ledger.filter(([id]) => id === 'ticket:glover-laughs:d3');
log('no ticket? pay a bit more at the gate and go straight in', gateTx.length === 1 && preGate.bal - s.bal === 4200 && s.tickets.some((t) => t.eventId === 'glover-laughs' && t.status === 'used'), JSON.stringify(gateTx));

// ── a missed show
await phone('events');
await p.click('.event-card[data-event="osu-night-jam"] button[data-act="ticket"]');
await p.click('button[data-act="confirm-ticket"]');
await sleep(300);
await setTime(3 * 1440 + 30);
await S(() => window.__retreva.store.getState().setPhoneApp('bookings'));
await sleep(400);
log('Bookings: attended shows and a missed one', (await p.getAttribute('.booking[data-ticket="osu-night-jam"]', 'data-state')) === 'missed' && (await p.getAttribute('.booking[data-ticket="beach-highlife"]', 'data-state')) === 'used');
await p.screenshot({ path: `${OUT}/bookings.png` });
await p.setViewportSize({ width: 360, height: 800 });
await sleep(500);
log('Bookings fits a 360px phone (no sideways scroll)', await S(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.phone .content')].every((el) => el.scrollWidth <= el.clientWidth + 1)));
await p.screenshot({ path: `${OUT}/bookings-mobile.png` });
await p.setViewportSize({ width: 1280, height: 760 });
await close();

// ── low mood: the tip explains what lifts it
await S(() => window.__retreva.store.getState().updateSettings({ tips: true }));
await S(() => { const st = window.__retreva.store; st.setState({ life: { ...st.getState().life, needs: { ...st.getState().life.needs, joy: 25.03 } } }); });
await p.waitForSelector('.tip-card:has-text("Feeling low")', { timeout: 30000 }).catch(() => {});
log('when joy drops below 25 a tip says how to lift it', await p.isVisible('.tip-card:has-text("Feeling low")'));
log('the joy chip warns', await p.isVisible('.need[data-need="joy"].is-warn, .need[data-need="joy"].is-low'));

// ── persistence
await S(() => window.__retreva.saves.saveNow());
await p.reload();
await p.click('text=Continue');
await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
s = await st();
log('tickets survive a reload', s.tickets.length === 3 && s.tickets.filter((t) => t.status === 'used').length === 2);
log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
