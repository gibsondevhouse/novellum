---
title: from-empty Test
slug: part-001-from-empty
part_number: 1
status: complete
owner: reviewer
assigned_to: reviewer
phase: phase-004-migration-test-matrix
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Prove that running the registry against a fresh `:memory:` DB produces the canonical schema and records all migrations in `schema_migrations`.

## Scope

**In scope:**

- `tests/sqlite/migrations/from-empty.test.ts`.

## Implementation Steps

1. Open a `new Database(':memory:')` instance.
2. Call `runMigrations(db, REGISTRY)`.
3. Assert: every table declared in `SCHEMA_SQL` exists; every index in `INDEX_SQL` exists; `schema_migrations` rows match registry length and versions.

## Acceptance Criteria

- [ ] Test passes.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
