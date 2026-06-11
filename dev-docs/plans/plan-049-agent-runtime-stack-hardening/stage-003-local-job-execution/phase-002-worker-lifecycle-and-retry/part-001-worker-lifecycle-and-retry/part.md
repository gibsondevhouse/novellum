---
title: Worker Lifecycle & Retry
slug: part-001-worker-lifecycle-and-retry
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-002-worker-lifecycle-and-retry
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Run local agent jobs through a controlled worker lifecycle that supports progress, cancellation, retry, and recovery.

## Scope

**In scope:**

- Add a local worker service that claims queued jobs, invokes the appropriate runtime handler, updates run ledger state, and records final artifacts.
- Add cancellation and retry endpoints or service methods.
- Integrate outline, author draft, and worldbuilding generation paths behind the worker where appropriate.

**Out of scope:**

- Running multiple external worker processes.
- Remote queue execution.
- Silent acceptance of generated artifacts.

## Implementation Steps

1. Add worker lifecycle service with bounded polling or explicit trigger semantics appropriate for the Tauri/SvelteKit sidecar model.
2. Register job handlers for initial high-value agent workloads.
3. Wire cancellation, retry, heartbeat, failure, and completion state updates to the ledger.
4. Add tests for success, failure, abort, stale claim recovery, and retry behavior.
5. Save worker lifecycle evidence under this part.

## Files

**Create:**

- `src/lib/server/agent-runtime/worker.ts`
- `src/lib/server/agent-runtime/job-handlers.ts`
- `src/routes/api/nova/runs/[runId]/cancel/+server.ts`
- `src/routes/api/nova/runs/[runId]/retry/+server.ts`
- `tests/agent-runtime/worker.test.ts`
- `tests/agent-runtime/job-handlers.test.ts`
- `evidence/worker-lifecycle-and-retry-2026-06-11.md`

**Update:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `src/routes/api/author-draft/checkpoints/generate/+server.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/stores/nova-session.svelte.ts`

**Reference:**

- `src/lib/server/ai/ollama-launcher.ts`
- `src/lib/ai/providers/types.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `tests/e2e/vibe-author-review-gates.spec.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`

## Acceptance Criteria

- [ ] Worker execution updates job and run state consistently.
- [ ] Cancellation, retry, and failure behavior is deterministic and user-visible.
- [ ] Long-running outline, author draft, and worldbuilding runs can be moved behind the worker contract without bypassing review gates.

## Edge Cases

- A provider stream can fail after partial output.
- A retry must not duplicate an already accepted checkpoint.

## Notes

Keep worker state local and inspectable. The author should never need cloud infrastructure to recover a run.
