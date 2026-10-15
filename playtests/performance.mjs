// Performance diagnostics playtest: Settings shows live fps / draw calls / device facts; the 20-second
// benchmark runs (camera turns by itself, input is off), records real frame statistics, suggests a
// graphics tier that can be applied, and the result survives a reload. Numbers here come from
// software GL in CI — they say nothing about real phones; the point is that the tool works.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('performance');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
const S = (fn, a) => p.evaluate(fn, a);

await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await S(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.fill('#name', 'Bola');
await p.click('text=Start my life');
await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
await S(() => window.__retreva.store.getState().updateSettings({ tips: false, graphics: 'medium' }));
await sleep(2500);

await S(() => window.__retreva.store.getState().openPhone('settings'));
await p.waitForSelector('[data-perf]');
await sleep(1200);
const liveFps = await p.textContent('[data-live="fps"]');
log('Settings shows live performance numbers', /^[1-9]\d* fps$/.test(liveFps.trim()), liveFps);
await p.locator('[data-perf]').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${OUT}/settings-perf.png` });

const yaw0 = await S(() => window.__retreva.runtime.camera.yaw);
await p.click('button[data-act="bench"]');
await p.waitForSelector('.bench-overlay');
log('the benchmark closes the phone and shows its progress', (await S(() => window.__retreva.store.getState().ui)) === 'benchmark' && !(await p.isVisible('.phone')));
await sleep(5000);
const yawMid = await S(() => window.__retreva.runtime.camera.yaw);
log('the camera turns by itself while it measures; input is off', Math.abs(yawMid - yaw0) > 0.3 && !(await S(() => window.__retreva.input?.enabled ?? false)), `yaw ${yaw0.toFixed(2)} → ${yawMid.toFixed(2)}`);
await p.screenshot({ path: `${OUT}/benchmark-running.png` });
await p.waitForSelector('[data-bench]', { timeout: 60000 });
const r = await S(() => window.__retreva.store.getState().settings.lastBenchmark);
log('the result has real frame statistics', r && r.frames > 10 && r.avgFps > 0 && r.low1Fps > 0 && r.low1Fps <= r.avgFps && r.p95Ms > 0 && r.seconds >= 19 && r.drawCalls > 0, JSON.stringify({ frames: r?.frames, avg: r?.avgFps, low: r?.low1Fps, p95: r?.p95Ms, calls: r?.drawCalls, s: r?.seconds }));
log('afterwards you are back in Settings with a verdict', (await S(() => window.__retreva.store.getState().ui)) === 'phone' && (await p.isVisible('.bench-verdict')));
await p.locator('[data-bench]').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${OUT}/benchmark-result.png` });
if (r.suggest !== 'medium') {
  await p.click('button[data-act="apply-suggest"]');
  await sleep(300);
  log('the suggested graphics tier can be applied in one tap', (await S(() => window.__retreva.store.getState().settings.graphics)) === r.suggest, r.suggest);
} else log('medium suggested; nothing to apply', true);
await S(() => window.__retreva.saves.saveNow());
await p.reload();
await p.click('text=Continue');
await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
await S(() => window.__retreva.store.getState().openPhone('settings'));
await p.waitForSelector('[data-bench]');
log('the last result survives a reload', Number((await p.textContent('[data-bench-fps]')).split(' ')[0]) === r.avgFps);
await p.setViewportSize({ width: 360, height: 800 });
await sleep(600);
log('the performance section fits a 360px phone', await S(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.phone .content')].every((el) => el.scrollWidth <= el.clientWidth + 1)));
log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
