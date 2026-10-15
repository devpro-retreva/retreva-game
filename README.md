# Retreva

**Build a virtual lifestyle and travel to places of your dreams.**

A mobile-first, third-person 3D virtual-life and travel game for the browser. This build covers four areas of Lagos State, Lagos and Accra airports and Osu in Accra: jobs and shifts, needs, friendships, a bicycle you can own and ride, homes to rent, shopping and bargaining, flights with a trip budget, city soundscapes, offline play and local saves with backups.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (economy, jobs, inventory, dialogue, collision, saves)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run playtest   # build + browser playtests (run `npx playwright install chromium` once first)
```

The browser playtests in `playtests/` play the real game in headless Chromium — ten suites (regression, expansion, wardrobe, life, city, device, travel, lifestyle, responsive, resilience). See `CLAUDE.md` for what each covers and how to run them.

No account, server, API key or paid service is needed. Progress saves to IndexedDB on the device (falls back to localStorage).

## Controls

| | Desktop | Touch |
|---|---|---|
| Move | WASD / arrows | Left thumb (floating stick) |
| Run | Shift | Push the stick to the edge, or the run button |
| Look | Drag with the mouse | Right thumb drag |
| Interact (talk, ride, get off, rest, doors) | E / Enter, or click the prompt | Yellow action button |
| Reply in dialogue | 1–9 or click | Tap |
| Phone · Bag · Map | P · I · M | Phone button (top right) |
| Pause | Esc | Pause button |

## What you can do

- **Work:** delivery and collect jobs in every area (each pays once per run through the wallet ledger), and timed kitchen shifts at Mama Titi's (Yaba) and Auntie Akosua's waakye stall (Osu) that build a cooking skill.
- **Live:** energy and fullness fall as you move and work; eat from your bag (with an eating animation), rest on a bench (you sit on it) or rent a room and sleep. Homes in more than one city can be yours.
- **People:** named characters can be befriended — chat (once every few minutes), give gifts (things they like count more), and they move from Stranger → Acquaintance → Friend → Close friend. Friends text you and give 10–15% off at their shop.
- **Own a vehicle:** buy a city bicycle from Chidi in Yaba (₦8,000, confirm first), ride it (about twice walking speed, less tiring), get off anywhere and it stays parked there — across reloads and trips. Danfos, taxis and planes don't take bikes. Sell it back for half.
- **Shop:** fixed-price shops and market stalls with bargaining; sell eligible items back for half; Accra shops show the cedi equivalent beside the naira price.
- **Travel:** danfos between Lagos areas, a taxi to the airport, then flights to Accra with a full trip budget (taxi, ticket, stay, getting around), check-in, security (no bottled drinks), boarding and a short flight. A return ticket brings you home.
- **Goals and messages:** 9 goals paid once each, tip cards, discovery toasts and texts from people you meet.
- **Sound and music:** each area has its own synthesised soundscape (traffic, crowds, horns, waves, airport chimes) plus small effects, and original generated highlife-style music — a quiet radio in the street, warmer in the restaurant, the full band at a live stage. Separate ambience / effects / music volume and mute in Settings.
- **Time of day:** a game clock (30 game minutes per real minute) drives the sky, light and street lamps; shops and people keep opening hours and go home at night; sleeping takes you to the next morning.
- **More work:** Tobi's repair bench in Ikeja (put repair steps in order, unlocked by doing his Phone Run), guiding Sophie's tour of Lagos Island (she follows you on foot; unlocked by discovering the Island's sights), and courier ranks (Regular after 5 errands, Pro after 15) that pay more.
- **Homes:** walk into your room; furnish it with furniture from Okon Home in Yaba (comfort 4+ wakes you well rested); a storage chest; buy the room outright (₦45,000 in Yaba, ₦38,000 in Osu) and sell it later for 85%. Moving out or selling returns your furniture and stored things.
- **Leisure:** a sit-down restaurant (Adeniyi Eatery, Yaba) with opening hours; ticketed shows — Highlife on the Beach (Lekki, nightly), Glover Laughs (Lagos Island, every other night), Oxford Street Night Jam (Osu) — booked in the Events app or paid at the gate; Bookings lists tickets, your flight and your homes. A **joy** need: low joy tires you faster; shows, meals, chats, gifts, riding and a comfy home lift it.
- **Dubai:** fly Lagos → Dubai (₦95,000 one-way, ₦170,000 return; the visa is folded into the ticket as a game simplification) to Dubai Creek by Al Fahidi: Rashid's spice house (bargaining), Maryam's karak café shift, Chef Ngozi's Naija kitchen and the Spice Run between them, the Creek Lights night market, and a creek studio to rent or buy. Dirham prices shown as a guide. Globetrotter goal for visiting all three cities.
- **Cities:** Lagos is built in; Accra and Dubai are separate city packs that loads when you need it and can be kept on the device for offline play (Settings → Cities: download, check files, remove).
- **Performance:** Settings → Performance shows live fps, draw calls and device facts, and runs a 20-second benchmark (average fps, 1% low, frame-time spikes) with a suggested graphics tier; results can be copied to share.

## Areas

| Area | Setting | Work | Shopping |
|---|---|---|---|
| **Yaba** (home) | Adeniyi Street — bukas, barbers, danfos | Jollof Run, kitchen shift | Mama Titi, Iya Bisi, Chidi's Bicycles |
| **Lagos Island** | Balogun market lane | Bale Run | Alhaja Kudi's fabrics (bargaining) |
| **Lekki** | Atlantic beachfront | Beach Clean-up (collect 6) | Musa's coconut & corn, Ada's crafts |
| **Ikeja** | Computer Village gadget street | Phone Run | Chuka's Gadget Plug (bargaining) |
| **Lagos / Accra airports** | Terminal forecourt, glass terminal, airfield | Suitcase Dash | Airport shops |
| **Osu, Accra** | Oxford Street — chop bars, crafts, forex | Kente Run, waakye shift | Auntie Akos' Chop Bar, Sankofa Crafts (bargaining), guesthouse |
| **Dubai Creek** | Creekside promenade by Al Fahidi, water taxis | Spice Run, karak café shift | Al Fahidi Spice House (bargaining), Creek Karak Café, Chef Ngozi's Naija Kitchen, creek studio |

## Architecture

```
src/
  game/                      ← no React, no Three.js: pure game logic
    content/
      types.ts               destination pack schema
      destinations/lagos.ts  ALL Lagos content: buildings, signage, props, NPCs,
                             dialogue, shops, prices, items, the job
      index.ts               pack registry + lookups + money formatting
    systems/                 pure, unit-tested functions
      economy.ts             wallet + transaction ledger (duplicate tx ids rejected)
      inventory.ts           stacks with provenance (item, destination, price)
      jobs.ts                accept → active → deliver/fail → cooldown
      dialogue.ts            condition-driven entry nodes
      collision.ts           circle-vs-box world, wall/tree sliding, camera ray
    persistence/
      types.ts               SaveData + SaveAdapter interface
      adapters.ts            IndexedDB, localStorage fallback, memory (tests)
      saveManager.ts         serialised writes, revision counter, migration
      instance.ts            wires the store to the adapter
    store/gameStore.ts       Zustand: game state + actions (the only place money moves)
    core/                    per-frame runtime state and input (never triggers React renders)
  scene/                     React Three Fiber
    builders/                merges the static world into 1 mesh + 1 texture atlas
    Player, CameraRig, Npcs, Beacons, Lighting, Systems (interaction, game clock, autosave)
  ui/                        DOM UI over the canvas
    theme.css                design tokens + components ("Lagos signboard" system)
    hud/ panels/ phone/ controls/ shell/ icons/
```

### Key decisions

- **Rewards can't be duplicated.** A job completion produces a transaction id `job:<jobId>:<runId>`. The wallet refuses any id it has already applied, and the job leaves the active state in the same update. The save is written immediately after. Replaying the delivery — repeated clicks, re-opened dialogue, reloading the page — pays nothing. A future server can validate the same ids.
- **Destinations are data.** Accra, Abuja or Dubai should be a new file in `content/destinations/` plus a registry line: buildings, palette, signage, NPCs, dialogue, shops, prices and jobs. The engine reads the pack; it doesn't know it's Lagos.
- **Persistence sits behind `SaveAdapter`.** Saves carry `schemaVersion`, an incrementing `revision`, `updatedAt` and a `deviceId`, so a cloud adapter can detect conflicts rather than overwrite newer progress.
- **Built for budget Android.** No downloaded models or textures: everything is generated in code at load. The whole street draws in roughly 25–55 draw calls and ~10–13k triangles. Shadows are off by default on touch devices. Per-frame data (positions, camera, input) lives outside React; the HUD minimap updates via refs. Movement integrates in fixed sub-steps so slow frames don't slow the player or let them pass through props.
- **Assets are replaceable.** The low-poly characters and props come from builder functions keyed by `kind`; swapping in GLB models later means changing the builder, not the game logic or content. Every asset and its licence is listed in `docs/assets.md`.

## Saves and offline

- **Offline:** after one online visit a service worker has the base game (Lagos) cached; the game opens, continues and saves with no connection. Other cities are offline once downloaded in Settings → Cities (booking a flight downloads the destination too). Both are tested with the server actually stopped (`device`, `cities` suites).
- **Saves** go to IndexedDB (localStorage fallback) with a schema version and migrations (now v8). A **backup copy** is kept; if the main save can't be read, the backup is restored and the unreadable copy is kept aside — a new game never silently erases it. **Settings → Export save file / Import save file** gives a manual backup (and works from the title screen too). If saving starts failing (e.g. storage full) the game says so.
- **No WebGL?** A clear explanation screen instead of a blank page; if the GPU drops the context mid-game, "Graphics paused" appears and progress is saved.
- Clearing the browser's site data erases local progress unless you exported a save file. Saves don't sync between devices.

## Next milestones (from the V6 architecture, `docs/architecture-v6.md`)

1. Run the in-game benchmark on a real budget Android phone and an iPhone and record the numbers
2. More destinations as city packs
3. Airport interiors; more restaurants and venues; weekly event schedules
4. Optional GLB characters/props through the asset pipeline (Meshy/Blender need the owner's setup and approval)
