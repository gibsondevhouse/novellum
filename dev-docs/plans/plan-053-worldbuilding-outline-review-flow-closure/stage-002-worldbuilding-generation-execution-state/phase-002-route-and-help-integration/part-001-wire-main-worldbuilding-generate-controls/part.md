---
title: Wire Main Worldbuilding Generate Controls
slug: part-001-wire-main-worldbuilding-generate-controls
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-002-route-and-help-integration
started_at: 2026-06-16
completed_at: 2026-06-16
estimated_duration: 0.75d
---

## Objective

Connect the main worldbuilding domain Generate controls and status widgets to the real generation action service.

## Scope

**In scope:**

- Invoke generation service from domain Generate buttons.
- Display state changes in existing status widgets.
- Refresh proposal review sections after review-ready generation.

**Out of scope:**

- Redesigning the worldbuilding landing page.

## Implementation Steps

1. Locate current domain Generate button wiring.
2. Replace Nova-only callbacks with generation service calls.
3. Thread state and retry handlers into the UI.
4. Add focused component/route tests.

## Files

**Create:**

- `tests/world-building/worldbuilding-generate-controls.test.ts`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte`
- `src/modules/world-building/worldbuilding-generate-actions.ts`

**Reference:**

- `src/routes/projects/[id]/world-building/+page.svelte`

## Acceptance Criteria

- [x] Generate button state matches idle/missing-context/running/review-ready/failed.
- [x] Review-ready state links or scrolls to proposal/draft review.
- [x] Readiness guards prevent confusing no-op clicks.

## Edge Cases

- Multiple domain generations should not overwrite each other state.
- Rapid repeated clicks should be debounced or disabled while running.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
