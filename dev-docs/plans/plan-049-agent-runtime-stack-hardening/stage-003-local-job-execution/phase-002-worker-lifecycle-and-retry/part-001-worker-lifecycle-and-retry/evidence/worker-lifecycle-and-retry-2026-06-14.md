# Worker Lifecycle & Retry Evidence

Date: 2026-06-14  
Plan: plan-049-agent-runtime-stack-hardening  
Stage: 003 local job execution  
Phase: 002 worker lifecycle and retry  
Part: 001 worker lifecycle and retry

## Implementation Summary

Added a local worker contract over the durable runtime ledger and SQLite queue.

Created:

- `src/lib/server/agent-runtime/job-handlers.ts`
- `src/lib/server/agent-runtime/worker.ts`
- `src/routes/api/nova/runs/[runId]/cancel/+server.ts`
- `src/routes/api/nova/runs/[runId]/retry/+server.ts`
- `tests/agent-runtime/job-handlers.test.ts`
- `tests/agent-runtime/worker.test.ts`

Updated:

- `src/lib/server/agent-runtime/index.ts`
- `src/routes/api/ai/outline/generate/+server.ts`
- `src/routes/api/author-draft/checkpoints/generate/+server.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/types.ts`
- `tests/nova/nova-session.test.ts`

## Runtime Behavior

`AgentRuntimeWorker.runNextJob` claims one eligible job, transitions the linked run to `running`, invokes a registered handler, heartbeats progress, and then reconciles the job and run state.

Success paths:

- Job -> `completed`.
- Run -> `completed` or `waiting_for_review` depending on handler result.
- Worker step is appended to the run ledger.

Failure paths:

- `AgentWorkerRetryableError` schedules the job as `retry_scheduled` while attempts remain and moves the run to `retrying`.
- Non-retryable failures mark the job `failed` and move the run to `failed`.
- Errors are captured in `agent_run_errors`.

Cancellation paths:

- Aborted worker signals cancel claimed jobs and move linked runs to `cancelled`.
- `POST /api/nova/runs/[runId]/cancel` cancels queued/running/retry-scheduled jobs for the run and transitions the run to `cancelled`.

Retry paths:

- `POST /api/nova/runs/[runId]/retry` creates a new pending run linked by `retryOfRunId` and queues a new job linked by `retryOfJobId`.
- Review-gated `waiting_for_review` runs are not retryable by this endpoint, which prevents duplicate generation from bypassing accept/reject decisions.

## Generation Route Integration

The existing outline, author draft, and worldbuilding scan routes now accept explicit queued execution (`defer: true` or `executionMode: "queued"`). The default route behavior remains synchronous and review-gated.

Queued routes create a pending run and queued job only. They do not silently accept generated artifacts or mutate manuscript/canon state.

## Verification

Command:

```bash
pnpm vitest run tests/agent-runtime tests/nova/nova-session.test.ts
```

Result:

```text
Test Files  6 passed (6)
Tests  32 passed (32)
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
pnpm vitest run tests/agent-runtime tests/nova/nova-session.test.ts tests/sqlite/migrations
```

Result:

```text
Test Files  14 passed (14)
Tests  61 passed (61)
```

Command:

```bash
pnpm vitest run tests/routes/outline-generation.test.ts tests/routes/outline-no-silent-write-regression.test.ts tests/routes/worldbuilding-scan.test.ts tests/ai/pipeline/author-draft-checkpoint-service.test.ts
```

Result:

```text
Test Files  4 passed (4)
Tests  30 passed (30)
```

Command:

```bash
pnpm test:e2e --grep "outline generation review gate|vibe-author review-gate flow|vibe-worldbuild checkpoint flow" --project=chromium
```

Result:

```text
5 passed
```

Note: Vitest still prints the existing Vite/Svelte warning `invalid plugin options "hot" in inline config { hot: false }`; it did not fail the suite. Playwright also printed existing `NO_COLOR` / `FORCE_COLOR` warnings; tests passed.
