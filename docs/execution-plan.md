# RETREVA — EXECUTE THE CURRENT DEVELOPMENT PLAN

Act as a senior game architect, gameplay engineer, 3D technical artist, performance engineer, and QA lead. Your task is to implement the current Retreva development plan directly in this existing codebase, using the updated architecture, engineering specification, and development instructions as the source of truth.

**IMPORTANT: Do not change the project name, rename the project, or perform any name-correction tasks.** Preserve all existing project naming, configuration, identifiers, and branding. Focus exclusively on improving and completing the game.

## 1. Audit the Existing Project First

Before modifying anything:

- Inspect the repository structure, framework, rendering engine, existing gameplay systems, assets, dependencies, and scripts.
- Read the updated architecture document, engineering specification, Claude Code update prompt, and relevant project skills if they are available in the repository or supplied workspace.
- Identify what is already implemented, what is incomplete, and what is broken.
- Run the existing tests and build to establish a baseline.
- Create a prioritized implementation plan based on the actual codebase.
- Do not invent requirements or replace existing systems simply because a new implementation would be easier.

If essential architecture files are unavailable, report which files are missing and continue only with work supported by the existing code and available specifications.

## 2. Preserve and Improve Existing Functionality

Keep the existing movement, camera, city content, interactions, and local save/load functionality working.

- Do not unnecessarily rewrite the project or replace its current framework.
- Fix underlying architectural problems instead of adding disconnected demonstrations.
- Preserve working features and existing player progress.
- Use modular, maintainable systems that can support future cities, activities, characters, assets, and gameplay features.
- Avoid introducing unnecessary dependencies, paid services, or complex infrastructure.

## 3. Improve Character and 3D World Quality

Improve the game’s visual quality while maintaining acceptable performance on affordable Android phones, iPhones, tablets, and desktop browsers.

Prioritize:

- More natural human proportions, faces, skin tones, hairstyles, clothing, materials, and animations.
- Diverse, believable NPCs with consistent visual quality.
- Better lighting, shadows, materials, vegetation, roads, buildings, interiors, and environmental details.
- Smooth character movement, animation blending, collision, camera behavior, and interaction feedback.
- Authentic city environments with distinctive architecture, culture, soundscapes, activities, and visual identity.

Use free and low-cost tools first. Consider Blender, the community Blender MCP, MB-Lab or MakeHuman, Poly Haven, ambientCG, and Mixamo where appropriate and compatible with the project.

Meshy or other paid or credit-based services are optional, not mandatory. Verify current setup instructions, dependencies, licensing, and costs before using them. Never expose API keys or spend paid credits without explicit approval.

Do not install every available tool. Select only tools that solve an identified problem. If an MCP server is not configured, explain the setup requirements rather than pretending it is connected.

Build and test one representative human character and one representative city asset before scaling the asset pipeline. Validate geometry, scale, materials, textures, rigging, animations, licensing, and browser performance before integrating assets into the game.

## 4. Make the Game Responsive and Offline-First

Ensure the browser game works across mobile phones, tablets, and desktops, starting at approximately 320 CSS pixels wide.

Implement or improve:

- Responsive HUD, menus, inventory, dialogs, maps, and life-simulation interfaces.
- Touch controls for mobile and keyboard/mouse controls for desktop.
- Safe-area handling, readable text, appropriately sized buttons, and adaptive layouts.
- Adaptive graphics quality, texture resolution, draw distance, shadows, and other expensive rendering features.
- Local save/load that survives browser reloads and handles save-version changes safely.
- Offline operation after the required game content and assets have been installed.
- A suitable service-worker/PWA strategy if compatible with the existing architecture.
- Clear loading, offline, save-error, and recovery states.

Do not claim offline support is complete unless you have verified it by loading the game, installing the required assets, disconnecting the network, and testing the relevant gameplay and persistence flows.

Use the architecture’s performance targets as goals and measure actual results. Aim for approximately 30 FPS on supported low-end devices where practical, without sacrificing stability to meet an arbitrary number.

Test at these viewport sizes: 320×640, 360×800, 390×844, 768×1024, 1024×768, 1366×768, and 1920×1080.

## 5. Turn the Demo Into a Connected Life Simulation

The game must feel like a living world rather than a static collection of streets and menus.

Audit and connect the existing systems so the player can meaningfully:

- Explore the city and enter available buildings or locations.
- Interact with NPCs and discover useful activities.
- Earn and spend in-game money.
- Purchase and use food, items, clothing, and other supported inventory objects.
- Visit functional shops, restaurants, parks, beaches, cinemas, and events where supported by the existing content.
- Access jobs or other money-earning activities.
- Develop friendships and relationships through meaningful interactions.
- Acquire, use, and manage supported vehicles, housing, and furnishings.
- Manage needs, inventory, finances, and daily activities through clear interfaces.
- Save progress and resume the experience without losing important state.

Prioritize a complete, connected gameplay loop over adding many unfinished features. For example:

**Explore → Discover an activity → Interact or work → Earn money → Buy something useful → Improve the player’s lifestyle → Save progress → Return and continue.**

NPCs should have believable behavior, movement, schedules, and reactions appropriate to the scope of the game. Shops and activities should have functional interactions and consequences rather than merely displaying decorative UI.

Where a feature does not yet exist, implement a small, complete, testable version that fits the architecture. Clearly identify any feature that remains a placeholder.

## 6. Improve Travel and City Authenticity

Make travel a meaningful part of the experience, not simply an instant teleport between identical environments.

Within the scope of the existing architecture, connect the relevant stages:

- Travel planning and affordability.
- Departure and airport interactions where implemented.
- Journey or flight presentation.
- Arrival, local transportation, accommodation, and city exploration where supported.
- Destination-specific activities and costs.

Improve the existing Lagos content first, then establish a reusable framework for destinations such as Accra and Dubai.

Each destination should have its own visual identity, architecture, NPC behavior, prices, activities, and environmental atmosphere. Avoid stereotypes, repetitive reskins, and generic buildings presented as authentic landmarks.

Do not fabricate a complete travel experience if the required systems or assets do not exist. Build it incrementally, reuse shared systems appropriately, and document what remains to be completed.

## 7. Create a Reliable 3D Asset and Development Workflow

Organize assets and systems so that new characters, buildings, vehicles, interiors, and destination content can be added without breaking existing gameplay.

Where useful, create or update focused Claude Code skills for:

- Responsive browser-based 3D development.
- 3D asset creation, optimization, integration, and licensing checks.
- Regression testing and performance validation.

Only create or modify skills that are genuinely useful to this repository. Follow the installed Claude Code skill format and avoid duplicating existing capabilities.

Use deterministic, repeatable workflows where practical. Record asset sources, licenses, formats, optimization settings, and integration requirements.

## 8. Exclude Future Backend Features From This Execution

Keep the game ready for future expansion, but do not implement paid backend infrastructure unless it is already required by the existing architecture.

For this execution, do not introduce unnecessary:

- Account registration or authentication services.
- Cloud synchronization.
- Real-money payments or virtual-currency purchasing.
- Sponsored advertising systems or brand integrations.
- Administrative dashboards.
- Always-online dependencies.

These are future capabilities. The current priority is a strong local, offline-first gameplay experience.

## 9. Execute the Work in Prioritized Stages

After the initial audit, proceed through the following stages:

**Stage A — Stabilize:** Fix existing build errors, broken interactions, persistence problems, and regressions.

**Stage B — Foundation:** Improve architecture where necessary, responsive layouts, mobile controls, offline asset handling, and save reliability.

**Stage C — Visual Quality:** Improve representative human characters, animations, materials, environments, and the repeatable 3D asset workflow.

**Stage D — Gameplay:** Connect money, inventory, interactions, activities, NPC behavior, shops, lifestyle systems, and player progression into a coherent loop.

**Stage E — World and Travel:** Improve Lagos and make the existing destination and travel systems more immersive and extensible.

**Stage F — Verification:** Run automated tests, build checks, browser tests, responsive checks, offline tests, and regression tests.

Adapt this order if the audit reveals dependencies that require a different sequence. Complete and verify foundational work before expanding into more ambitious features.

## 10. Quality and Safety Requirements

- Inspect the actual repository before choosing an implementation.
- Follow the existing framework and coding conventions.
- Keep changes focused, modular, and maintainable.
- Do not replace real gameplay with mock data or decorative controls.
- Do not leave buttons or interfaces that imply functionality but do nothing.
- Do not silently remove existing features.
- Do not commit secrets, expose API keys, or introduce unreviewed external scripts.
- Avoid unlicensed assets and verify relevant usage terms.
- Do not claim a feature, test, performance target, or offline capability works unless it has been verified.
- If browser automation or a required MCP is unavailable, use the best available alternative and explicitly disclose the limitation.
- Run the relevant tests after each significant change.
- Fix regressions introduced by your modifications before moving on.
- Update the project documentation to reflect the actual implementation, commands, limitations, and remaining work.
- Do not modify the project name or perform renaming tasks.

## 11. Final Acceptance Criteria

The work is successful when the repository has measurably improved and:

1. The existing project builds and its relevant tests pass.
2. Existing movement, camera behavior, and local save/load remain functional.
3. The game layout and controls adapt to supported phone, tablet, and desktop sizes.
4. The offline experience works for installed content and survives reloads.
5. At least one representative visual or character improvement has been integrated and verified in the actual game.
6. The core gameplay loop contains connected, functional interactions rather than disconnected demonstrations.
7. Existing Lagos content feels more active and offers meaningful player activities.
8. Performance and major regressions have been measured and documented.
9. New systems and assets are organized for future expansion.
10. Documentation distinguishes implemented features, tested features, known limitations, and future work.

## 12. Required Final Report

When finished, provide a concise but specific report containing:

- What you discovered during the initial audit.
- What you implemented, grouped by stage.
- Which files and systems changed.
- The tests and build commands you ran, with actual results.
- Responsive, performance, and offline verification results.
- Any tools or MCP servers that still require setup.
- Any paid services or external dependencies that would require approval.
- Known bugs, incomplete features, and the next highest-priority tasks.

**Begin by auditing the repository and reading the available project specifications. Then implement the highest-priority changes directly in the codebase. Do not stop after producing a plan, and do not rewrite the project wholesale. Work incrementally, verify your changes, and continue until the available time or environment imposes a real limitation.**