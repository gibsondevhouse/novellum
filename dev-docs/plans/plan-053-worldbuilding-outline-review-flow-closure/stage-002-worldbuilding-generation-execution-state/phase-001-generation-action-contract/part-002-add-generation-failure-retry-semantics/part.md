---
title: Add Generation Failure Retry Semantics
slug: part-002-add-generation-failure-retry-semantics
part_number: 2
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-generation-action-contract
started_at: 2026-06-16
completed_at: 2026-06-16
estimated_duration: 0.5d
---

## Objective

Make failed worldbuilding generation attempts visible and retryable without leaving stale running states.

## Scope

**In scope:**

- Normalize provider, validation, missing-context, and network failures.
- Expose retry/reset actions through the state store.
- Record user-safe error messages.

**Out of scope:**

- Background retry scheduling unless a queued runtime is already available and explicitly selected.

## Implementation Steps

1. Extend generation state service with error metadata if needed.
2. Add retry/reset helpers.
3. Add tests for legal and illegal transitions.
4. Render failure copy in route widgets.

## Files

**Create:**

- `tests/world-building/worldbuilding-generation-state-errors.test.ts`

**Update:**

- `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts`
- `src/routes/projects/[id]/world-building/+page.svelte`

**Reference:**

- `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts`

## Acceptance Criteria

- [x] Failed generation displays a concise error and retry option.
- [x] Illegal transitions still throw in tests but not from normal UI paths.
- [x] Retry returns state to queued/running only after a user action.

## Edge Cases

- A route change during generation must not strand the UI in running state.
- Repeated failures should not spam proposal refreshes.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
