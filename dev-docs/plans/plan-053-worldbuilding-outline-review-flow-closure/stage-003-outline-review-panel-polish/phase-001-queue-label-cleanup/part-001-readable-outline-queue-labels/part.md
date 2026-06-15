---
title: Readable Outline Queue Labels
slug: part-001-readable-outline-queue-labels
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-001-queue-label-cleanup
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Translate outline checkpoint queue filters, lifecycle chips, and task keys into readable labels.

## Scope

**In scope:**

- Map draft/review/accepted/rejected to clear labels.
- Map pipeline task keys to display names.
- Update aria-labels and selected-state copy.

**Out of scope:**

- Changing checkpoint lifecycle values in storage.

## Implementation Steps

1. Add or reuse task/lifecycle display helpers.
2. Replace raw values in the queue list and detail summary.
3. Add tests for known and unknown task keys.

## Files

**Create:**

- `tests/outline/outline-checkpoint-labels.test.ts`

**Update:**

- `src/routes/projects/[id]/outline/+page.svelte`

**Reference:**

- `src/lib/ai/pipeline/task-catalog.ts`
- `src/lib/review-gate-labels.ts`

## Acceptance Criteria

- [ ] Queue rows do not show raw task keys by default.
- [ ] Lifecycle chips use Draft, In review, Accepted, and Rejected style labels.
- [ ] Unknown task keys fall back safely without exposing raw internal jargon first.

## Edge Cases

- Existing CSS selectors may rely on raw lifecycle data attributes; keep data attributes for styling if needed.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
