---
title: Route Character Save Errors Through UI State
slug: part-001-route-character-save-errors-through-ui-state
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-character-persistence-error-cleanup
started_at: 2026-06-16
completed_at: 2026-06-16
estimated_duration: 1d
---

## Objective

Clean up raw console.error calls in the worldbuilding character individuals route while preserving actionable user feedback.

## Scope

**In scope:**

- Inspect current character persistence save/failure paths.
- Replace noisy console output with structured logger or existing UI error state.
- Add focused tests for failed save behavior.

**Out of scope:**

- Refactoring the entire character workspace.

## Implementation Steps

1. Locate console.error calls in the character individuals route.
2. Confirm whether the route already has visible save error state.
3. Route failures through that state or a small structured logger helper.
4. Add a regression test for failed persistence.

## Files

**Create:**

- `tests/world-building/character-persistence-errors.test.ts`
- `tests/e2e/character-persistence-errors.spec.ts`

**Update:**

- `src/routes/projects/[id]/world-building/characters/individuals/+page.svelte`

**Reference:**

- `src/routes/projects/[id]/world-building/characters/individuals/+page.svelte`

## Acceptance Criteria

- [x] Save errors remain visible to the author.
- [x] Raw console errors are absent from the normal production route path or guarded to development only.
- [x] Tests prove failures do not disappear silently.

## Edge Cases

- Some console logging may be acceptable in development diagnostics if gated clearly.
- Do not remove error data needed for support bundles.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
