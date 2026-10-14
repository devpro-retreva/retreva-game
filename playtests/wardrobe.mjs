// Tests the in-game profile editor: change gender + look + name from the phone, save, refresh.
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('wardrobe');
const b = await launch();
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };

async function run(name, viewport, mobile) {
  const ctx = await b.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  const av = () => p.evaluate(() => window.__retreva.store.getState().profile);
  const tap = (sel) => (mobile ? p.tap(sel) : p.click(sel));
  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await p.evaluate(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');
  await tap('text=Start a new life');
  await p.fill('#name', 'Kemi');
  await tap('[aria-label="Gender"] button:has-text("Female")');
  await tap('[aria-label="Hairstyle"] button:has-text("Braids")');
  await tap('text=Start my life');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 30000 });
  let prof = await av();
  log(`[${name}] new female character saved`, prof.avatar.gender === 'female' && prof.avatar.hair === 'braids', JSON.stringify({ g: prof.avatar.gender, hair: prof.avatar.hair, outfit: prof.avatar.outfit }));

  await tap('button[aria-label="Open phone (P)"]');
  await tap('button[aria-label="Profile"]');
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${name}-profile.png` });
  await tap('text=Change look & name');
  await p.waitForSelector('.wardrobe');
  const paused = await p.evaluate(() => window.__retreva.store.getState().ui);
  log(`[${name}] wardrobe opens from profile`, paused === 'wardrobe');
  await tap('[aria-label="Gender"] button:has-text("Male")');
  await tap('[aria-label="Hairstyle"] button:has-text("Locs")');
  await tap('[aria-label="Facial hair"] button:has-text("Full beard")');
  await tap('[aria-label="Outfit"] button:has-text("Kaftan")');
  await p.fill('#wardrobe-name', 'Kemi O.');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/${name}-wardrobe.png` });
  await tap('button:has-text("Save changes")');
  await p.waitForTimeout(400);
  prof = await av();
  const ui = await p.evaluate(() => window.__retreva.store.getState().ui);
  log(`[${name}] saved changes apply`, prof.name === 'Kemi O.' && prof.avatar.gender === 'male' && prof.avatar.hair === 'locs' && prof.avatar.facialHair === 'beard' && prof.avatar.outfit === 'kaftan' && ui === 'play', JSON.stringify({ n: prof.name, ...prof.avatar }));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${OUT}/${name}-ingame.png` });

  // cancel leaves the profile untouched
  await tap('button[aria-label="Open phone (P)"]');
  await tap('button[aria-label="Profile"]');
  await tap('text=Change look & name');
  await tap('[aria-label="Gender"] button:has-text("Female")');
  await tap('.wardrobe button:has-text("Cancel")');
  prof = await av();
  log(`[${name}] cancel discards edits`, prof.avatar.gender === 'male');

  await p.waitForTimeout(800);
  await p.reload();
  await tap('text=Continue');
  await p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 30000 });
  prof = await av();
  log(`[${name}] look survives refresh`, prof.name === 'Kemi O.' && prof.avatar.hair === 'locs' && prof.avatar.outfit === 'kaftan');
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  log(`[${name}] no horizontal overflow`, !overflow);
  log(`[${name}] no page errors`, errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await run('desktop', { width: 1280, height: 760 }, false);
await run('mobile', { width: 360, height: 740 }, true);
await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
