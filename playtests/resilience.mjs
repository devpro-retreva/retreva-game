// Resilience playtest (Architecture V6 §9 and §16): what happens when things go wrong.
//  - no WebGL → a clear explanation instead of a blank page; the save is untouched
//  - the GPU drops the graphics context → "Graphics paused" + progress saved; it clears on restore
//  - the main save is corrupted → the backup is restored, and the unreadable copy is kept
//  - an unreadable save with no backup → a new game never overwrites the kept copy
//  - export a save file → wipe → import it → the game comes back
//  - saving fails (storage blocked) → the player is told instead of losing progress silently
//  - sound unlocks on the first tap and follows the area; mute works
import { chromium } from 'playwright';
import fs from 'node:fs';
import { launch, BASE_URL, outDir } from './lib.mjs';
const OUT = outDir('resilience');
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const newGame = async (p, name) => {
  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  await p.evaluate(() => indexedDB.deleteDatabase('retriever'));
  await p.reload();
  await p.waitForSelector('.wordmark');
  await p.click('text=Start a new life');
  await p.fill('#name', name);
  await p.click('text=Start my life');
};
const waitPlaying = (p) => p.waitForFunction(() => window.__retreva?.store.getState().phase === 'playing', null, { timeout: 60000 });
/** Read/write a raw slot in the game's IndexedDB. */
const idb = (p, op, slot, value) =>
  p.evaluate(([op, slot, value]) => new Promise((res, rej) => {
    const req = indexedDB.open('retriever', 1);
    req.onsuccess = () => {
      const t = req.result.transaction('saves', op === 'get' ? 'readonly' : 'readwrite');
      const st = t.objectStore('saves');
      const r = op === 'get' ? st.get(slot) : op === 'del' ? st.delete(slot) : st.put(value, slot);
      t.oncomplete = () => { req.result.close(); res(op === 'get' ? r.result ?? null : true); };
      t.onerror = () => rej(t.error);
    };
    req.onerror = () => rej(req.error);
  }), [op, slot, value]);

// ── no WebGL at all
{
  const nogl = await chromium.launch({ headless: true, args: ['--disable-webgl', '--disable-3d-apis', '--disable-gpu'] });
  const p = await (await nogl.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  // an existing save (minimal valid document) must survive the fallback untouched
  await p.goto(BASE_URL);
  await p.waitForSelector('.wordmark');
  const doc = {
    schemaVersion: 6, revision: 7, updatedAt: 1, deviceId: 'x',
    profile: { name: 'Nogl', avatar: {}, createdAt: 0 }, destinationId: 'lagos-adeniyi',
    wallet: { balance: 4321, ledger: [] }, inventory: { entries: [] }, jobs: { active: null, history: [], cooldowns: {} },
    world: { visited: ['lagos-adeniyi'], discovered: [], goalsDone: [], seenTips: [], messages: [], bestBargain: 0, rides: 0 },
    settings: {}, player: { position: [2.4, 41], yaw: 3.14 }, stats: { playTimeMs: 0 },
  };
  await idb(p, 'put', 'main', doc);
  await p.reload();
  await p.waitForSelector('button:has-text("Continue")');
  await p.click('button:has-text("Continue")');
  await p.waitForSelector('[data-gfx="unavailable"]', { timeout: 20000 }).catch(() => {});
  const shown = await p.isVisible('[data-gfx="unavailable"]');
  log('no WebGL: a clear "3D graphics couldn’t start" screen with next steps (no blank page)', shown && (await p.isVisible('text=3D graphics couldn’t start')) && (await p.isVisible('button:has-text("Try again")')));
  await sleep(1500);
  const after = await idb(p, 'get', 'main');
  log('no WebGL: no crash, and the existing save is untouched', errs.length === 0 && after?.revision === 7 && after?.wallet.balance === 4321, errs.slice(0, 1).join(' '));
  await p.click('button:has-text("Back to title")');
  log('no WebGL: "Back to title" works', await p.waitForSelector('.wordmark', { timeout: 10000 }).then(() => true).catch(() => false));
  await p.screenshot({ path: `${OUT}/no-webgl.png` });
  await nogl.close();
}

const b = await launch();
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  const S = (fn, a) => p.evaluate(fn, a);
  await newGame(p, 'Remi');
  await waitPlaying(p);
  await S(() => window.__retreva.store.getState().updateSettings({ tips: false, shadows: 'off' }));

  // ── sound: unlocked by the first click, follows the area, mute works
  await p.mouse.click(640, 400);
  await sleep(800);
  let a = await S(() => window.__retreva.audio.status);
  log('sound starts after the first tap and plays Yaba’s street mix', a.state === 'running' && a.area === 'lagos-adeniyi' && a.layers >= 3, JSON.stringify(a));
  await S(() => window.__retreva.store.getState().updateSettings({ muted: true }));
  a = await S(() => ({ ...window.__retreva.audio.settings }));
  log('mute is applied to the sound engine and saved in settings', a.muted === true && (await S(() => window.__retreva.store.getState().settings.muted)) === true);
  await S(() => window.__retreva.store.getState().updateSettings({ muted: false }));

  // ── rebuilding the 3D canvas (graphics setting, travel) must not look like a lost context
  await S(() => window.__retreva.store.getState().updateSettings({ graphics: 'low' }));
  await sleep(4000);
  await S(() => window.__retreva.store.getState().updateSettings({ graphics: 'auto' }));
  await sleep(4000);
  log('changing graphics quality rebuilds the scene without a false "Graphics paused"', !(await p.isVisible('[data-gfx="lost"]')));
  // wait until the rebuilt canvas is drawing again before testing a real loss
  await S(() => { window.__retreva.runtime.perf.drawCalls = 0; });
  await p.waitForFunction(() => window.__retreva.runtime.perf.drawCalls > 0, null, { timeout: 60000 });

  // ── the GPU drops the context mid-game
  await S(() => { window.__lose = document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context'); window.__lose.loseContext(); });
  await p.waitForSelector('[data-gfx="lost"]', { timeout: 10000 }).catch(() => {});
  log('losing the graphics context shows "Graphics paused" (progress saved)', await p.isVisible('[data-gfx="lost"]'));
  await p.screenshot({ path: `${OUT}/context-lost.png` });
  await S(() => window.__lose.restoreContext());
  await p.waitForSelector('[data-gfx="lost"]', { state: 'detached', timeout: 15000 }).catch(() => {});
  log('when graphics come back, the message clears and play continues', !(await p.isVisible('[data-gfx="lost"]')) && (await S(() => window.__retreva.store.getState().phase)) === 'playing');

  // ── backup: corrupt the main save, reload → the backup is restored, the bad copy kept
  await S(() => window.__retreva.store.getState().buy('iya-bisi', 'water'));
  await S(() => window.__retreva.saves.saveNow());
  const good = await idb(p, 'get', 'main');
  const backup = await idb(p, 'get', 'backup');
  log('a backup copy is written alongside the save', !!backup && backup.profile.name === 'Remi');
  await idb(p, 'put', 'main', { schemaVersion: 999, junk: 'written by some future version' });
  await p.reload();
  await p.waitForSelector('.wordmark');
  const notice = (await p.textContent('.title-notice').catch(() => '')) ?? '';
  const kept = await idb(p, 'get', 'unreadable');
  log('an unreadable save: the title explains the backup was restored, and Continue is offered', /backup/.test(notice) && (await p.isVisible('button:has-text("Continue")')), notice.slice(0, 80));
  log('the unreadable copy is kept untouched', kept?.schemaVersion === 999);
  await p.screenshot({ path: `${OUT}/backup-restored.png` });
  await p.click('text=Continue');
  await waitPlaying(p);
  const restored = await S(() => window.__retreva.store.getState().profile.name);
  log('continuing from the backup works', restored === 'Remi');

  // ── export → wipe → import
  await S(() => window.__retreva.store.getState().openPhone('settings'));
  await p.waitForSelector('button:has-text("Export save file")');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('button:has-text("Export save file")')]);
  const file = `${OUT}/exported-save.json`;
  await dl.saveAs(file);
  const exported = JSON.parse(fs.readFileSync(file, 'utf8'));
  log('Export save file downloads the current game as JSON', exported.profile?.name === 'Remi' && typeof exported.wallet?.balance === 'number', dl.suggestedFilename());
  const bal = exported.wallet.balance;
  await S(() => window.__retreva.store.getState().closePanel());
  await S(() => window.__retreva.saves.wipe());
  await idb(p, 'del', 'unreadable');
  await p.reload();
  await p.waitForSelector('.wordmark');
  const fresh = await p.isVisible('button:has-text("Start a new life")');
  await p.setInputFiles('.title-import input', file);
  await waitPlaying(p);
  const back = await S(() => ({ name: window.__retreva.store.getState().profile.name, bal: window.__retreva.store.getState().wallet.balance }));
  log('after wiping, importing the file from the title screen brings the game back', fresh && back.name === 'Remi' && back.bal === bal, JSON.stringify(back));
  await p.reload();
  await p.waitForSelector('.wordmark');
  log('the imported game is saved (Continue after reload)', await p.isVisible('button:has-text("Continue")'));
  fs.writeFileSync(`${OUT}/not-a-save.json`, '{"hello":"world"}');
  await p.setInputFiles('.title-import input', `${OUT}/not-a-save.json`);
  await p.waitForSelector('.title-notice', { timeout: 5000 }).catch(() => {});
  log('importing a file that isn’t a save is refused with a clear message', /isn’t a Retreva save/.test((await p.textContent('.title-notice').catch(() => '')) ?? ''));

  // ── saving fails → the player is told
  await p.click('text=Continue');
  await waitPlaying(p);
  await S(() => { IDBObjectStore.prototype.put = function () { throw new DOMException('The quota has been exceeded.', 'QuotaExceededError'); }; });
  await S(() => window.__retreva.store.getState().buy('iya-bisi', 'water'));
  await p.waitForSelector('.toast:has-text("Couldn’t save")', { timeout: 10000 }).catch(() => {});
  log('when saving fails (storage full), a warning says so and suggests what to do', await p.isVisible('.toast:has-text("Couldn’t save")'));
  await p.screenshot({ path: `${OUT}/save-failed.png` });
  log('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ── unreadable save, no backup: a new game must not overwrite it
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  const p = await ctx.newPage();
  await newGame(p, 'Temp');
  await waitPlaying(p);
  await idb(p, 'del', 'backup');
  await idb(p, 'put', 'main', { schemaVersion: 999, from: 'the future' });
  await p.reload();
  await p.waitForSelector('.wordmark');
  const notice = (await p.textContent('.title-notice').catch(() => '')) ?? '';
  log('no backup: the title says the save is kept safe, and offers a new life', /kept safe/.test(notice) && (await p.isVisible('button:has-text("Start a new life")')));
  await p.click('text=Start a new life');
  await p.fill('#name', 'Newer');
  await p.click('text=Start my life');
  await waitPlaying(p);
  await p.evaluate(() => window.__retreva.saves.saveNow());
  const kept = await idb(p, 'get', 'unreadable');
  log('starting a new life keeps the unreadable save aside (never silently erased)', kept?.from === 'the future');
  await ctx.close();
}

await b.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
