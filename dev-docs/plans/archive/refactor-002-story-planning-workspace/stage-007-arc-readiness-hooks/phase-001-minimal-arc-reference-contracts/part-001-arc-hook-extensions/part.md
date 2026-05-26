---
title: Arc Hook Extensions
slug: part-001-arc-hook-extensions
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-minimal-arc-reference-contracts
started_at: ~
completed_at: ~
estimated_duration: 2d
---

## Objective

Add minimal arc-reference extension points to outliner data and UI so future arc modules can integrate without structural refactors.

## Scope

**In scope:**

- Optional arc reference fields in planning entities
- Minimal UI hint or slot for future arc tagging
- Validation of backward compatibility with existing projects

**Out of scope:**

- Arc authoring workflows
- Arc analytics or progression scoring

## Implementation Steps

1. Define optional arc reference types and export them through outliner module API.
2. Extend schema and types with additive arc hook fields.
3. Add minimal arc-tagging affordance in planning forms.
4. Ensure arc-free projects continue to function identically.
5. Document extension contract for future arc feature plan.

## Files

**Create:**

- src/modules/outliner/types/arc-hooks.ts
- src/modules/outliner/components/ArcTagHint.svelte

**Update:**

- src/lib/db/schema.ts
- src/lib/db/types.ts
- src/modules/outliner/types.ts
- src/modules/outliner/components/ChapterOutlineForm.svelte
- src/modules/outliner/components/SceneOutlineForm.svelte

## Acceptance Criteria

- [ ] Arc hooks are optional and persistable
- [ ] Arc hint UI is available without visual clutter
- [ ] No regressions occur when arc fields are omitted

## Edge Cases

- Unknown arc IDs should degrade to harmless display states.
- Null or empty arc metadata must not fail validation.

## Notes

Document this as a compatibility hook, not a user-facing feature launch.
