---
title: Run Ledger Schema
slug: part-001-run-ledger-schema
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-001-run-ledger-schema
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Create SQLite persistence for durable agent runtime records while preserving local-first ownership.

## Scope

**In scope:**

- Add migrations for agent runs, run steps, tool calls, artifacts, usage, errors, and trace redaction metadata.
- Add indexes for project-scoped runtime views, active jobs, failed runs, and artifact lookup.
- Add schema tests for empty database migration, idempotency, and representative existing database migration.

**Out of scope:**

- Implementing worker execution.
- Persisting full unredacted prompts in diagnostics by default.
- Replacing existing checkpoint and proposal storage.

## Implementation Steps

1. Translate the runtime contract into SQLite table definitions.
2. Add a new migration under `src/lib/server/db/migrations/`.
3. Register the migration in the migration registry.
4. Add migration snapshot and idempotency tests.
5. Document schema ownership and redaction constraints in evidence.

## Files

**Create:**

- `src/lib/server/db/migrations/0006_agent_runtime_ledger.ts`
- `tests/sqlite/migrations/0006-agent-runtime-ledger.test.ts`
- `evidence/run-ledger-schema-2026-06-11.md`

**Update:**

- `src/lib/server/db/migration-registry.ts`
- `src/lib/server/db/schema.ts`
- `tests/sqlite/migrations/snapshot.test.ts`

**Reference:**

- `src/lib/server/db/migrations/0004_pipeline_entities.ts`
- `src/lib/server/db/migrations/0005_assets_table.ts`
- `src/lib/server/db/migration-runner.ts`
- `src/lib/server/db/serialize.ts`
- `tests/sqlite/migrations/idempotent.test.ts`
- `tests/sqlite/migrations/from-empty.test.ts`

## Acceptance Criteria

- [ ] Migrations create runtime tables with indexes for project, status, run type, created time, and linked artifact IDs.
- [ ] Migration tests pass from empty and existing databases.
- [ ] Schema docs explain what belongs in the ledger versus checkpoint/proposal domain tables.

## Edge Cases

- Existing users may already have pipeline records in `project_metadata`.
- Long-running agent records should not block database startup if partially written.

## Notes

Prefer narrow, normalized runtime tables plus JSON payload columns only where payload shape genuinely varies by run type.
