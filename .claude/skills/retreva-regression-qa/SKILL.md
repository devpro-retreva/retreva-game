---
name: retreva-regression-qa
description: Use after any change to Retreva gameplay, character assets, controls, rendering, persistence, offline behavior, or responsive UI.
---

# Retreva Regression QA

## Before editing
- Identify current scripts for build, lint, type-check, and tests.
- Run available baseline checks and record failures that predate the change.
- Inspect current movement, camera, local save implementation, and supported browsers.

## After editing
1. Run relevant tests, lint/type checks, and production build.
2. Verify the app starts and the changed feature works in the running game; code compilation alone is not enough.
3. Check movement, camera, collision, animation transitions, and touch/keyboard/mouse input as relevant.
4. Test save -> reload -> verify wallet, inventory, avatar, settings, and location; never erase an existing save to make a test pass.
5. Test offline launch after required assets are cached/installed, and report any network dependency.
6. Check 320px mobile layout, portrait/landscape, tablet, and desktop breakpoints.
7. Record actual frame rate, load size/time, errors, and memory metrics when available.
8. Keep a rollback path and fix regressions caused by the change.

## Report format
Separate:
- Implemented
- Tested and passed (include commands/devices and observed results)
- Partially working
- Not implemented / blocked
- Existing failures not caused by this change
- Next recommended milestone

Never invent test results, claim device coverage from emulation alone, or mark a feature complete because a mockup exists.

## This repository (commands that exist today)
- `npm run typecheck`, `npm test` (vitest, `src/game/systems/systems.test.ts`), `npm run build`.
- Browser suites in `playtests/` (Playwright + SwiftShader software GL, ~2–10 fps, so timings are slow):
  `npm run playtest` builds and runs the default suites; `PLAYTEST_URL=http://localhost:4173/ node playtests/run.mjs <suite…>` runs chosen suites against `vite preview --port 4173`.
  Suites: `regression`, `expansion`, `wardrobe`, `life`, `city`, `device` (offline/graphics/large text), `travel`, `responsive` (viewport matrix).
  The full set takes 25+ minutes; run long batches in the background and read the log.
- The scripts drive the game through `window.__retreva = { store, runtime, saves }`. When game text or flows change on purpose, update the check, not the game.
- Real-device performance is not covered by these suites — report it as untested unless measured on hardware.
