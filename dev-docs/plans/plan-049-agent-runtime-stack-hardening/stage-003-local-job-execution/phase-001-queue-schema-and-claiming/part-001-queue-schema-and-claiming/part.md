---
title: Queue Schema & Claiming
slug: part-001-queue-schema-and-claiming
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-001-queue-schema-and-claiming
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Create a SQLite-backed job queue that can support durable local agent execution.

## Scope

**In scope:**

- Add queue table fields for job type, run ID, project ID, payload, status, attempts, priority, scheduled time, claim owner, heartbeat, error, and result link.
- Implement server-side queue repository functions.
- Add stale claim recovery rules.

**Out of scope:**

- Running model calls in a background loop.
- Adding multi-device synchronization.

## Implementation Steps

1. Add queue fields to the runtime ledger migration or a follow-up migration if the ledger already shipped.
2. Implement atomic enqueue, claim, heartbeat, release, cancel, fail, complete, and retry operations.
3. Add tests for concurrent claim safety using deterministic SQLite transactions where practical.
4. Add stale claim and retry evidence under this part.

## Files

**Create:**

- `src/lib/server/agent-runtime/job-queue.ts`
- `tests/agent-runtime/job-queue.test.ts`
- `evidence/queue-schema-and-claiming-2026-06-11.md`

**Update:**

- `src/lib/server/db/migrations/0006_agent_runtime_ledger.ts`
- `src/lib/server/agent-runtime/types.ts`
- `src/lib/server/agent-runtime/index.ts`

**Reference:**

- `src/lib/server/db/index.ts`
- `src/lib/server/db/migration-runner.ts`
- `tests/sqlite/migrations/0006-agent-runtime-ledger.test.ts`

## Acceptance Criteria

- [ ] Jobs can be enqueued with project, run, type, priority, payload, and scheduled time.
- [ ] Claiming is atomic and handles stale claims safely.
- [ ] Tests cover enqueue, claim, heartbeat, cancel, retry scheduling, and stale worker recovery.

## Edge Cases

- A job may be cancelled while claimed.
- App shutdown may leave a claimed job without a completion record.

## Notes

Use SQLite transaction semantics instead of in-memory locking so desktop restarts remain recoverable.
