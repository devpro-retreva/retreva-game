// Runs browser playtests against the production build.
//
//   node playtests/run.mjs                      → all default suites (see DEFAULT)
//   node playtests/run.mjs expansion            → one suite
//   node playtests/run.mjs avatar-gallery       → screenshots only (no pass/fail)
//
// Starts `vite preview` on port 4173 unless PLAYTEST_URL is set (then it uses that server).
// Build first (`npm run build`); `npm run playtest` does both. `device` and `cities` also serve dist/
// themselves (PLAYTEST_DIST to point elsewhere) so they can stop the server to test real offline play.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const DEFAULT = ['regression', 'expansion', 'wardrobe', 'life', 'city', 'device', 'travel', 'lifestyle', 'responsive', 'resilience', 'daynight', 'work', 'homes', 'leisure', 'performance', 'cities', 'dubai', 'badagry', 'abuja', 'calabar', 'ibadan', 'abeokuta'];
const suites = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;

for (const s of suites) {
  if (!fs.existsSync(path.join(here, `${s}.mjs`))) {
    console.error(`Unknown suite "${s}". Available: ${fs.readdirSync(here).filter((f) => f.endsWith('.mjs') && !['lib.mjs', 'run.mjs', 'static-server.mjs'].includes(f)).map((f) => f.slice(0, -4)).join(', ')}`);
    process.exit(2);
  }
}

let server;
if (!process.env.PLAYTEST_URL) {
  if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
    console.error('No build found in dist/. Run `npm run build` first (or `npm run playtest`, which builds).');
    process.exit(2);
  }
  const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  server = spawn(process.execPath, [vite, 'preview', '--port', '4173', '--strictPort'], { cwd: root, stdio: 'ignore' });
  const url = 'http://localhost:4173/';
  const t0 = Date.now();
  for (;;) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {}
    if (Date.now() - t0 > 20000 || server.exitCode !== null) {
      console.error('vite preview did not start on port 4173 (is something else using it?).');
      server.kill();
      process.exit(2);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

const summary = [];
for (const s of suites) {
  console.log(`\n━━ ${s} ━━`);
  const t = Date.now();
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(here, `${s}.mjs`)], { cwd: root, stdio: 'inherit' });
    child.on('exit', (c) => resolve(c ?? 1));
  });
  summary.push({ s, ok: code === 0, secs: Math.round((Date.now() - t) / 1000) });
}
server?.kill();

console.log('\n━━ summary ━━');
for (const { s, ok, secs } of summary) console.log(`${ok ? 'PASS' : 'FAIL'}  ${s} (${secs}s)`);
console.log(`Screenshots: ${process.env.PLAYTEST_OUT ?? 'qa-shots'}/`);
process.exit(summary.every((r) => r.ok) ? 0 : 1);
