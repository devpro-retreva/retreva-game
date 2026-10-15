---
name: retreva-responsive-web3d
description: Use when implementing or reviewing Retreva's browser-based 3D UI, responsive layouts, touch and keyboard input, WebGL performance, adaptive graphics, or offline/PWA behavior.
---

# Retreva Responsive Web3D

## Context
Retreva remains a browser-based 3D virtual-life game with offline-first play and local saves. Preserve the current framework, renderer, movement, camera, and save format unless a verified defect requires a change. Do not migrate to a native app or require a server for ordinary offline play.

## Workflow
1. Inspect framework, renderer, build scripts, input system, CSS/layout, save system, and tests before editing. Run baseline checks.
2. Test 320×640, 360×800, 390×844, 768×1024, 1024×768, 1366×768, and 1920×1080 CSS-pixel viewports where tooling permits.
3. Check portrait/landscape, safe-area insets, browser viewport changes, touch plus mouse/keyboard, readable text, and whether overlays hide gameplay.
4. Use measured capability-aware quality tiers for render scale, shadows, post-processing, effects, view distance, traffic, and NPC counts. Avoid relying only on user-agent strings.
5. Lazy-load assets; do not load every destination at startup. Add PWA/service-worker behavior only if compatible and test it offline.
6. Regression-test movement, camera, local saves, reload, and offline play after changes.

## Acceptance
- No clipped or overlapping primary controls in tested viewports.
- Existing desktop controls still work; mobile touch targets are comfortably sized.
- Offline core play works after required assets are installed.
- Report actual results and unsupported cases; never promise universal performance without evidence.
