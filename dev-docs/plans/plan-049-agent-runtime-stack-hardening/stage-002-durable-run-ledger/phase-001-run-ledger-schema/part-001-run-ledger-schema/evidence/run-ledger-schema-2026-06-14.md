# Run Ledger Schema Evidence

Date: 2026-06-14  
Plan: plan-049-agent-runtime-stack-hardening  
Stage: 002 durable run ledger  
Phase: 001 run ledger schema  
Part: 001 run ledger schema

## Implementation Summary

Added migration `0006_agent_runtime_ledger` and registered it in `MIGRATION_REGISTRY`.

Runtime ledger tables:

- `agent_runs`
- `agent_run_steps`
- `agent_tool_calls`
- `agent_artifacts`
- `agent_usage`
- `agent_run_errors`
- `agent_jobs`
- `agent_trace_events`
- `agent_trace_redactions`

The canonical `SCHEMA_SQL` and `INDEX_SQL` now mirror the migration-created tables and indexes so empty database bootstrap and normal migration replay converge on the same schema.

## Ledger Ownership Boundary

The ledger stores runtime metadata and links, not full domain content.

Belongs in the ledger:

- Run family, entrypoint, status, target kind/id, model provider/id, hashes, timestamps, and retry lineage.
- Step sequence, tool invocation metadata, job queue state, retry/error metadata, usage/cost estimates, and provider-reported usage when available.
- Artifact references, review state, storage references, domain IDs, summaries, schema versions, and content hashes.
- Redacted trace event metadata and explicit trace redaction records.

Belongs in domain tables or existing project metadata:

- Manuscript text and scene content.
- Accepted canon and world-building entity payloads.
- Outline checkpoint payloads, author draft checkpoint payloads, proposal payloads, and materialized domain records.
- Full unredacted prompts, full raw model outputs, and secrets.

The ledger links to these records through `storageKind`, `storageProjectId`, `storageOwnerId`, `storageKey`, `domainType`, `domainId`, and hash columns.

## Index Coverage

Migration 0006 adds indexes for:

- Project/status runtime views: `idx_agent_runs_project_status`, `idx_agent_jobs_project_status`.
- Run type and created-time views: `idx_agent_runs_family_createdAt`.
- Active and scheduled jobs: `idx_agent_jobs_status_runAfter`, `idx_agent_jobs_lockExpiresAt`.
- Failed or errored runs: `idx_agent_run_errors_run`, `idx_agent_run_errors_code`, plus run status indexes.
- Artifact lookup: `idx_agent_run_steps_artifactId`, `idx_agent_tool_calls_artifactId`, `idx_agent_artifacts_storage`, `idx_agent_artifacts_domain`.
- Trace replay and redaction audit: `idx_agent_trace_events_run_sequence`, `idx_agent_trace_redactions_run`, `idx_agent_trace_redactions_event`.

## Verification

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
pnpm vitest run tests/sqlite/migrations/0006-agent-runtime-ledger.test.ts tests/sqlite/migrations/from-empty.test.ts tests/sqlite/migrations/idempotent.test.ts tests/sqlite/migrations/from-v1.test.ts tests/sqlite/migrations/snapshot.test.ts
```

Result:

```text
Test Files  5 passed (5)
Tests  14 passed (14)
```

Command:

```bash
pnpm vitest run tests/sqlite/migrations
```

Result:

```text
Test Files  8 passed (8)
Tests  29 passed (29)
```

Note: Vitest still prints the existing Vite/Svelte warning `invalid plugin options "hot" in inline config { hot: false }`; it did not fail the suite.
