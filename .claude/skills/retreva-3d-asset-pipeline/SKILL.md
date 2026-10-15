---
name: retreva-3d-asset-pipeline
description: Use when generating, importing, validating, rigging, optimizing, or integrating human characters, animations, props, buildings, vehicles, or environment assets for Retreva.
---

# Retreva 3D Asset Pipeline

## Goal
Produce attractive, consistent, mobile-friendly assets for a browser game. Prefer stylized realism and stable performance over unnecessarily heavy photorealism.

## Workflow
1. Inspect the renderer, supported formats, coordinate system, scale, rig, material pipeline, and import paths.
2. Propose one asset at a time. State target format, polygon estimate, texture dimensions, material count, expected download size, rig requirements, and paid generation cost.
3. Never start paid generation or replace existing assets without owner approval.
4. Prefer official Meshy MCP when configured. Verify availability; never assume connectivity. Blender MCP is optional and community-maintained. Review its instructions and treat Blender Python execution as privileged local access.
5. Keep API keys out of source files, commits, chat, screenshots, and logs. Use official repositories and current setup instructions.
6. Inspect topology, normals, UVs, materials, scale, orientation, rigging, deformation, and license/usage terms.
7. Optimize in Blender or the existing pipeline. Use GLB/glTF only if the current renderer supports it. Prefer compressed textures, LODs, shared materials, sensible geometry, and reusable animations.
8. Keep source masters separate from runtime exports. Record asset name, source/tool, creator, generation date, license/terms, and runtime variant in a manifest.
9. Test in a preview scene and the actual browser game on desktop and mobile quality tiers.
10. Preserve a rollback path until the asset passes regression tests.

## Acceptance
- The asset is compatible with the existing stack and meets an agreed performance budget.
- Missing/failed generation is reported honestly; do not silently substitute a placeholder.
- Only one test asset is generated before scaling up to batches.
