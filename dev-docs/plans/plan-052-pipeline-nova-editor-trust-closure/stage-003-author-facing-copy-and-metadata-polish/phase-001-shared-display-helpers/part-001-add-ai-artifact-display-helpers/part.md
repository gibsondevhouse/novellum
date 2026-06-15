---
title: Add AI Artifact Display Helpers
slug: part-001-add-ai-artifact-display-helpers
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-001-shared-display-helpers
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Centralize formatting for AI artifact metadata so Nova and future review surfaces use consistent author-facing labels.

## Scope

**In scope:**

- Implement timestamp, task key, lifecycle, scene identifier, and debug label helpers.
- Add tests for invalid dates, unknown tasks, missing titles, and debug-only fields.

**Out of scope:**

- Changing persisted artifact schemas.

## Implementation Steps

1. Create a display helper module in the AI/Nova boundary.
2. Map current task keys and lifecycle values to readable labels.
3. Add tests for fallback behavior.

## Files

**Create:**

- `src/modules/nova/services/artifact-display.ts`
- `tests/nova/artifact-display.test.ts`

**Update:**

- `src/modules/nova/index.ts`

**Reference:**

- `src/lib/review-gate-labels.ts`
- `src/lib/ai/pipeline/task-catalog.ts`

## Acceptance Criteria

- [ ] Raw ISO strings are not required for default card display.
- [ ] Unknown values degrade to readable fallback labels.
- [ ] Debug values can still be exposed intentionally in advanced disclosure.

## Edge Cases

- Invalid date strings should not throw during render.
- Task labels must not imply a mutation happened.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
