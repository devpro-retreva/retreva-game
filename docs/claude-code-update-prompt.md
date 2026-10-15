# Retreva — Claude Code Update Prompt (Architecture V6)

You are the senior gameplay engineer, technical architect, performance engineer, and QA lead for Retreva, an existing virtual-life and travel simulation game.

Read `Retreva_architecture_v6_accessible_life_sim.md` fully before editing. The project already has working gameplay, several Lagos locations, smooth movement/camera, and browser reload persistence according to the owner. **Do not assume this is a blank project. Do not blindly rewrite it.**

## Goal

Evolve Retreva from a promising demo into a distinctive, connected virtual-life and travel game: a hybrid of open-world third-person exploration and polished life-sim interfaces. Players should be able to create a more human-looking personalized avatar, explore living cities, interact with diverse NPCs, do varied activities, earn/spend money, own and sell belongings, build relationships, and travel when they can afford it.

Offline local play and saves are a core requirement. Support affordable devices through optimized assets and adjustable graphics. Accounts, online backend, cross-device sync, real-money virtual-currency purchases, sponsorship campaigns, and admin dashboard are later phases—not prerequisites for this update.

## First: audit the actual project

1. Inspect the repository structure, framework/engine, renderer, asset pipeline, controls, city data, save/persistence mechanism, and available tests.
2. Run the existing app, build, lint/type checks, and tests where available **before** editing. Report baseline failures.
3. Create a feature matrix: working, partly working, broken, absent.
4. Identify reusable code and assets. Preserve current city environments, smooth movement, camera behavior, and reload persistence unless a verified bug requires a change.
5. Create a safe checkpoint/branch if supported. Do not delete user work or overwrite assets without a clear reason.
6. Propose a short, ranked plan based on player impact, risk, and performance cost.

Do not migrate frameworks or add major dependencies unless the current technology cannot reasonably support the feature. Explain any genuine conflict and use the smallest compatible solution.

## Priorities

### 1. Make gameplay less repetitive
Implement distinct activities with different mechanics, goals, and outcomes. Connect activity results to money, inventory, time, skills, relationships, or reputation. Add a transaction ledger, purchase/sale confirmation, and at least one fair way to recover when the player runs out of money. Avoid softlocks.

### 2. Improve the human character
Audit the existing model, rig, materials, animation controller, and camera first. Upgrade toward stylized realism: human proportions, dimensional face/body, natural materials, better lighting, and smooth animations while remaining mobile-friendly. Support varied skin tones, face/body presets, hairstyles, clothing, and accessories to the extent the assets allow. Include diverse NPC appearances across destinations. Preserve and regression-test existing movement and camera feel. Do not chase expensive photorealism or claim realism that has not been achieved.

### 3. Make cities feel alive
Add efficient moving traffic and purposeful NPC behavior (commuting, shopping, waiting, working, eating, leisure, events). Use distance-based activation, simplified distant behavior, bounded active counts, and pooling/LOD where appropriate. Improve functional points of interest—not only scenery. Keep each city visually and culturally distinct; do not create superficial reskins.

### 4. Add lifestyle progression in stages
Improve shopping and inventory; then add vehicle ownership and driving, property rental/ownership and personalization, storage, safe selling, more job types, and social/leisure activities. Every purchase, sale, and ownership change must persist across reloads and city transitions.

### 5. Preserve offline play and optimize for affordable devices
The core loop, movement, activities, inventory, and local saving must not require internet after installation. Audit the current save mechanism before changing it. Add versioning/migration and safe writes only in a way compatible with the current stack. Never silently erase existing progress. Optimize models, textures, lights, shadows, draw calls, AI, physics, and audio. Add graphics quality settings if feasible. Test responsive UI, touch controls, safe areas, readable text, and existing desktop controls. Design city-pack support where appropriate, but don't add a server dependency.

### 6. Build a small travel slice after the life loop is stable
Use configurable destination-specific fares and lodging costs. Show a clear trip budget. Implement affordability checks, booking, a feasible transport/arrival flow, and entry into an existing destination module. Make it possible to recover fairly if the player cannot afford to extend or return from a trip.

### 7. Prepare future systems without building them now
Keep clean extension points for future cloud sync, authentication, real-money purchases of virtual currency, sponsored billboards/storefronts, and an admin dashboard. Do not add live payments, login requirements, ad calls, or backend infrastructure in this milestone. Offline players must not depend on ad servers or campaign downloads.

## UI and game feel
Keep the world central during exploration. Use a minimal contextual HUD and polished interfaces only when needed for inventory, shopping, dialogue, map, travel, and finances. Avoid a dashboard-like layout, excessive cards, permanent oversized panels, or clutter. Support touch targets, responsive screen sizes, readable text, clear feedback, and settings. Do not copy exact interfaces, maps, or assets from other commercial games.

## Engineering rules
- Follow existing project conventions and use its current stack.
- Keep player state, economy, inventory, interactions, activities, city content, persistence, and UI modular.
- Make destination-specific prices, dialogue, activities, and points of interest data-driven where practical.
- Avoid unnecessary dependencies and oversized assets.
- Handle missing assets and errors gracefully.
- Preserve compatibility with existing saves; implement and test migrations if needed.
- Never introduce mandatory network calls into offline gameplay.
- Never fabricate test results or mark a feature complete without running it.

## Milestone protocol
For each milestone:
1. State the specific outcome.
2. Implement the change in the actual project, not just a mockup or plan.
3. Run relevant tests, lint/type checks, and build.
4. Exercise the feature in the running game where possible.
5. Fix regressions caused by your changes before moving on.
6. Report files changed, user-visible results, actual tests and results, known issues, and the next recommended milestone.

Separate status into **implemented**, **tested and passed**, **partially working**, and **not implemented**. If the session cannot finish everything, leave the project in a working state and clearly document remaining work.

## Start now
First inspect the repository and run baseline tests. Briefly tell me what you found and which first milestone you will implement. Then proceed with the smallest high-impact, testable slice: **distinct activity → meaningful reward/state change → purchase or progression → save → reload → verify**. Do not stop after giving advice or generating placeholder UI. Ask before any destructive or irreversible action.


## MCP setup and verification (development tools only)

Do not assume any MCP is installed. Inspect the current Claude Code setup first and list connected servers. Do not alter unrelated servers or global configuration without approval.

### A. Meshy official MCP — recommended first
Official documentation: https://www.meshy.ai/mcp and https://github.com/meshy-dev/meshy-mcp-server
- Check Node.js version (18+ required) and whether the Meshy MCP server is already configured.
- If not configured, explain that a Meshy API key is required and generation consumes credits; do not start paid generation until the user approves the first asset and budget.
- Guide the user to create the key in their Meshy account and configure it locally. Never ask them to paste a secret into this chat, a repository file, a commit, or a screenshot.
- Use the official installer or official Claude Code configuration documented by Meshy. Do not invent a server package or URL.
- After configuration, run `/mcp` (or `claude mcp list`) and confirm the server and its tools are available. Report success/failure truthfully.
- If no key is available, continue the repository audit and use existing/free assets only; do not block unrelated work.

Official quick-start currently documents:
`npx add-mcp @meshy-ai/meshy-mcp-server --env MESHY_API_KEY=msy_YOUR_API_KEY`
Replace the placeholder only in the user's local terminal/configuration. Avoid exposing the actual key in chat, shell transcripts, version control, or build logs. Confirm the current official docs before executing commands because installation instructions may change.

### B. Blender MCP — optional, only if Blender is installed and needed
Reference: https://github.com/Blanceone/blender-mcp
- First check whether Blender is installed and whether an MCP server already exists.
- This is a community-maintained project. Review its repository/install instructions before use; it can run Python inside Blender.
- The documented Claude Code command is `claude mcp add blender uvx blender-mcp`; installation also requires the Blender add-on and starting its local MCP server inside Blender.
- Do not expose the Blender server to the public internet or enable remote access on an untrusted network.
- Do not install this if the project only needs to import/optimize an asset using the existing pipeline or Blender is unavailable.

### C. Animation
Mixamo is a website, not an MCP. Use it manually only if its current licensing terms are suitable and the rig is compatible. Keep source/license records. Do not assume any generated or downloaded animation is automatically cleared for every commercial use.

### D. Optional Meshy skill
The official Meshy 3D Agent skill is an alternative workflow, not a required second integration:
`npx skills add meshy-dev/meshy-3d-agent`
Check the official repository/instructions before installation. Avoid duplicate overlapping Meshy workflows unless there is a clear reason.

## Project-local skills

If a `.claude/skills/` directory exists, preserve existing skills. Add the provided Retreva skills or create equivalent project-local skills:
- `Retreva-responsive-web3d`
- `Retreva-3d-asset-pipeline`
- `Retreva-regression-qa`

Read each skill's `SKILL.md` before following it. Skills are instructions, not proof that a feature works. Never claim a skill or MCP is installed/active until verified.

## Responsive-web implementation requirements

- Keep the current browser-based game and rendering stack for this milestone.
- Test from 320 CSS pixels wide upward, including portrait and landscape, phone, tablet, and desktop viewports.
- Support touch and existing keyboard/mouse controls, safe-area insets, readable text, and menus that do not obscure essential gameplay.
- Use adaptive rendering resolution/pixel ratio, shadows, post-processing, traffic/NPC counts, and draw distance based on measured performance.
- Keep the app shell and required assets available offline after installation. Investigate PWA/service-worker support only if compatible with the current framework.
- Preserve local saves and validate offline reloads, browser restart, storage quota/error recovery, and existing-save migration.
- Test on representative real Android and iOS devices when available; emulation alone is not proof of real-device performance.
- Report actual measured frame rate, load size/time, and any limitations. Never promise smooth performance on every device without testing.

## First asset-generation milestone

Only after the baseline audit and MCP verification:
1. Propose one realistic-but-mobile-friendly human avatar and one compact Lagos environment asset.
2. State the target format (prefer GLB/glTF only if supported by the current renderer), approximate polygon/texture budgets, expected download size, and any credit cost.
3. Ask for approval before spending paid credits or replacing existing assets.
4. Generate/import one asset, validate it, optimize it, and test it in the actual browser game.
5. Verify movement, camera, animation, touch controls, responsive layouts, and local saves still work.
6. Keep the original asset and implementation as a rollback path until the replacement passes.

If MCP installation requires credentials, permissions, software installation, or user approval, explain exactly what is needed and why; do not bypass the requirement. Continue independent audit and responsive improvements while waiting.
