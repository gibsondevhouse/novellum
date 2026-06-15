---
title: Add Outline Review Browser Evidence
slug: part-002-add-outline-review-browser-evidence
part_number: 2
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-002-checkpoint-detail-disclosure
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Capture browser-level evidence that the cleaned outline review queue and detail panel render correctly.

## Scope

**In scope:**

- Seed or load a representative checkpoint.
- Capture desktop and mobile screenshots or Playwright assertions.
- Verify no overlapping text in queue/detail panels.

**Out of scope:**

- Updating the entire visual regression baseline.

## Implementation Steps

1. Create/seed a representative checkpoint fixture.
2. Run targeted browser validation for queue and detail states.
3. Store screenshot/test output evidence.

## Files

**Create:**

- `tests/e2e/outline-review-polish.spec.ts`

**Update:**

- `dev-docs/plans/plan-053-worldbuilding-outline-review-flow-closure/stage-003-outline-review-panel-polish/phase-002-checkpoint-detail-disclosure/part-002-add-outline-review-browser-evidence/evidence/outline-review-browser-2026-06-15.md`

**Reference:**

- `tests/e2e`
- `src/routes/projects/[id]/outline/+page.svelte`

## Acceptance Criteria

- [ ] Browser evidence covers pending/review checkpoint detail.
- [ ] Default view hides raw JSON/debug values.
- [ ] Advanced disclosure can be opened intentionally.

## Edge Cases

- Preview may resolve SQLite to the app-data DB path; seed fixtures accordingly.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
