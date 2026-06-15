---
title: Add Worldbuilding Outline Review E2E
slug: part-001-add-worldbuilding-outline-review-e2e
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-001-end-to-end-review-flow-coverage
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Add targeted Playwright coverage for the restored worldbuilding and outline review behavior.

## Scope

**In scope:**

- Seed proposal/checkpoint fixtures into the correct runtime DB.
- Exercise proposal review discovery and accept/reject action.
- Exercise generation blocked/running/review-ready states or deterministic mock equivalent.
- Exercise outline cleaned labels/default hidden payload.

**Out of scope:**

- Full visual snapshot suite reset.

## Implementation Steps

1. Create deterministic test fixtures.
2. Run targeted Playwright spec directly against rebuilt preview.
3. Record command output and any screenshot evidence.

## Files

**Create:**

- `tests/e2e/worldbuilding-outline-review-flow.spec.ts`

**Update:**

- `tests/e2e`

**Reference:**

- `tests/e2e/project-lifecycle.spec.ts`
- `src/lib/server/db/path.ts`

## Acceptance Criteria

- [ ] E2E fails if proposal review tiles are not rendered.
- [ ] E2E fails if generation controls only open Nova with no state transition.
- [ ] E2E fails if outline default detail shows raw payload JSON.

## Edge Cases

- SQLite path differs between dev and preview on macOS; align fixtures with resolved path.
- Mock AI output must still pass validators.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
