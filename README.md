# Retriever

A mobile-first, third-person 3D virtual-life and travel game. This is **Milestone 1: the first playable** — one Lagos street, one job, money, a bag, a phone and local saves.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (economy, jobs, inventory, dialogue, collision, saves)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

No account, server, API key or paid service is needed. Progress saves to IndexedDB on the device (falls back to localStorage).

## Controls

| | Desktop | Touch |
|---|---|---|
| Move | WASD / arrows | Left thumb (floating stick) |
| Run | Shift | Push the stick to the edge, or the run button |
| Look | Drag with the mouse | Right thumb drag |
| Interact | E / Enter, or click the prompt | Yellow action button |
| Reply in dialogue | 1–4 or click | Tap |
| Phone · Bag · Map | P · I · M | Phone button (top right) |
| Pause | Esc | Pause button |

## What's in the slice

Adeniyi Street (fictional) on the Lagos mainland: 14 buildings with painted facades and hand-painted signboards, a parked danfo, okadas, a kiosk, generators, rooftop water tanks, power lines, open drains, street trees and pedestrians.

- **Mama Titi** (buka owner) gives the **Jollof Run**: carry food to **Tunde** at the barbing salon within 60 s. ₦1,500, plus ₦500 if you make it in under 25 s. 20 s cooldown before it can be taken again.
- **Iya Bisi** sells provisions and souvenirs; **Mama Titi** sells food. Purchases go into the bag with where and for how much they were bought. Food and drink can be consumed.
- **Kunle** (danfo conductor) and **Chidi** (okada rider) add local colour and point toward the travel features to come.
- **Phone**: Map, Jobs, Bag, Wallet, Profile and Settings work. Messages, Travel, Events and Bookings are visible entry points, marked as coming later.

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
- **Assets are replaceable.** The low-poly characters and props come from builder functions keyed by `kind`; swapping in GLB models later means changing the builder, not the game logic or content.

## Saves and offline

The game needs no network after it loads: fonts are bundled, and there are no remote assets. Saves persist across refresh and reopen. It is **not yet an installable offline app** — there's no service worker, so a cold start without a connection won't load. That's planned for the PWA milestone.

## Next milestones (from the blueprint)

1. Lagos vertical slice: a home, more jobs, time of day
2. Avatar customisation (hair, clothing items, accessories)
3. Shops and negotiation (ask → offer → counter → deal)
4. Restaurant interior loop
5. Airport: taxi → check-in → security → gate
6. Flight experience
7. Accra arrival and hotel
