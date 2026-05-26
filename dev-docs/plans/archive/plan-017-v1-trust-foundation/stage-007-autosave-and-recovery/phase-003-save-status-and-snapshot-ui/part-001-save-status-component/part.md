---
title: SaveStatus Component
slug: part-001-save-status-component
part_number: 1
status: complete
owner: stylist
assigned_to: stylist
phase: phase-003-save-status-and-snapshot-ui
started_at: 2026-04-29
completed_at: 2026-04-29
estimated_duration: 0.5d
---

## Objective

Replace the inline `<span class="save-indicator">` in the editor route
with a dedicated `SaveStatus.svelte` component that renders the five
`AutosaveResult` shapes legibly and accessibly.

## Files

**Create:**

- `src/modules/editor/components/SaveStatus.svelte`
- `tests/editor/save-status-component.test.ts`

**Modify:**

- `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`
- `src/modules/editor/index.ts` (export the new component)

## Acceptance Criteria

- [x] Component takes a `result: AutosaveResult` prop.
- [x] Idle, Saving, Saved (with relative time), Failed (with
      sanitised error), Retrying (attempt n) all render with a
      visible class hook.
- [x] `aria-live="polite"` so the status is announced.
- [x] Uses Svelte 5 Runes only (no `$:` or `export let`).
- [x] `pnpm run check && pnpm run lint && pnpm run test` green.
