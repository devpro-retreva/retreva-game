# Retreva — notes for Claude Code

**Retreva** — "Build a virtual lifestyle and travel to places of your dreams."
A mobile-first, third-person 3D virtual-life and travel game for the browser. The current build covers four areas of Lagos State (Yaba, Lagos Island, Lekki, Ikeja) with jobs, danfo travel, bargaining, goals, tips/notifications, a phone UI and local saves. The game is meant to grow to destinations worldwide; Lagos is the first.

## Commands

```bash
npm install
npm run dev        # Vite dev server, http://localhost:5173
npm test           # vitest unit tests (src/game/systems/systems.test.ts)
npm run typecheck  # tsc -b --noEmit
npm run build      # type-check + production build into dist/ (base: './', runs from any folder)
npm run preview    # serve dist/
```

Before calling work done: `npm run typecheck`, `npm test`, `npm run build` must all pass. Report real results — never claim a test passed that wasn't run.

## Stack

Vite 5 · React 18 · TypeScript 5.6 · three@0.169 · @react-three/fiber 8 · zustand 4 · vitest 2. Font is self-hosted (`@fontsource-variable/bricolage-grotesque`). No backend, no API keys, no paid services.

## Layout

```
src/game/            pure game logic — no React, no Three.js
  content/
    types.ts         DestinationPack schema (buildings, props, npcs, jobs, shops, items, landmarks, road style, sea…)
    destinations/    one file per area: lagos.ts (Yaba), lagosIsland.ts, lekki.ts, ikeja.ts
    regions/lagosState.ts   map coords, fareBetween(), minutesBetween()
    index.ts         pack registry + lookups (getDestination, findItem, areaOfJob, formatMoney…)
  systems/           pure, unit-tested: economy, inventory, jobs, dialogue, negotiation, progress (goals/tips), collision
  persistence/       SaveAdapter interface; IndexedDB / localStorage / memory adapters; SaveManager + migrations
  store/gameStore.ts Zustand store — the ONLY place money, inventory, jobs, travel and world progress change
  core/              per-frame runtime + input objects (live outside React), avatar presets
src/scene/           React Three Fiber: static world builder (merged mesh + texture atlas), Player, CameraRig, Npcs, Beacons, Collectibles, Systems
src/ui/              DOM UI over the canvas: hud/, panels/ (dialogue, shop + haggle), phone/, travel/, avatar/, shell/, icons/, theme.css
```

## Rules that must not break

- **Destinations are data.** New areas/cities = a new pack in `content/destinations/` + a registry line in `content/index.ts`. Don't hard-code area-specific behaviour in the engine, scene or UI.
- **Money only moves through the store via the wallet ledger.** Every credit has a transaction id (`job:<jobId>:<runId>`, `goal:<goalId>`, ride/shop ids). The wallet rejects duplicate ids — this is what stops repeat payouts. Keep that pattern for any new reward.
- **Saves.** `SAVE_SCHEMA_VERSION` is 3 (`persistence/types.ts`). Any change to `SaveData` needs a version bump plus a step in `migrate()` in `saveManager.ts`, and a unit test. The IndexedDB name and localStorage keys stay `'retriever'` (the project's old name) so existing players' saves keep loading — do not rename them.
- **Per-frame state stays out of React.** Positions, camera and input live in `core/runtime.ts` / `core/input.ts`; read them in `useFrame` or via refs. Don't put per-frame values in the Zustand store.
- **Budget Android first.** Art is procedural (no downloaded models/textures). The static world is merged into one vertex-coloured mesh + one atlas mesh; keep draw calls low. Shadows default off on touch devices. Movement integrates in fixed 1/30 s sub-steps.
- **Content checks.** `systems.test.ts` loops over `ALL_PACKS` and checks that each arrival point is clear, every NPC is reachable, collect spots aren't inside props, and job, shop, item and dialogue references resolve. A new pack is covered automatically once it's registered (and added to `LAGOS_AREAS` or a future region file).
- **Original identity.** No copied protected assets, characters, logos or branding.
- **Safety.** Never commit secrets. No paid dependencies or services without the owner's approval. No destructive changes (deleting features, rewriting history, force-push) without approval. Don't claim offline/PWA support — there's no service worker yet.

## Debugging and playtests

`window.__retreva = { store, runtime, saves }` is exposed for automated browser tests (e.g. Playwright: `__retreva.store.getState()`, teleport by setting `runtime.player.x/z`). Headless Chromium needs software GL (SwiftShader) and runs at only ~2–11 fps, so timing-based checks need generous waits; real-device performance has not been measured yet.

## Status and next steps

Done: Yaba street slice; gendered avatar creator + wardrobe; four Lagos State areas; danfo travel with fares; bargaining; delivery and collect jobs; 8 goals; tip cards, area banners, toasts; Messages and Travel phone apps; save schema v3.

Known gaps: the README's "What's in the slice" section predates the expansion (it still calls Messages/Travel "coming later"); performance on a real budget Android phone is untested; no PWA/service worker.

Planned (from the blueprint): a home and time of day, more jobs, restaurant interior, airport (taxi → check-in → security → gate), flight, then a second country (Accra). Making the opening screens global (choose a starting city) and applying the chosen logo ("Orbit R" direction) as app icon/favicon are also open.
