---
title: Implement Stage Readiness and Runtime State Machine
slug: part-001-implement-stage-readiness-and-runtime-state-machine
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-002-stage-readiness-and-runtime-state
started_at: 2026-05-26T17:55:00Z
completed_at: 2026-05-26T17:58:00Z
estimated_duration: 2d
---

## Objective

Implement readiness checks and runtime transitions for worldbuild stage execution with deterministic UI semantics.

## Scope

**In scope:**

- Readiness derivation for valid hierarchy scope, selected stage, and blocking checkpoint conditions.
- Runtime transitions: `idle`, `ready`, `queued`, `running`, `completed_pending_checkpoint`, `failed`, `cancelled`.
- Failure/retry/duplicate-run guard behavior tied to adapter results.

**Out of scope:**

- Artifact review and accept/reject decision UI.
- Streaming-first UX states.

## Implementation Steps

1. Add readiness computation utilities and disabled-reason mapping.
2. Add explicit runtime state machine transitions around run adapter calls.
3. Wire UI panel controls to state machine and failure/retry logic.

## Files

**Create:**

- `tests/outline/worldbuild-stage-runtime-state.test.ts`

**Update:**

- `src/routes/projects/[id]/outline/+page.svelte`
- `src/modules/outline/stores/outline-store.svelte.ts`
- `src/modules/outline/components/OutlineSummaryBar.svelte`

## Acceptance Criteria

- [x] Stage run button is enabled only for `ready` state and disabled with explicit reason otherwise.
- [x] Runtime transitions are deterministic and test-covered for success, failure, retry, and cancel.
- [x] Duplicate submissions while `queued`/`running` are blocked.
- [x] Failed runs preserve selection state and expose recoverable next actions.

## Edge Cases

- Selection changes during `running` must not corrupt submitted path context.
- Retry after parser error must produce a fresh, distinct attempt context.

## Notes

Keep state machine logic centralized; components should render state, not invent transitions.
