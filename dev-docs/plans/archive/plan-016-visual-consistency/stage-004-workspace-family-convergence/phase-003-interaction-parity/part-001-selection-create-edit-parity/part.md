---
title: Selection / Create / Edit Parity
slug: part-001-selection-create-edit-parity
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-003-interaction-parity
started_at: 2026-04-25 19:00 EDT
completed_at: 2026-04-25 19:15 EDT
estimated_duration: 1d
---

## Objective

Document and enforce one interaction contract across the outline workspace family: inline-only create and edit for Act / Chapter / Scene, and shared selection / hover / active / disabled / focus treatments across the sidebar hierarchy and the inspector.

Scope is grounded in [evidence/workspace-family-inventory-2026-04-24.md](../../evidence/workspace-family-inventory-2026-04-24.md).

## Scope

**In scope:**

- Record the "inline-only" create/edit decision (no modals, no drawers) in canonical rules under [dev-docs/design-system.md](../../../../../design-system.md) and update [dev-docs/context-docs/frontend.md](../../../../../context-docs/frontend.md) to match.
- Align selection, hover, active, disabled, and focus treatments across the outline sidebar row components and the three clarity panels.

**Out of scope:**

- Business logic in `outliner.svelte.ts`.
- Data model changes (plan-013).
- Shell, hero, or inspector container refactors (Phases 001 and 002).

## Implementation Steps

1. Append an "Outline Workspace Interaction" section to the design system docs with the inline-only decision.
2. Extract the shared hover / active / selected / disabled / focus treatment onto a shared class or design-token set if not already covered.
3. Apply treatments uniformly to `HierarchyNavigator` / `ActGroup` / `ChapterGroup` / `SceneRow` and the clarity panels.
4. Run gates; capture evidence screenshots of the outline sidebar selection states.

## Files

**Update:**

- `dev-docs/design-system.md`
- `dev-docs/context-docs/frontend.md`
- `src/modules/outliner/components/HierarchyNavigator.svelte`
- `src/modules/outliner/components/ActGroup.svelte`
- `src/modules/outliner/components/ChapterGroup.svelte`
- `src/modules/outliner/components/SceneRow.svelte`
- `src/modules/outliner/components/ActClarityPanel.svelte`
- `src/modules/outliner/components/ChapterClarityPanel.svelte`
- `src/modules/outliner/components/SceneClarityPanel.svelte`

## Acceptance Criteria

- [x] Inline-only create/edit decision is documented in `dev-docs/design-system.md` and `dev-docs/context-docs/frontend.md`.
- [x] Selected, hover, active, disabled, and focus treatments are visually identical across the four updated components.
- [x] Gates pass: lint on touched files, `pnpm run check`, `pnpm run check:tokens`.

## Edge Cases

- If a component legitimately needs a different affordance (for example, beat reorder drag handles), document the exception inline in the component and in the design system notes.

## Notes

- No modals or drawers are introduced in this part.
- This part depends on Phase 001 and Phase 002 being complete, so selection treatments are applied to already-converged shells and inspectors.
