---
title: idempotent Test
slug: part-003-idempotent
part_number: 3
status: complete
owner: reviewer
assigned_to: reviewer
phase: phase-004-migration-test-matrix
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Prove that running the registry twice in a row is a no-op and never re-applies DDL.

## Scope

**In scope:**

- `tests/sqlite/migrations/idempotent.test.ts`.

## Implementation Steps

1. Open `:memory:` DB; run registry; capture `schema_migrations` rows and `applied_at`s.
2. Run registry again; assert no new rows inserted, `applied_at`s unchanged, no errors thrown.
3. Tamper: insert a fake row with `version = max+1` and assert `MigrationVersionAheadError`.

## Acceptance Criteria

- [ ] Test passes.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
