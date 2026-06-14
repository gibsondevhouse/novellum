# Queue Schema & Claiming Evidence

Date: 2026-06-14  
Plan: plan-049-agent-runtime-stack-hardening  
Stage: 003 local job execution  
Phase: 001 queue schema and claiming  
Part: 001 queue schema and claiming

## Implementation Summary

Added durable queue mechanics on top of the `agent_jobs` ledger table.

Schema updates to migration `0006_agent_runtime_ledger` and canonical schema:

- `heartbeatAt TEXT`
- `resultArtifactId TEXT`
- `idx_agent_jobs_resultArtifactId`

Created:

- `src/lib/server/agent-runtime/job-queue.ts`
- `tests/agent-runtime/job-queue.test.ts`

Updated:

- `src/lib/server/agent-runtime/types.ts`
- `src/lib/server/agent-runtime/index.ts`
- `src/lib/server/agent-runtime/run-ledger.ts`
- `tests/sqlite/migrations/0006-agent-runtime-ledger.test.ts`

## Queue Operations

The queue repository exposes:

- `enqueueJob`
- `claimNextJob`
- `heartbeatJob`
- `releaseJob`
- `cancelJob`
- `failJob`
- `completeJob`
- `scheduleRetry`
- `recoverStaleClaims`
- `getJob`
- `listJobs`

`claimNextJob` uses `BEGIN IMMEDIATE` around select-and-update so a single SQLite writer lock owns the claim decision. The claim updates status, worker lock, lease expiry, heartbeat, started timestamp, and attempt count before returning the job.

## Recovery Behavior

Eligible claim candidates include:

- `queued` jobs with no future `runAfter`.
- `retry_scheduled` jobs whose `runAfter` has arrived.
- stale `running` jobs whose `lockExpiresAt` is older than the current queue clock.

`recoverStaleClaims` can also move stale running jobs back to `queued` without claiming them.

## Retry And Cancellation

`failJob` schedules a retry when the caller marks the failure retryable and `attempt < maxAttempts`. Otherwise it marks the job `failed`.

`cancelJob` clears locks and records cancellation metadata. `completeJob` clears locks and stores `resultArtifactId` for artifact linkage.

Payloads are redacted through the same runtime redaction helper used by run-ledger diagnostics.

## Verification

Command:

```bash
pnpm vitest run tests/agent-runtime/job-queue.test.ts tests/agent-runtime/run-ledger.test.ts tests/sqlite/migrations/0006-agent-runtime-ledger.test.ts tests/sqlite/migrations/from-empty.test.ts tests/sqlite/migrations/idempotent.test.ts
```

Result:

```text
Test Files  5 passed (5)
Tests  17 passed (17)
```

Command:

```bash
pnpm check
```

Result:

```text
svelte-check found 0 errors and 0 warnings
```

Command:

```bash
pnpm vitest run tests/agent-runtime tests/sqlite/migrations
```

Result:

```text
Test Files  11 passed (11)
Tests  42 passed (42)
```

Note: Vitest still prints the existing Vite/Svelte warning `invalid plugin options "hot" in inline config { hot: false }`; it did not fail the suite.
