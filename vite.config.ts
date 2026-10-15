import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const BUILD_ID = Date.now().toString(36);

/** Writes dist/precache.json: every built file, for the offline service worker to precache. */
function precacheList() {
  let outDir = 'dist';
  return {
    name: 'retreva-precache-list',
    apply: 'build' as const,
    configResolved(c: { build: { outDir: string }; root: string }) {
      outDir = path.resolve(c.root, c.build.outDir);
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
      walk(outDir);
      const list = files.filter((f) => f !== 'sw.js' && f !== 'precache.json' && !f.endsWith('.map') && !f.startsWith('retreva-play'));
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
