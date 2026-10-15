# Retreva — notes for Claude Code

**Retreva** — "Build a virtual lifestyle and travel to places of your dreams."
A mobile-first, third-person 3D virtual-life and travel game for the browser. The current build covers four areas of Lagos State (Yaba, Lagos Island, Lekki, Ikeja), Lagos and Accra airports, and Osu in Accra, with jobs, shifts, needs, friendships (chat, gifts, friend prices), an ownable bicycle, homes to rent, danfo/taxi rides, flights (budget → ticket → check-in → security → gate → flight), bargaining, goals, synthesised city soundscapes, a phone UI, offline play and local saves with backup/export.

Specs live in `docs/`: `architecture-v6.md` (product + engineering blueprint), `claude-code-update-prompt.md`, `execution-plan.md`, and `assets.md` (every asset and its licence). Project skills are in `.claude/skills/` (`retreva-regression-qa`, `retreva-responsive-web3d`, `retreva-3d-asset-pipeline`) — read the QA one before calling work done. The game is meant to grow to destinations worldwide.

## Commands

```bash
npm install
npm run dev        # Vite dev server, http://localhost:5173
npm test           # vitest unit tests (src/game/systems/systems.test.ts)
npm run typecheck  # tsc -b --noEmit
npm run build      # type-check + production build into dist/ (base: './', runs from any folder)
npm run preview    # serve dist/
```

Before calling work done: `npm run typecheck`, `npm test`, `npm run build` must all pass, and for gameplay or UI changes `npm run playtest` too (see below). Report real results — never claim a test passed that wasn't run.

## Stack

Vite 5 · React 18 · TypeScript 5.6 · three@0.169 · @react-three/fiber 8 · zustand 4 · vitest 2. Font is self-hosted (`@fontsource-variable/bricolage-grotesque`). No backend, no API keys, no paid services.

## Layout

```
src/game/            pure game logic — no React, no Three.js
  content/
    types.ts         DestinationPack schema (buildings, props, npcs, jobs, shops, items, landmarks, road style, sea…)
    destinations/    one file per area: lagos.ts (Yaba), lagosIsland.ts, lekki.ts, ikeja.ts, accra.ts (Osu);
                     airport.ts is a template (makeAirport) used by lagosAirport.ts and accraAirport.ts
    regions/         index.ts (REGIONS, findArea, regionOf, fareBetween, modeBetween), lagosState.ts, greaterAccra.ts —
                     areas you can ride between; hubs (airports) are reached by taxi
    flights.ts       flight routes: price one-way/return, gate, budget estimates, where you land
    vehicles.ts      ownable vehicles (speed, effort, colour); dealers live in pack data (`pack.dealers`)
    index.ts         pack registry + lookups (getDestination, findItem, areaOfJob, formatMoney…)
  systems/           pure, unit-tested: economy, inventory, jobs, dialogue, negotiation, progress (goals/tips), life (needs, skills, regard, shift scoring, resale), travel (trip budget, ticket → check-in → security → board → land), social (chat cooldown, gifts, friend discount, tier-ups), vehicles (own, ride, park, resell), collision
  persistence/       SaveAdapter interface; IndexedDB / localStorage / memory adapters; SaveManager + migrations
  store/gameStore.ts Zustand store — the ONLY place money, inventory, jobs, travel and world progress change
  core/              per-frame runtime + input objects (live outside React), avatar presets
src/scene/           React Three Fiber: static world builder (merged mesh + texture atlas), Player, CameraRig, Npcs, Traffic, Vehicles (bicycle model, parked bikes), Beacons, Collectibles, Systems
src/audio/           ambience.ts (Web Audio synthesis: traffic, crowd, horns, waves, chimes, effects — no files), useGameAudio.ts (area, ducking, effects)
src/ui/              DOM UI over the canvas: hud/, panels/ (dialogue, shop + haggle), phone/, travel/, avatar/, shell/, icons/, theme.css
src/assets/splash/   cover-art SVGs for the title screen (characters, postcards, car, jet, globe, skyline);
                     regenerate with `python3 src/assets/splash/generate.py`
```

## Rules that must not break

- **Destinations are data.** New areas/cities = a new pack in `content/destinations/` + a registry line in `content/index.ts`. Don't hard-code area-specific behaviour in the engine, scene or UI.
- **Money only moves through the store via the wallet ledger.** Every credit has a transaction id (`job:<jobId>:<runId>`, `goal:<goalId>`, `flight:<routeId>:<ticketId>`, ride/shop ids). One wallet, in naira, everywhere; packs with `localCurrency` show the local price as a guide only. The wallet rejects duplicate ids — this is what stops repeat payouts. Keep that pattern for any new reward.
- **Flights.** A ticket is only used up when the plane lands (`completeFlight`), so reloading mid-flight leaves you at the gate with your ticket. Airport steps are driven by dialogue conditions (`trip`, `carryingLiquids`) and actions (`checkIn`, `security`, `board`, `openFlights`).
- **Saves.** `SAVE_SCHEMA_VERSION` is 6 (v4 added `life`; v5 added `travel` and turned `life.home` into `life.homes[]`; v6 added `life.social`, `life.vehicles`, `life.riding`) (`persistence/types.ts`). `SaveManager` keeps a `backup` slot (written at most once a minute) and moves an unreadable main save to the `unreadable` slot instead of overwriting it; export/import go through `importJson`/`exportJson`. New optional `Settings` fields (sound) need no bump — `hydrate` merges `DEFAULT_SETTINGS`. Any change to `SaveData` needs a version bump plus a step in `migrate()` in `saveManager.ts`, and a unit test. The IndexedDB name and localStorage keys stay `'retriever'` (the project's old name) so existing players' saves keep loading — do not rename them.
- **Per-frame state stays out of React.** Positions, camera and input live in `core/runtime.ts` / `core/input.ts`; read them in `useFrame` or via refs. Don't put per-frame values in the Zustand store.
- **Budget Android first.** Art is procedural (no downloaded models/textures). The static world is merged into one vertex-coloured mesh + one atlas mesh; keep draw calls low. Shadows default off on touch devices. Movement integrates in fixed 1/30 s sub-steps.
- **Content checks.** `systems.test.ts` loops over `ALL_PACKS` and checks that each arrival point is clear, every NPC is reachable, collect spots aren't inside props, and job, shop, item and dialogue references resolve. A new pack is covered automatically once it's registered (and added to `LAGOS_AREAS` or a future region file).
- **Original identity.** No copied protected assets, characters, logos or branding.
- **Safety.** Never commit secrets. No paid dependencies or services without the owner's approval. No destructive changes (deleting features, rewriting history, force-push) without approval. Offline: `public/sw.js` precaches every built file listed in `dist/precache.json` (written by the `precacheList` plugin in `vite.config.ts`); bump nothing by hand — the cache name comes from `__BUILD_ID__`. Never add a network call the game needs in order to run.

## Browser playtests (`playtests/`)

Playwright scripts that play the real game in Chromium and print PASS/FAIL per check (screenshots go to `qa-shots/`, gitignored).

```bash
npx playwright install chromium         # once per machine
npm run playtest                        # build, start vite preview on :4173, run all ten default suites (~50 min with software GL)
node playtests/run.mjs expansion        # one suite against an existing build (npm run build first)
node playtests/run.mjs avatar-gallery   # screenshots of avatar looks, no pass/fail
PLAYTEST_URL=http://localhost:5173/ node playtests/run.mjs regression   # against a running dev server
```

| Suite | Covers |
|---|---|
| `regression` (40 checks) | title, character creation, movement, camera, Jollof Run (pay once, no duplicate reward), shop, phone apps, pause, save + continue after refresh, mobile touch layout |
| `expansion` (31) | danfo travel to all four areas (fare charged once), beach clean-up collect job, landmarks, bargaining, goals paid once, tips, messages, persistence, mobile travel |
| `life` (47) | needs drain, kitchen shift (pay, perfect tip, cooking XP/level-up, regard, staff meal), too-tired gate, no running when exhausted, bench rest, eating, sell-with-confirm, renting a room, sleeping, persistence of all of it — desktop and mobile |
| `city` (11) | traffic moves, keeps lanes, stops for a person in its lane, steers around the parked danfo; walkers stop to shop/wait/eat/chat/photo; draw-call and triangle budget; Ikeja traffic, Island/Lekki pedestrian-only |
| `device` (17) | offline: worker precaches every file, game opens/continues/saves with no network; graphics Low vs High (fewer vehicles, fewer draw calls/triangles, choice saved); A++ text on a 360px phone (no sideways scroll, kitchen buttons ≥ 44px) |
| `travel` (28) | trip budget adds up and blocks booking when short; return ticket with confirm, paid once; ticket survives reload; taxi to the airport; gate refuses before check-in; check-in; security stops bottled drinks; boarding, flight, landing in Osu; return ticket issued; "Wheels up" goal once; cedi guide prices; Accra taxi; flying home; history persists; mobile booking + flight fit (ticket money is topped up directly) |
| `lifestyle` (22) | bicycle: buy with confirm, paid once, ride (faster than walking), get off = parked where you stop, survives reload, auto-parks before a danfo, sell back for half with confirm; chat (+3, cooldown), gift a liked item (+8, leaves bag), tier-up text, friend price; eating animation; persistence; mobile ride/get-off by touch (bike money and one friendship level set directly) |
| `responsive` (56) | 320×640, 360×800, 390×844, 768×1024, 1024×768 (touch), 1366×768, 1920×1080: title, creation, HUD on screen without overlaps (incl. joystick), touch targets ≥ 44px, dialogue, shop and phone fit with no sideways scroll; phone rotation keeps player/camera/state |
| `resilience` (20) | no WebGL → explanation screen, existing save untouched; graphics rebuild ≠ false "paused"; real context loss → "Graphics paused" and recovery; backup restored when the main save is corrupt; unreadable save kept aside; export → wipe → import; non-save file refused; save failure warning; sound unlocks, follows the area, mute |
| `wardrobe` (14) | gender + look + name changes from the phone, saved across refresh, desktop and mobile |

Options: `PLAYTEST_GPU=1` uses the real GPU instead of SwiftShader software GL, `PLAYTEST_HEADED=1` shows the browser, `PLAYTEST_OUT` sets the screenshot folder. With software GL the game runs at ~2–11 fps, so a full run takes 10+ minutes; checks wait on game state rather than fixed times where they can. The scripts drive the game through `window.__retreva = { store, runtime, saves }` (read state, teleport by setting `runtime.player.x/z`). When game text or flows change on purpose, update the matching check rather than the game. Real-device performance has not been measured yet.

## Status and next steps

Title screen (`ui/shell/TitleScreen.tsx`) is the game cover: art placed on a fixed design stage (1920×1080 landscape, 1080×2080 portrait, chosen by aspect ratio) scaled with container units (`--u`), with sky/skyline bleeding to the edges; the Start button has a CSS glass-sweep + sparkle (off under reduced motion). Keep `.wordmark` and the button texts — the playtests rely on them.

Done: Yaba street slice; gendered avatar creator + wardrobe; four Lagos State areas; danfo travel with fares; bargaining; delivery and collect jobs; 8 goals; tip cards, area banners, toasts; Messages and Travel phone apps; needs/kitchen shift/skills/regard/rest/renting a room/selling (save v4); traffic and purposeful walkers; graphics tiers; offline play; app icons + manifest; Lagos + Accra airports, flights with budgets, Osu (Accra) with waakye shift, kente job, crafts bargaining and a guesthouse (save v5).

Characters (`scene/Character.tsx`): smooth sculpted primitives (lathed torso, capsule limbs, hands, shoes, face with lids/nose/lips), Phong material, two LODs (`near`/`far`, switched by distance in `Npcs.tsx`). Traffic (`scene/Traffic.tsx`) is data-driven via `pack.traffic`; state is mirrored in `runtime.traffic` for tests. Walker `stops` in pack data give pedestrians purposes.

Graphics tiers (`game/core/quality.ts`, `scene/useTier.ts`): Settings → Graphics (Auto/Low/Med/High) caps pixel ratio, antialiasing, shadows, vehicles, walkers, LOD distance and view distance. Auto picks Low for ≤3 GB memory or ≤4-core phones. The life playtest holds the kitchen order timer (it's wall-clock and software GL is slow).

Social: NPCs with `social: { lines, likes }` in pack data get "Chat a while" / "Give a gift" added to the node they open with (`DialoguePanel` → `socialNode`); chat replies use the transient node `'__social'`. Friend discounts apply through `store.priceAt` (shops, haggling start price, dealers).

Vehicles: `life.riding` is the uid you're on; `InteractionSystem` offers "Ride" near your parked vehicle and "Get off" while riding with nothing else in reach. `parkIfRiding()` runs before travel, boarding, shifts and resting. Animations: `CharacterAnim.pose` ('ride' | 'sit') and `eatUntil`.

Known gaps: performance on real phones is unmeasured (the playtests use software GL at 2–10 fps); offline install doesn't work inside the claude.ai artifact sandbox (registration fails silently there; the game still runs); no time of day; airports have no interior; music is not included (ambience and effects only); city packs are bundled, not separately installable.

Planned (from the blueprint): time of day and NPC schedules, more job types with requirements, home personalisation/storage and buying property, restaurant interiors and ticketed leisure, city-pack manifests (download/verify/offline per city), more destinations, optional licensed/original music. Making the opening screens global (choose a starting city) and applying the chosen logo ("Orbit R" direction) as app icon/favicon are also open.
