// Shared setup for the browser playtests.
//
// Env:
//   PLAYTEST_URL      game URL (default http://localhost:4173/, the `vite preview` port)
//   PLAYTEST_OUT      screenshot folder (default ./qa-shots, gitignored)
//   PLAYTEST_GPU=1    use the machine's GPU instead of SwiftShader software GL
//   PLAYTEST_HEADED=1 show the browser window
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

export const BASE_URL = process.env.PLAYTEST_URL ?? 'http://localhost:4173/';

const SOFTWARE_GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

/** Chromium with WebGL that works headless on any machine (software GL unless PLAYTEST_GPU=1). */
export function launch() {
  return chromium.launch({
    headless: process.env.PLAYTEST_HEADED !== '1',
    args: process.env.PLAYTEST_GPU === '1' ? ['--ignore-gpu-blocklist'] : SOFTWARE_GL,
  });
}

/** Per-suite screenshot folder, created if missing. */
export function outDir(suite) {
  const dir = path.join(process.env.PLAYTEST_OUT ?? 'qa-shots', suite);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
