---
title: Wire Suggestion Store To Routes
slug: part-001-wire-suggestion-store-to-routes
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-suggestion-state-integration
started_at: 2026-06-16
completed_at: 2026-06-16
estimated_duration: 0.5d
---

## Objective

Connect the existing worldbuild suggestion store to project worldbuilding routes so persisted scan proposals load automatically.

## Scope

**In scope:**

- Call refreshSuggestions on project worldbuilding route load/mount.
- Expose loading and load-error states in route UI.
- Avoid duplicate refresh storms during navigation.

**Out of scope:**

- Changing proposal persistence schema.

## Implementation Steps

1. Inspect worldbuilding route load data and component lifecycle.
2. Invoke refreshSuggestions when projectId changes.
3. Render load/error state in a restrained route location.
4. Add store/route tests where practical.

## Files

**Create:**

- `tests/world-building/worldbuild-suggestion-route-state.test.ts`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte`
- `src/routes/projects/[id]/world-building/help/+page.svelte`
- `src/modules/world-building/stores/worldbuild-suggestion-state.svelte.ts`

**Reference:**

- `src/modules/world-building/stores/worldbuild-suggestion-state.svelte.ts`
- `src/lib/project-metadata.ts`

## Acceptance Criteria

- [x] The proposal store has at least one real route caller.
- [x] Pending-count selectors are consumed outside the store.
- [x] Load errors are visible without breaking the page.

## Edge Cases

- ProjectId can be null during route transitions.
- Corrupted proposal metadata should not crash the route.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
