# Run Repository API Evidence

Date: 2026-06-14  
Plan: plan-049-agent-runtime-stack-hardening  
Stage: 002 durable run ledger  
Phase: 002 run repository API  
Part: 001 run repository API

## Implementation Summary

Added the server-owned agent runtime repository module under `src/lib/server/agent-runtime/`.

Created files:

- `src/lib/server/agent-runtime/types.ts`
- `src/lib/server/agent-runtime/redaction.ts`
- `src/lib/server/agent-runtime/run-ledger.ts`
- `src/lib/server/agent-runtime/index.ts`
- `tests/agent-runtime/redaction.test.ts`
- `tests/agent-runtime/run-ledger.test.ts`
- `src/routes/api/nova/runs/+server.ts`
- `src/routes/api/nova/runs/[runId]/+server.ts`

## Repository Surface

The repository exposes typed server-side operations for:

- `createRun`
- `transitionRun`
- `listRuns`
- `getRun`
- `getRunDetails`
- `appendStep`
- `captureToolCall`
- `linkArtifact`
- `recordUsage`
- `captureError`
- `createJob`
- `appendTraceEvent`
- `redactTraceEvent`

The factory accepts a `better-sqlite3` handle and deterministic `now` / `createId` hooks so tests can run against an in-memory migrated database without touching the app database.

## Lifecycle Guard

Run transitions are enforced by a finite transition map:

- `pending` -> `running`, `failed`, `cancelled`, `expired`
- `running` -> `retrying`, `waiting_for_review`, `completed`, `failed`, `cancelled`, `expired`
- `retrying` -> `running`, `failed`, `cancelled`, `expired`
- `waiting_for_review` -> `running`, `completed`, `failed`, `cancelled`, `expired`
- terminal statuses do not transition further

Invalid transitions throw `AgentRunLedgerError` with `code: "invalid_transition"`.

## Redaction Boundary

The repository redacts variable payloads before persistence when callers provide raw diagnostic input:

- Tool call input/output payloads.
- Job payloads.
- Error details.
- Trace event metadata.

Redaction records are persisted in `agent_trace_redactions` for trace events. Raw prompt/manuscript/model-output payloads are not stored by default.

## Route Boundary

Added read-only Nova runtime routes:

- `GET /api/nova/runs`
- `GET /api/nova/runs/[runId]`

These routes expose summarized run history and detailed run records. They do not expose client-side create/update/delete mutations; writes remain server repository concerns.

## Verification

Command:

```bash
pnpm vitest run tests/agent-runtime/redaction.test.ts tests/agent-runtime/run-ledger.test.ts
```

Result:

```text
Test Files  2 passed (2)
Tests  7 passed (7)
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
Test Files  10 passed (10)
Tests  36 passed (36)
```

Note: Vitest still prints the existing Vite/Svelte warning `invalid plugin options "hot" in inline config { hot: false }`; it did not fail the suite.
