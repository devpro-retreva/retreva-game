// Day/night playtest: the clock runs and shows on the HUD; dusk and night change the light and sky;
// shopkeepers keep opening hours (but never vanish mid-job); fewer people out at night; sleeping at
// night wakes you at 07:00 the next day; the clock is saved; the phone shows who's open.
import { launch, LIVE_URL as BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('daynight');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
const S = (fn, a) => p.evaluate(fn, a);
const setTime = (min) => S((m) => { const st = window.__retreva.store; st.setState({ world: { ...st.getState().world, time: m } }); }, min);
const time = () => S(() => window.__retreva.store.getState().world.time);
await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Dayo');
await p.click('text=Start my life');
await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));
const t0 = await time();
log('a new life starts at 08:00 on day 1, shown on the HUD', Math.abs(t0 - 480) < 5 && /Day 1 · 08:0/.test(await p.textContent('.money .clock')), await p.textContent('.money .clock'));
await sleep(3000); // first frames after loading are slow on software GL
const ta = await time();
await sleep(10000);
const t1 = await time();
log('the clock runs while you play (about 30 game minutes per real minute)', t1 - ta > 2 && t1 - ta < 7, `${(t1 - ta).toFixed(2)} game min in 10 s`);

// light at noon vs night (sampled from the rendered frame: average brightness of the sky band)
const brightness = () => S(() => new Promise((res) => requestAnimationFrame(() => {
  const c = document.querySelector('canvas');
  const off = document.createElement('canvas');
  off.width = 64; off.height = 36;
  const g = off.getContext('2d');
  g.drawImage(c, 0, 0, 64, 36);
  const d = g.getImageData(0, 0, 64, 36).data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2];
  res(sum / (d.length / 4) / 3);
})));
await setTime(12 * 60);
await sleep(2500);
const noon = await brightness();
await p.screenshot({ path: `${OUT}/noon.png` });
await setTime(19 * 60);
await sleep(2500);
await p.screenshot({ path: `${OUT}/dusk.png` });
await setTime(22 * 60);
await sleep(3000);
const night = await brightness();
await p.screenshot({ path: `${OUT}/night.png` });
log('night is clearly darker than noon (rendered frame)', night < noon * 0.7, `noon ${noon.toFixed(0)} · night ${night.toFixed(0)}`);
log('the HUD clock shows night', /22:0/.test(await p.textContent('.money .clock')) && (await p.getAttribute('.money .clock', 'class')).includes('phase-night'));

// opening hours
const present = () => S(() => [...window.__retreva.runtime.actors.keys()]);
let ids = await present();
log('at 22:00 Mama Titi has gone home; Kunle the conductor is still out', !ids.includes('mama-titi') && ids.includes('kunle'), ids.filter((i) => !i.startsWith('walker')).join(','));
log('fewer people are out at night', ids.filter((i) => i.startsWith('walker')).length <= 2);
await S(() => window.__retreva.store.getState().openPhone('map'));
await p.waitForSelector('[data-open]');
log('the Map app lists who is open (Mama Titi: opens 07:00)', await p.isVisible('.card-line[data-open="no"]:has-text("Mama Titi")'));
await p.screenshot({ path: `${OUT}/map-hours.png` });
await S(() => window.__retreva.store.getState().closePanel());
await setTime(9 * 60);
await p.waitForFunction(() => window.__retreva.runtime.actors.has('mama-titi'), null, { timeout: 15000 }).catch(() => {});
log('in the morning she is back', (await present()).includes('mama-titi'));

// mid-job she stays even past closing
await S(() => window.__retreva.store.getState().acceptJob('jollof-run'));
await setTime(22 * 60 + 30);
await sleep(1500);
log('people never vanish in the middle of your job', (await present()).includes('mama-titi') && (await present()).includes('tunde'));
await S(() => { const st = window.__retreva.store; st.setState({ jobs: { ...st.getState().jobs, active: null } }); });

// sleep at night → next morning (rent the room first; money topped up directly)
await S(() => { const st = window.__retreva.store; const s = st.getState(); st.setState({ life: { ...s.life, homes: ['yaba-room'], needs: { energy: 30, fullness: 60 } } }); });
await setTime(23 * 60);
await S(() => window.__retreva.store.getState().startRest('home'));
await p.waitForFunction(() => window.__retreva.store.getState().ui === 'play', null, { timeout: 20000 });
const woke = await time();
log('sleeping at 23:00 wakes you at 07:00 on day 2', woke >= 1440 + 7 * 60 && woke < 1440 + 7 * 60 + 3, `${woke}`);
await S(() => window.__retreva.saves.saveNow());
await p.reload();
await p.click('text=Continue');
await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
const after = await time();
log('the clock is saved and continues after reload', after >= woke && after < woke + 10);

// a danfo ride takes time
const tr = await time();
await S(() => window.__retreva.store.getState().travelTo('lekki-beach'));
await p.waitForFunction(() => window.__retreva.store.getState().destinationId === 'lekki-beach' && window.__retreva.store.getState().phase === 'playing', null, { timeout: 60000 });
log('a danfo ride to Lekki takes time on the clock', (await time()) - tr >= 40, `${((await time()) - tr).toFixed(0)} min`);
await setTime(2 * 1440 + 21 * 60);
await sleep(3000);
await p.screenshot({ path: `${OUT}/lekki-night.png` });
log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
