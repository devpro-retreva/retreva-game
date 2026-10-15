# Retreva Architecture V6 — Accessible Virtual-Life & Travel Simulator

**Purpose:** Current product and engineering blueprint for evolving the existing Retreva game. This version incorporates the latest decisions: hybrid open-world + life-sim UI, more human-looking 3D characters, living cities, offline-first play, persistent local saves, distinctive global destinations, and future sponsorship support.

## 1. Vision and identity

Retreva is a third-person virtual-life and travel simulator where players create an avatar, build a life, earn and manage money, acquire belongings, develop relationships, explore distinctive cities, and travel when they can afford it.

It should feel like a connected virtual life—not a static street demo, repetitive task loop, clone of another game, or generic dashboard. Players should be inspired to imagine and build a life they dream of, while the game remains playable on affordable devices.

### Core principles
- **Offline-first:** Core gameplay and local saves work without internet after required content is installed.
- **Accessible:** Responsive UI, touch-first controls, optimized assets, adjustable graphics, and support for a range of devices.
- **One persistent life:** Money, inventory, avatar, vehicles, property, relationships, jobs, and travel history persist across sessions and destinations.
- **Hybrid gameplay:** Free third-person movement and exploration, combined with polished contextual interfaces for shopping, inventory, dialogue, property, travel, and finances.
- **Living world:** Purposeful NPC routines, traffic, functional shops, jobs, leisure, and events.
- **Distinct places:** Every city has its own architecture, ambience, local activities, NPC profiles, music/audio, prices, and points of interest. Avoid superficial reskins and cultural stereotypes.
- **Original identity:** Use broad genre inspiration only; do not copy commercial games’ maps, UI, characters, or assets.
- **Incremental delivery:** Preserve working systems, test every milestone, and avoid rebuilding the project unnecessarily.

## 2. Core player loop

**Create avatar → explore → meet people → work or pursue opportunities → earn → save/spend → acquire belongings and property → build relationships and lifestyle → plan travel → journey → explore another destination → return or extend the stay.**

A player can pursue different lifestyles: career growth, modest living, luxury collecting, family life, social life, or travel. Spending should have consequences. If a player runs out of money, provide a fair recovery path—temporary work, low-cost activities, safe rest, or a way to return home—rather than a softlock.

## 3. Meaningful activities

Activities must have different mechanics and outcomes, not simply renamed versions of the same tap-to-earn task.

- **Jobs and careers:** different job types, shifts, skill requirements, progression, reputation, and pay.
- **Daily needs:** food, drinks, rest, clothing, and home life.
- **Shopping:** browse menus/catalogues, compare prices, purchase goods, equip/use/store them, and resell eligible items.
- **Social life:** greetings, dialogue choices, friendship, invitations, relationship progression, and consequences.
- **Property:** rent or buy homes, personalize/furnish them, store belongings, and sell with a clear valuation and confirmation.
- **Vehicles:** acquire, own, enter, drive, exit, park, and sell vehicles; add fuel/maintenance only if fully supported.
- **Leisure:** restaurants, beaches, parks, cinemas, concerts, festivals, tourist sites, and ticketed events.
- **Travel:** compare ticket and lodging costs, budget for a trip, travel through a transport hub, arrive, and explore.
- **Emergent opportunities:** job offers, discounts, social invitations, events, unexpected costs, and optional challenges.

For every activity define: requirements, interaction, time/cost, reward, effects on player state, save behavior, and input/accessibility support.

## 4. Human-looking avatar and animation

Upgrade the current character from a flat or obviously game-placeholder appearance toward **stylized realism**: recognizably human proportions, dimensional face and body, natural materials, good lighting, and smooth animation—without chasing expensive photorealism.

- Audit the current character model, rig, materials, animation controller, and camera before replacing anything.
- Support a broad range of skin tones, face/body presets, hairstyles, clothing, and accessories. The customization must match the assets actually available.
- Include culturally and geographically varied NPCs across destinations. No destination should contain only one race or one stereotyped appearance.
- Use a consistent rig and reusable animations: idle, walk, run, turn, interact, sit, eat, shop, enter/exit vehicles, and other supported actions.
- Favor optimized stylized-realistic or low-poly human models with good silhouettes and materials.
- Use LODs, texture atlases/compression, sensible polygon budgets, shared materials, and animation reuse.
- Preserve the existing smooth movement and camera; regression-test them after visual changes.
- Do not claim near-photorealism unless it is actually achieved and verified.

## 5. Living cities and world simulation

### City content packs
Each city module should describe:
- Unique landmarks, architecture, street layout, signs, lighting, weather, ambient audio, and local visual identity.
- Districts and points of interest: homes, workplaces, shops, restaurants, parks, attractions, transit hubs, and event venues.
- Local NPC profiles, dialogue, schedules, services, and activity availability.
- Transport options, fares, price ranges, event calendars, and destination-specific content.
- A manifest listing assets, dependencies, version, approximate download size, and offline availability.

Strengthen existing Lagos locations first. Add Accra or other destinations as separate content packs when the core loop is stable. Future cities might include Abuja, Dubai, London, Toronto, or New York, but each should feel researched and distinctive rather than like a reskin.

### Traffic and NPC behavior
- Add moving vehicles using simple road paths and bounded behavior; implement intersections and signals only where feasible.
- Give NPCs purposes: commuting, shopping, waiting, working, eating, relaxing, or attending events.
- Use distance-based activation: detailed behavior near the player, simplified behavior farther away, and no unnecessary simulation outside the active area.
- Spawn/despawn distant NPCs and traffic safely; cap active counts on low-end devices.
- Provide reduced traffic/effects settings if needed.
- Ensure decorative AI does not overwhelm CPU, memory, battery, or frame time.

### Interaction framework
Use one consistent system for NPCs, shops, doors, seats, vehicles, jobs, homes, ticket desks, and attractions.
- Show contextual prompts in range.
- Support touch, keyboard, and existing controller inputs.
- Provide short dialogue choices or compact contextual panels.
- Allow cancel/close and preserve camera control.
- Make touch targets readable and easy to hit.
- Every interaction should produce a visible result and update game state.

## 6. Economy, inventory, and ownership

Use one in-game wallet across all destinations.
- Record income and expenses in a transaction ledger.
- Show quoted prices and confirm expensive or irreversible actions.
- Keep local prices, job rewards, ticket fares, and lodging costs in configuration/data—not scattered UI code.
- Support buying, owning, using/equipping, storing, and selling eligible goods.
- Support vehicle and property ownership; sale screens must show estimated proceeds and consequences.
- Save purchases and sales safely to prevent duplicated transactions or lost balances after reload.
- Add a balanced recovery route for players with no money.
- For the initial release, all currency is virtual and earned/spent locally. Real-money currency purchases are explicitly **future scope** and must not be simulated as real payments.

## 7. Travel experience

Travel should feel like a journey, not just selecting a city from a menu.
- Show destination, estimated ticket, local transport, lodging, and total budget.
- Make costs differ by destination using configurable data.
- Implement affordability checks, ticket purchase, departure/arrival states, travel history, and arrival into the destination module.
- Build the journey in stages: ride to airport, check-in, boarding, a lightweight flight sequence, arrival, then hotel/local transport. Prioritize a polished, feasible slice rather than fake nonfunctional steps.
- Let players extend a stay if they can earn/obtain enough money; otherwise offer fair cost-saving or return options.
- Downloaded city packs remain usable offline.

## 8. UI/UX: hybrid open-world + life sim

The world remains the focus during exploration. Use a minimal HUD and contextual prompts, with richer interfaces opening only when needed.

- Minimal HUD: wallet, essential status, and interaction hint.
- Compact in-world phone or quick menu for map, inventory, messages, travel, profile, and settings where appropriate.
- Polished typography, iconography, spacing, contrast, transitions, and animation timing.
- Avoid permanent oversized panels, generic admin-dashboard styling, clutter, and excessive overlays.
- Responsive layouts for phone, tablet, and desktop viewport sizes; account for notches/safe areas.
- Touch controls with comfortable joystick/action targets; retain keyboard/mouse controls where supported.
- Add text scaling, audio controls, graphics settings, camera sensitivity, and reduced camera shake where feasible.
- Never convey essential information through color alone.

## 9. Offline-first saves and future synchronization

### Local saves now
The installed game must not need a server to start or play its offline-capable core loop. Existing browser reload persistence is working according to the project owner; **preserve it and regression-test it before changing storage**.

Persist versioned profile data: avatar, settings, wallet/ledger, inventory, homes, vehicles, relationships, jobs/skills, visited cities, and travel state.
- Save at meaningful state changes and safe checkpoints, not every frame.
- Use schema versioning/migrations and atomic writes/backups where supported.
- Test fresh start, save, reload, browser restart, offline use, and old-save compatibility.
- Never silently erase existing progress.

### City packs
- Each pack has a manifest, version, assets, dependencies, and estimated size.
- Download/install and verify content while online; indicate which destinations are installed and available offline.
- Keep initial install compact and allow optional destinations to be installed later.
- Removing a city pack must not delete the player's wallet, possessions, or profile; warn before removing content needed for that city.

### Cloud sync later
Local saves and cloud sync are different capabilities. Cross-device sync needs connectivity when transferring data, but local play should remain available offline.
- Design a future sync adapter boundary without requiring a server for the MVP.
- Add authentication, upload/download, conflict handling, and recovery only after local saves are reliable.
- Never blindly merge conflicting money balances or duplicate item purchases. Use versioned transactions and deterministic conflict rules.
- Clearly explain that progress from another device updates after reconnecting and syncing.
- Keep account identity separate from the local save.

## 10. Music, ambience, and cultural identity

Each destination should have its own respectful soundscape: street ambience, transport, crowds, shops, nature, local environmental sounds, and optional music.
- Use original, commissioned, or properly licensed music/audio; maintain an asset/license inventory.
- Make music, ambience, and effects separately adjustable and allow mute.
- Stream or load audio efficiently; avoid bundling huge audio files into the initial download.
- Treat cultural detail as researched, locally grounded content—not stereotypes.
- Keep city audio packs optional where possible so offline storage remains manageable.

## 11. Future sponsored billboards and storefront advertising

Support a future system for brand partnerships without making it a dependency of the current game.
- Represent billboards, posters, shop signs, and sponsored events as configurable world placements.
- Later, an authenticated admin dashboard may manage advertiser, city/placement, creative asset, campaign dates, approval state, and reporting.
- Validate assets and dimensions, moderate content, audit admin changes, and provide campaign start/end dates.
- Separate sponsored placements from ordinary fictional storefronts; do not imply a real brand has partnered unless authorized.
- Offline players should see cached approved campaign creative or neutral in-world signage. Core gameplay must not require an ad request.
- Sponsorship and admin dashboard are future scope; do not build backend infrastructure now unless separately approved.

## 12. Performance and device support

Profile on real devices. Set measurable targets instead of assuming a feature is lightweight.
- Aim for stable 30 FPS on representative low-end phones where 60 FPS is not sustainable.
- Provide low/medium/high graphics settings where supported.
- Limit dynamic lights, shadows, particles, post-processing, transparent layers, draw calls, and active AI on low settings.
- Optimize geometry, textures, audio, animation, physics, and memory use.
- Use LODs, culling, simplified collision, active-area simulation, and asset streaming.
- Track startup time, download size, memory, frame-time spikes, battery/heat, and save reliability.
- Test the oldest practical target device and document limitations honestly.

## 13. Modular engineering boundaries

Adapt to the existing stack; do not force a rewrite.
- Presentation: HUD, menus, prompts, inventory, map, phone, settings.
- Domain/game state: player profile, wallet, ledger, inventory, property, vehicles, relationships, jobs, travel.
- Simulation: character controller, camera, NPCs, traffic, interactions, time/events.
- World/content: city manifests, points of interest, dialogue, prices, activities, events, asset references.
- Persistence: local save repository, schema migration, backup/recovery.
- Content delivery: city-pack manifest, install/verify, storage management.
- Future sync boundary: authentication and conflict handling, disabled/not required for MVP.
- Future sponsorship boundary: campaign configuration and admin tooling.
- Platform/performance: input adapters, capability detection, quality settings, diagnostics.

Keep modules typed and testable. City-specific content should be data-driven where practical. Avoid one monolithic component mixing rendering, economy, save files, and dialogue. Do not add dependencies without a demonstrated need.

## 14. Delivery roadmap

### Phase 0 — Audit and stabilize
Inspect the actual repository, current renderer, assets, controls, city modules, save system, and tests. Run the app/build/tests first. Record working, partial, broken, and missing features. Preserve working code and create a safe checkpoint.

### Phase 1 — Make the life loop engaging
Add distinct activities, connect rewards to persistent state, add ledger and purchases/sales, and provide a low-money recovery route. Test save/reload.

### Phase 2 — Human character and living city
Improve the avatar using stylized realism; preserve movement/camera. Add bounded traffic, purposeful NPC routines, and functional shop/restaurant/job/leisure points. Profile performance.

### Phase 3 — Lifestyle progression
Add inventory depth, vehicle ownership/driving, home ownership/rental and personalization, social activities, and more varied jobs. Persist belongings.

### Phase 4 — Travel slice
Add transparent destination budgets, ticket purchase, transport/arrival, and access to another existing city pack.

### Phase 5 — Offline and release readiness
Test offline sessions, saves, migration, phone sizes, touch targets, graphics tiers, performance, onboarding, pause/settings, error handling, and recovery paths.

### Phase 6 — Later business features
Only after the core game is stable: cloud accounts/sync, secure real-money payments for virtual currency if approved, sponsorship inventory, and admin dashboard.

## 15. Definition of done

A feature is complete only when it is implemented, connected to game state, tested, and usable in the running game. Test:
- Start/save/quit/reload and verify state persists.
- Earn/spend/sell and verify ledger and ownership.
- Cancel interactions and test touch/keyboard controls.
- Run out of money and recover without softlock.
- Change cities and verify profile/belongings persist.
- Launch and play offline after assets are installed.
- Test missing/corrupt city pack handling.
- Resize viewport and check layout, safe areas, text, and controls.
- Test low graphics in a busy scene and measure performance.
- Confirm online services are not required for local play.

Claude Code reports must separate: **implemented**, **tested and passed**, **partially working**, and **not implemented**. Never claim success from a mockup or generated code alone.

## Immediate direction

Use the companion `Retreva_claude_code_update_prompt.md`. Have Claude inspect and test the current repository first, preserve the working save system and smooth controls, then implement a small, complete, high-impact vertical slice.


## 16. Web-first responsive and installable experience

Retreva remains a browser game for this milestone. Do not migrate to a native app or replace the current renderer without evidence that the existing stack cannot meet requirements.

### Device and viewport support
- Support phones, tablets, laptops, and desktop monitors across Android, iOS/iPadOS, Windows, macOS, and Linux browsers where the current renderer is supported.
- Make the UI usable from a minimum viewport width of 320 CSS pixels upward; prevent clipped controls, overlapping HUD elements, and accidental horizontal scrolling.
- Reflow panels and menus by available space, not by device brand alone. Test portrait and landscape.
- Respect safe-area insets on notched devices and dynamic browser viewport changes.
- Support touch and pointer input alongside existing keyboard/mouse controls. Use touch targets around 44 CSS pixels where practical, clear pressed states, and controls that do not cover important gameplay.
- Keep text readable, provide accessible contrast, avoid color-only instructions, and support reduced motion where practical.
- Keep gameplay camera and movement smooth during viewport/orientation changes. Do not let UI scaling change the character's world scale or physics.

### Responsive 3D rendering
- Detect capabilities conservatively and start with a safe quality tier; allow players to override it.
- Scale pixel ratio, render resolution, shadow quality, post-processing, particles, active NPCs, traffic, and view distance based on performance and settings.
- Keep a stable low-quality fallback for constrained mobile GPUs; avoid expensive effects by default on low-end devices.
- Use compressed, appropriately sized textures, mesh LODs, frustum/occlusion culling where supported, shared materials, instancing where appropriate, and distance-based simulation.
- Load only the current area and essential assets initially. Load optional destination packs and high-resolution variants on demand.
- Provide a clear loading/error state and fallback when WebGL or an asset is unavailable. Never silently replace a missing realistic model with a misleading placeholder while reporting success.

### Offline and PWA behavior
- Investigate Progressive Web App support and service-worker caching only if compatible with the current build system.
- Cache the app shell and essential assets; make the offline status and optional destination availability clear.
- Do not cache unbounded asset libraries or assume every city pack fits on every phone.
- Keep gameplay and local saves available offline after required assets are installed. A first-time download, account login, cloud sync, or remote generation may require internet.
- Preserve the existing save format and test reloads, browser restarts, offline launches, storage-quota handling, and migration before changing persistence.
- Explain that clearing browser storage may remove local progress unless export/backup exists. Do not imply local browser saves automatically sync between devices.

### Responsive test matrix and measurable outcomes
Test at least 320×640, 360×800, 390×844, 768×1024, 1024×768, 1366×768, and 1920×1080 CSS pixels, plus real-device checks on representative Android and iOS hardware when available.
- Test portrait/landscape changes, keyboard/mouse, touch, browser zoom, safe areas, and menu open/close behavior.
- Measure startup and first-play load time, initial download size, frame-time/FPS, memory, thermal/battery behavior where measurable, and save success.
- Target stable 30 FPS on representative low-end phones as a practical starting goal; report actual results and limitations rather than claiming universal performance.
- Treat 60 FPS as a quality goal on capable devices, not a universal guarantee.

## 17. 3D asset tools, MCPs, and agent skills

These are development-time tools; they must not become runtime dependencies of the shipped browser game.

### Recommended asset pipeline
1. **Meshy official MCP** — primary optional integration for text/image-to-3D generation and available texturing/rigging workflows. Official references:
   - https://www.meshy.ai/mcp
   - https://docs.meshy.ai/en/api/ai
   - https://github.com/meshy-dev/meshy-mcp-server
   It requires Node.js 18+ and a Meshy API key; generation consumes account credits and may require a paid plan. Keep the key out of source control, prompts, logs, and shared screenshots. Do not claim it is connected until Claude Code verifies it with `/mcp`.
2. **Blender + community Blender MCP** — optional local asset cleanup, material editing, scene inspection, and export. References:
   - https://www.blender.org/
   - https://github.com/Blanceone/blender-mcp
   Blender MCP is community-maintained, not an official Meshy product. It can execute Python inside Blender, so inspect the project and install instructions, keep it local to a trusted machine, and do not expose its socket/server to the public internet. Install the Blender add-on and start its local MCP server only when needed.
3. **Mixamo** — optional browser-based source for humanoid animations when compatible with the chosen rig. It is not an MCP server. Verify current terms and each asset's licensing before commercial release: https://www.mixamo.com/
4. **Meshy 3D agent skill** — optional alternative workflow from https://github.com/meshy-dev/meshy-3d-agent. It can call the Meshy API directly and is not required if the Meshy MCP workflow already works. Avoid installing overlapping workflows unless they add value.

### Asset acceptance checklist
- Generate one test human and one small Lagos environment asset before bulk production.
- Confirm the model's topology, scale, orientation, UVs, material count, texture size, rig, animation compatibility, and visual quality.
- Export to a browser-friendly format supported by the existing stack, normally GLB/glTF if compatible.
- Check license/usage rights and retain source URL, creator, generation date, and license notes in an asset manifest.
- Optimize and validate the asset in Blender or the existing pipeline; then test it in the actual game on desktop and mobile quality tiers.
- Use LODs, compressed textures, reasonable polygon counts, shared materials, and reusable animation clips. Keep source/high-resolution masters separate from shipped runtime assets.
- Do not download, generate, overwrite, or import large batches without first testing a single asset. Do not spend paid credits without the owner approving the asset-generation plan.
- AI-generated 3D assets are drafts; inspect deformation, facial quality, topology, normals, UVs, materials, and animation before acceptance.

### Claude Code skills
Use small project-local Agent Skills to make repeated workflows consistent. Recommended custom skills are:
- `Retreva-responsive-web3d`: responsive browser UI, input modes, WebGL capability checks, adaptive quality, and offline/PWA constraints.
- `Retreva-3d-asset-pipeline`: generate/import/validate/optimize a single asset and document its license and performance cost.
- `Retreva-regression-qa`: run existing checks and validate movement, camera, saves, offline play, touch controls, and viewport sizes after changes.

Install these under `.claude/skills/<skill-name>/SKILL.md` in the Retreva repository. Skills guide behavior; they do not replace tests or provide tools by themselves. MCP servers provide callable tools; install only those needed for the next task.
