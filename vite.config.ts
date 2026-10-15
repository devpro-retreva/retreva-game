import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const BUILD_ID = Date.now().toString(36);

/**
 * Writes dist/packs.json — every city pack's files with size and SHA-256 (for install / verify / remove
 * in Settings → Cities) — and dist/precache.json: every other built file, for the offline service worker.
 * City packs are the dynamic chunks of `src/game/content/destinations/<city>Pack.ts`; they are left out
 * of the precache so the base game stays small, and are only kept offline when installed.
 */
function precacheList() {
  let outDir = 'dist';
  const cityChunks: Record<string, string[]> = {};
  return {
    name: 'retreva-precache-list',
    apply: 'build' as const,
    configResolved(c: { build: { outDir: string }; root: string }) {
      outDir = path.resolve(c.root, c.build.outDir);
    },
    generateBundle(_: unknown, bundle: Record<string, { type: string; fileName: string; facadeModuleId?: string | null; isDynamicEntry?: boolean }>) {
      for (const chunk of Object.values(bundle)) {
        const m = chunk.type === 'chunk' && chunk.isDynamicEntry ? /destinations[\\/](\w+)Pack\.ts$/.exec(chunk.facadeModuleId ?? '') : null;
        if (m) (cityChunks[m[1]] ??= []).push(chunk.fileName);
      }
    },
    closeBundle() {
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const f of fs.readdirSync(dir)) {
          const full = path.join(dir, f);
          if (fs.statSync(full).isDirectory()) walk(full);
          else files.push(path.relative(outDir, full).split(path.sep).join('/'));
        }
      };
      const cities: Record<string, { files: { path: string; bytes: number; sha256: string }[]; bytes: number }> = {};
      for (const [id, list] of Object.entries(cityChunks)) {
        const entries = list.map((p) => {
          const buf = fs.readFileSync(path.join(outDir, p));
          return { path: p, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
        });
        cities[id] = { files: entries, bytes: entries.reduce((n, e) => n + e.bytes, 0) };
      }
      fs.writeFileSync(path.join(outDir, 'packs.json'), JSON.stringify({ version: BUILD_ID, cities }));
      walk(outDir);
      const cityFiles = new Set(Object.values(cityChunks).flat());
      const list = files.filter((f) => f !== 'sw.js' && f !== 'precache.json' && !f.endsWith('.map') && !f.startsWith('retreva-play') && !cityFiles.has(f));
      fs.writeFileSync(path.join(outDir, 'precache.json'), JSON.stringify({ version: BUILD_ID, files: list }));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), precacheList()],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber'],
        },
      },
    },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
} as never);
