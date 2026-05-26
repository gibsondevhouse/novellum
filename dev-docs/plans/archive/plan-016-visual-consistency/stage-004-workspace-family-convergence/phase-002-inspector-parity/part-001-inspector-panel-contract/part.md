---
title: Inspector Panel Contract
slug: part-001-inspector-panel-contract
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-inspector-parity
started_at: 2026-04-25 18:45 EDT
completed_at: 2026-04-25 19:00 EDT
estimated_duration: 1.5d
---

## Objective

Promote a canonical `WorkspaceInspector` container (header, sections, metadata row, action footer) and migrate the three clarity panels (Act / Chapter / Scene) onto it. Scope-specific fields stay local and slot into the container.

Scope is grounded in [evidence/workspace-family-inventory-2026-04-24.md](../../evidence/workspace-family-inventory-2026-04-24.md).

## Scope

**In scope:**

- Create `src/lib/components/ui/WorkspaceInspector.svelte` composed from existing `SurfacePanel` + `SectionHeader` primitives, with named snippets for `header`, `sections`, `metadata`, and `footer`.
- Export the primitive from `src/lib/components/ui/index.ts`.
- Migrate `ActClarityPanel`, `ChapterClarityPanel`, and `SceneClarityPanel` onto the primitive, preserving their scope-specific fields inside the `sections` snippet.

**Out of scope:**

- Changing the clarity panel field logic or persisted schemas.
- Any interaction-behavior changes (Phase 003).
- Scene editor writing surface (Stage 006).

## Implementation Steps

1. Define the inspector contract and implement `WorkspaceInspector` under `src/lib/components/ui/`.
2. Export from `src/lib/components/ui/index.ts`.
3. Migrate `ActClarityPanel.svelte` first; run gates.
4. Migrate `ChapterClarityPanel.svelte`; run gates.
5. Migrate `SceneClarityPanel.svelte`; run gates.
6. Capture evidence screenshots of the three inspectors.

## Files

**Create:**

- `src/lib/components/ui/WorkspaceInspector.svelte`

**Update:**

- `src/lib/components/ui/index.ts`
- `src/modules/outliner/components/ActClarityPanel.svelte`
- `src/modules/outliner/components/ChapterClarityPanel.svelte`
- `src/modules/outliner/components/SceneClarityPanel.svelte`

## Acceptance Criteria

- [x] `WorkspaceInspector` exists and is exported from `src/lib/components/ui/index.ts`.
- [x] All three clarity panels render via `WorkspaceInspector`; no inspector-level container CSS remains in those components.
- [x] Inspector rhythm (header, sections, metadata, footer) is visually identical across the three panels.
- [x] Gates pass: lint on touched files, `pnpm run check`, `pnpm run check:tokens`, targeted vitest suites touching outliner components.

## Edge Cases

- Scene clarity panel's beats list stays slotted, not converted into inspector layout.
- Metadata row in each panel must continue to reflect parent-scope context (parent act, parent chapter).

## Notes

- Keep scope-specific typography overrides only when necessary; prefer shared defaults from `SectionHeader`.
