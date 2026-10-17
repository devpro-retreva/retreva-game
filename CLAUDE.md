# Retreva — notes for Claude Code

**Retreva** — "Build a virtual lifestyle and travel to places of your dreams."
A mobile-first, third-person 3D virtual-life and travel game for the browser. The current build covers five areas of Lagos State (Yaba, Lagos Island, Lekki, Ikeja, Badagry), Lagos, Abuja, Accra and Dubai airports, Wuse in Abuja, Osu in Accra and Dubai Creek, with a day/night clock and opening hours, jobs (deliveries, collecting, a repair bench, guided tours, courier ranks), shifts, needs (energy, fullness, joy), friendships (chat, gifts, friend prices), an ownable bicycle, homes to rent, buy, furnish and walk into, a restaurant, ticketed shows, danfo/taxi rides, flights, domestic and international (budget → ticket → check-in → security → gate → flight), bargaining, goals, synthesised soundscapes and generated music, a phone UI, city packs, a performance benchmark, offline play and local saves with backup/export.

Specs live in `docs/`: `architecture-v6.md` (product + engineering blueprint), `claude-code-update-prompt.md`, `execution-plan.md`, and `assets.md` (every asset and its licence). Project skills are in `.claude/skills/` (`retreva-regression-qa`, `retreva-responsive-web3d`, `retreva-3d-asset-pipeline`) — read the QA one before calling work done. The game is meant to grow to destinations worldwide.

## Commands

```bash
npm install
npm run dev        # Vite dev server, http://localhost:5173
npm test           # vitest unit tests (src/game/systems/systems.test.ts)
npm run typecheck  # tsc -b --noEmit
npm run build      # type-check + production build into dist/ (base: './', runs from any folder)
npm run preview    # serve dist/
npm run blender:setup     # dev only: headless Blender 5.2 (bpy) into /opt/blender-py for tools/blender/
npm run blender:selftest  # checks the GLB optimize + preview scripts (no paid generation)
```

Before calling work done: `npm run typecheck`, `npm test`, `npm run build` must all pass, and for gameplay or UI changes `npm run playtest` too (see below). Report real results — never claim a test passed that wasn't run.

## Stack

Vite 5 · React 18 · TypeScript 5.6 · three@0.169 · @react-three/fiber 8 · zustand 4 · vitest 2. Font is self-hosted (`@fontsource-variable/bricolage-grotesque`). No backend, no API keys, no paid services.

## Layout

```
src/game/            pure game logic — no React, no Three.js
  content/
    types.ts         DestinationPack schema (buildings, props, npcs, jobs, shops, items, landmarks, road style, sea…)
    destinations/    one file per area: lagos.ts (Yaba), lagosIsland.ts, lekki.ts, ikeja.ts, badagry.ts, abuja.ts (Wuse), accra.ts (Osu), dubai.ts (Dubai Creek);
                     airport.ts is a template (makeAirport) used by lagosAirport.ts, abujaAirport.ts, accraAirport.ts and dubaiAirport.ts;
                     airport lines use {flight} {gate} {entry} {papers}, filled from your ticket (flights.ts flightText; papers = ID card on domestic routes)
    cities.ts        city packs: Lagos built in; Abuja, Accra and Dubai (destinations/<city>Pack.ts) are separate chunks loaded on demand
                     (loadCity / ensureAreas / ensureForSave); a small index (areas, event and home ids) per city
    cityStore.ts     keep a city offline: install (hash-checked, own Cache Storage bucket), verify, remove; reads dist/packs.json
    interiors.ts     rooms you walk into (homes, the Adeniyi Eatery): size, fixtures, furniture slots, menu, hours; FURNITURE defs
    regions/         index.ts (REGIONS, findArea, regionOf, fareBetween, modeBetween, minutesBetween, boatsFrom), lagosState.ts,
                     abuja.ts, greaterAccra.ts, dubai.ts — areas you can ride between; hubs (airports) are reached by taxi. Each region
                     lists real-world fares and times (`routes`) and lagoon boats (`boats`, e.g. Badagry ↔ Lekki ferry)
    flights.ts       flight routes: price one-way/return, gate, budget estimates, where you land, papers line, `domestic` (ID card,
                     Nigeria map); chart 'coast' | 'longhaul' | 'nigeria' picks the in-flight map
    vehicles.ts      ownable vehicles (speed, effort, colour); dealers live in pack data (`pack.dealers`)
    index.ts         pack registry + lookups (getDestination, findItem, areaOfJob, formatMoney…)
  systems/           pure, unit-tested: economy, inventory, jobs (incl. tours), dialogue, negotiation, progress (goals/tips), life (needs incl. joy, skills, regard, shift scoring, resale), travel (trip budget, ticket → check-in → security → board → land), social (chat cooldown, gifts, friend discount, tier-ups), vehicles (own, ride, park, resell), collision (streets and rooms), clock (game time, phases, daylight, opening hours, sleep), requirements (job unlocks), repair (bench mini-game), careers (courier ranks), home (furniture slots, comfort, chest, valuation), events (showings, tickets)
  persistence/       SaveAdapter interface; IndexedDB / localStorage / memory adapters; SaveManager + migrations
  store/gameStore.ts Zustand store — the ONLY place money, inventory, jobs, travel and world progress change
  core/              per-frame runtime + input objects (live outside React), avatar presets, quality tiers, benchmark.ts (frame stats + 20 s benchmark)
src/scene/           React Three Fiber: static world builder (merged mesh + texture atlas), Player, CameraRig, Npcs, Traffic, Vehicles (bicycle model, parked bikes), Beacons, Collectibles, Systems, Sky (SkyDome + street lamps), Interior (rooms), Venues (show stages)
src/audio/           ambience.ts (Web Audio synthesis: traffic, crowd, horns, waves, chimes, effects — no files), music.ts (generated highlife-style band), useGameAudio.ts (area, ducking, effects, music intensity by place)
src/ui/              DOM UI over the canvas: hud/, panels/ (dialogue, shop + haggle), phone/, travel/, avatar/, shell/, icons/, theme.css
src/assets/splash/   cover-art SVGs for the title screen (characters, postcards, car, jet, globe, skyline);
                     regenerate with `python3 src/assets/splash/generate.py`
```

## Rules that must not break

- **Destinations are data.** New areas/cities = a new pack in `content/destinations/` + a registry line in `content/index.ts`. Don't hard-code area-specific behaviour in the engine, scene or UI.
- **Money only moves through the store via the wallet ledger.** Every credit has a transaction id (`job:<jobId>:<runId>`, `goal:<goalId>`, `flight:<routeId>:<ticketId>`, `repair:<id>:<runId>`, `buyhome:<id>:<n>`, `sellhome:<id>:<n>`, `ticket:<eventId>:d<day>` (one per showing), meal and ride/boat/shop ids). One wallet, in naira, everywhere; packs with `localCurrency` show the local price as a guide only. The wallet rejects duplicate ids — this is what stops repeat payouts. Keep that pattern for any new reward.
- **Flights.** A ticket is only used up when the plane lands (`completeFlight`), so reloading mid-flight leaves you at the gate with your ticket. Airport steps are driven by dialogue conditions (`trip`, `carryingLiquids`) and actions (`checkIn`, `security`, `board`, `openFlights`).
- **Saves.** `SAVE_SCHEMA_VERSION` is 8 (v4 added `life`; v5 added `travel` and turned `life.home` into `life.homes[]`; v6 added `life.social`, `life.vehicles`, `life.riding`; v7 added `world.time`; v8 added `world.inside`, `life.property` (tenure, furniture, chest), `needs.joy`, `life.wellRestedUntil`, and optional `world.tickets`/`world.meals`) (`persistence/types.ts`). `SaveManager` keeps a `backup` slot (written at most once a minute) and moves an unreadable main save to the `unreadable` slot instead of overwriting it; export/import go through `importJson`/`exportJson`. New optional `Settings` fields (sound) need no bump — `hydrate` merges `DEFAULT_SETTINGS`. Any change to `SaveData` needs a version bump plus a step in `migrate()` in `saveManager.ts`, and a unit test. The IndexedDB name and localStorage keys stay `'retriever'` (the project's old name) so existing players' saves keep loading — do not rename them.
- **Per-frame state stays out of React.** Positions, camera and input live in `core/runtime.ts` / `core/input.ts`; read them in `useFrame` or via refs. Don't put per-frame values in the Zustand store.
- **Budget Android first.** Art is procedural (no downloaded models/textures). The static world is merged into one vertex-coloured mesh + one atlas mesh; keep draw calls low. Shadows default off on touch devices. Movement integrates in fixed 1/30 s sub-steps.
- **City packs.** Only Lagos is in the base bundle. Anything that reads another city's content must make sure it is loaded (`ensureAreas`, `ensureForSave`, `useCityReady`); `getDestination` falls back to Yaba for an unloaded id. A new city = its packs + a `destinations/<city>Pack.ts` exporting the array + an entry in `CITY_PACKS` (the build lists `<city>Pack` chunks in `dist/packs.json`). Keep the `CITY_PACKS` index (event/home ids) in step — a unit test checks it.
- **Time.** `world.time` is game minutes since day 1 00:00; it advances in `tick` from real elapsed time (30 game min per real min) unless `?clock=paused` (playtests use it via `BASE_URL`; `daynight` uses `LIVE_URL`). NPCs with `hours` are only present inside them (`npcPresent`).
- **Content checks.** `systems.test.ts` loops over `ALL_PACKS` and checks that each arrival point is clear, every NPC is reachable, collect spots aren't inside props, and job, shop, item and dialogue references resolve. A new pack is covered automatically once it's registered (and added to `LAGOS_AREAS` or a future region file).
- **Original identity.** No copied protected assets, characters, logos or branding.
- **Safety.** Never commit secrets. No paid dependencies or services without the owner's approval. No destructive changes (deleting features, rewriting history, force-push) without approval. Offline: `public/sw.js` precaches every built file listed in `dist/precache.json` (written by the `precacheList` plugin in `vite.config.ts`); bump nothing by hand — the cache name comes from `__BUILD_ID__`. Never add a network call the game needs in order to run.

## Browser playtests (`playtests/`)

Playwright scripts that play the real game in Chromium and print PASS/FAIL per check (screenshots go to `qa-shots/`, gitignored).

```bash
npx playwright install chromium         # once per machine
npm run playtest                        # build, start vite preview on :4173, run all nineteen default suites (~45–75 min with software GL)
node playtests/run.mjs expansion        # one suite against an existing build (npm run build first)
node playtests/run.mjs avatar-gallery   # screenshots of avatar looks, no pass/fail
PLAYTEST_URL=http://localhost:5173/ node playtests/run.mjs regression   # against a running dev server
```

| Suite | Covers |
|---|---|
| `regression` (40 checks) | title, character creation, movement, camera, Jollof Run (pay once, no duplicate reward), shop, phone apps, pause, save + continue after refresh, mobile touch layout |
| `expansion` (34) | danfo travel to all five areas (fare charged once), beach clean-up collect job, landmarks, bargaining, goals paid once, tips (incl. the saving tip after the first pay), First flight fund progress in naira, messages, persistence, mobile travel |
| `life` (47) | needs drain, kitchen shift (pay, perfect tip, cooking XP/level-up, regard, staff meal), too-tired gate, no running when exhausted, bench rest, eating, sell-with-confirm, renting a room, sleeping, persistence of all of it — desktop and mobile |
| `city` (11) | traffic moves, keeps lanes, stops for a person in its lane, steers around the parked danfo; walkers stop to shop/wait/eat/chat/photo; draw-call and triangle budget; Ikeja traffic, Island/Lekki pedestrian-only |
| `device` (17) | offline: worker precaches every file, game opens/continues/saves with no network; graphics Low vs High (fewer vehicles, fewer draw calls/triangles, choice saved); A++ text on a 360px phone (no sideways scroll, kitchen buttons ≥ 44px) |
| `travel` (28) | trip budget adds up and blocks booking when short; return ticket with confirm, paid once; ticket survives reload; taxi to the airport; gate refuses before check-in; check-in; security stops bottled drinks; boarding, flight, landing in Osu; return ticket issued; "Wheels up" goal once; cedi guide prices; Accra taxi; flying home; history persists; mobile booking + flight fit (ticket money is topped up directly) |
| `lifestyle` (22) | bicycle: buy with confirm, paid once, ride (faster than walking), get off = parked where you stop, survives reload, auto-parks before a danfo, sell back for half with confirm; chat (+3, cooldown), gift a liked item (+8, leaves bag), tier-up text, friend price; eating animation; persistence; mobile ride/get-off by touch (bike money and one friendship level set directly) |
| `responsive` (56) | 320×640, 360×800, 390×844, 768×1024, 1024×768 (touch), 1366×768, 1920×1080: title, creation, HUD on screen without overlaps (incl. joystick), touch targets ≥ 44px, dialogue, shop and phone fit with no sideways scroll; phone rotation keeps player/camera/state |
| `resilience` (20) | no WebGL → explanation screen, existing save untouched; graphics rebuild ≠ false "paused"; real context loss → "Graphics paused" and recovery; backup restored when the main save is corrupt; unreadable save kept aside; export → wipe → import; non-save file refused; save failure warning; sound unlocks, follows the area, mute |
| `wardrobe` (14) | gender + look + name changes from the phone, saved across refresh, desktop and mobile |
| `daynight` (13) | live clock runs and shows on the HUD; noon brighter than night; street lamps; people leave at closing time and are back in the morning; sleeping wakes you next morning; clock persists |
| `work` (15) | repair bench locked until the Phone Run, then a session with a slip (fixed 3/3, no tip, paid once, skill); the tour: locked until the sights are found, guest follows, "Wait for me!", stops in order, paid once, guide goes home; courier rank bonus; careers card |
| `homes` (26) | furniture shop; rent; walk inside; walls; furnish (comfort 4, phone fit); solid new bed; sleep → next morning, well rested; storage chest; reload inside; leave by the door; buy (₦45,000 once) and sell (85%, belongings back); restaurant meal (paid once, joy); closed at night |
| `leisure` (21) | Events app; ticket with confirm, paid once, no double booking; Bookings; gate before showtime; music near the live stage, quiet away, off at volume 0; the show (time, joy, ticket used); Night out goal once; pay at the gate; missed show; 360px fit; low-joy tip; persistence |
| `performance` (9) | live fps in Settings; 20 s benchmark (camera turns, input off), real frame stats, verdict, apply the suggested tier, result persists, phone fit |
| `dubai` (17) | Dubai city pack loads for booking; honest visa note; ₦1,065,000 return paid once; kept offline on booking; check-in/gate lines name this flight (GC 571, gate A5, visa line); long-haul map; land at Dubai Creek; dirham guide prices; Spice Run paid once; rent and enter the creek studio; Creek Lights at the gate; reload in Dubai; fly home to Ikeja (ticket money topped up directly) |
| `badagry` (29) | danfo from Yaba (₦1,800 once), map pin, explorer goal needs all five areas; draw-call/triangle budget; Heritage Walk locked until the four sights are found, then led in order and paid once; Catch Run paid once + cooldown; buka; renting and entering the room by the marina; Heritage Drums in the Events app; walk out onto the jetty with the keys; board through Captain Ebi (Badagry) and Captain Tari / the landing (Lekki) like a danfo; the ferry to Lekki (₦3,000 once, boat on the map, land at the jetty) and back; reload; 360px fit |
| `abuja` (23) | Abuja city pack loads for booking; card says Domestic · ID card and is honest about the terminal; ₦270,000 return paid once; check-in asks for an ID card (not a passport) for GC 302, gate A2; Nigeria flight map; land in Wuse; draw-call budget; Pepper Run paid once; suya; Capital Walk locked then led in order and paid once; Suya Night in Events; rent and enter the Wuse studio; reload in Abuja; green taxi to the airport (₦12,000); fly home to Ikeja with the ID check (ticket money topped up directly) |
| `cities` (14) | Accra is a separate hashed pack not in the base download or precache; not downloaded when starting in Lagos; Download (hash-checked) → own cache → Check files; damaged file caught and repaired; offline (server stopped) an Osu save opens; Remove asks, frees, save intact; offline without Accra → clear message; back online it loads on demand |

Options: `PLAYTEST_DIST` is the build folder `device` and `cities` serve themselves (default `dist/`) — they stop that server to test real offline, because Playwright's `setOffline()` doesn't stop the service worker's own requests. `PLAYTEST_GPU=1` uses the real GPU instead of SwiftShader software GL, `PLAYTEST_HEADED=1` shows the browser, `PLAYTEST_OUT` sets the screenshot folder. With software GL the game runs at ~2–11 fps, so a full run takes 10+ minutes; checks wait on game state rather than fixed times where they can. The scripts drive the game through `window.__retreva = { store, runtime, saves }` (read state, teleport by setting `runtime.player.x/z`). When game text or flows change on purpose, update the matching check rather than the game. Real-device performance has not been measured yet.

## Status and next steps

Title screen (`ui/shell/TitleScreen.tsx`) is the game cover: art placed on a fixed design stage (1920×1080 landscape, 1080×2080 portrait, chosen by aspect ratio) scaled with container units (`--u`), with sky/skyline bleeding to the edges; the Start button has a CSS glass-sweep + sparkle (off under reduced motion). Keep `.wordmark` and the button texts — the playtests rely on them.

Done: Yaba street slice; gendered avatar creator + wardrobe; four Lagos State areas; danfo travel with fares; bargaining; delivery and collect jobs; 8 goals; tip cards, area banners, toasts; Messages and Travel phone apps; needs/kitchen shift/skills/regard/rest/renting a room/selling (save v4); traffic and purposeful walkers; graphics tiers; offline play; app icons + manifest; Lagos + Accra airports, flights with budgets, Osu (Accra) with waakye shift, kente job, crafts bargaining and a guesthouse (save v5); time of day + opening hours (v7); repair bench, tours, courier ranks; homes you walk into, furnish, store things in, buy and sell, a restaurant (v8); ticketed shows, Events/Bookings apps, joy; generated music; performance benchmark; Accra as an installable city pack; Dubai (Dubai Creek + airport) as a third destination and city pack, long-haul flights, Globetrotter goal; Abuja (Wuse + Nnamdi Azikiwe airport) as a fourth city pack with domestic flights from Lagos (ID card, Nigeria map; Pepper Run, Capital Walk, suya, crafts, Wuse studio, Suya Night, the Aso Rock view); Badagry, a fifth Lagos district on the lagoon (heritage walk, catch run, buka, crafts, room by the marina, Heritage Drums), the first of the Nigerian destinations (next: Calabar by domestic flight).

Characters (`scene/Character.tsx`): smooth sculpted primitives (lathed torso, capsule limbs, hands, shoes, face with lids/nose/lips), Phong material, two LODs (`near`/`far`, switched by distance in `Npcs.tsx`). Every person on screen costs five draw calls (body, two arms, two legs), so the walker/traffic count of a pack is what decides its draw-call budget — measure at the arrival point (the `badagry` suite does). Traffic (`scene/Traffic.tsx`) is data-driven via `pack.traffic`; state is mirrored in `runtime.traffic` for tests. Walker `stops` in pack data give pedestrians purposes.

Graphics tiers (`game/core/quality.ts`, `scene/useTier.ts`): Settings → Graphics (Auto/Low/Med/High) caps pixel ratio, antialiasing, shadows, vehicles, walkers, LOD distance and view distance. Auto picks Low for ≤3 GB memory or ≤4-core phones. The life playtest holds the kitchen order timer (it's wall-clock and software GL is slow).

Social: NPCs with `social: { lines, likes }` in pack data get "Chat a while" / "Give a gift" added to the node they open with (`DialoguePanel` → `socialNode`); chat replies use the transient node `'__social'`. Friend discounts apply through `store.priceAt` (shops, haggling start price, dealers).

Travel: fares and trip times are data — `routes` per region (danfo legs summed, ride-hailing to airports, 2025–26 estimates), `boats` between areas whose pack has a `dock` and a `jetty` spot (`openTravel('boat')`; you land at the `dock`); a ferry captain NPC with an `openTravel` `by: 'boat'` option gets the conductor's teal marker and map dot. Walkable rectangles must overlap where you cross from one to another (the player has to fit inside one at every step) — a unit test walks out along each jetty. A unit test requires every pair in a region to be priced. A pack can set `vista: 'north'` to leave that street end open (savanna, no closing buildings) so a far landmark shows — Wuse uses it for Aso Rock (`monolith` prop). Flights are real economy fares at about ₦1,332/$ (Lagos–Abuja ₦270,000 return (domestic), Lagos–Accra ₦450,000, Lagos–Dubai ₦1,065,000, October 2026); job, shift and repair pay was raised 25% at the same time, so a long trip is a real savings goal. New lives start with ₦5,000; the "First flight fund" goal (`money: true`, progress = wallet towards the cheapest return from Lagos (now Abuja), done once you can afford it or have flown) and the `save-up` tip after the first pay point players at it. Playtests top up ticket money as test setup.

Vehicles: `life.riding` is the uid you're on; `InteractionSystem` offers "Ride" near your parked vehicle and "Get off" while riding with nothing else in reach. `parkIfRiding()` runs before travel, boarding, shifts and resting. Animations: `CharacterAnim.pose` ('ride' | 'sit') and `eatUntil`.

Known gaps: performance on real phones is unmeasured — the in-game benchmark (Settings → Performance) is ready for it; the playtests use software GL at 2–10 fps. Offline install doesn't work inside the claude.ai artifact sandbox (registration fails silently there; the game still runs). Airports have no interior. Dubai's visa is folded into the ticket (said on the flight card). Interiors are cut-away rooms (the camera looks down over the walls).

Planned (from the blueprint): more destinations as city packs, airport interiors, more venues and weekly event schedules, real-device benchmark results, optional GLB assets via the asset pipeline (Blender scripts in `tools/blender/` are ready; Meshy is signed in but its free plan can't create tasks via the API — needs the owner's plan upgrade and approval). Making the opening screens global (choose a starting city) and applying the chosen logo ("Orbit R" direction) as app icon/favicon are also open.
