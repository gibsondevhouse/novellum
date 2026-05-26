---
title: Startup Integration
slug: part-003-startup-integration
part_number: 3
status: complete
owner: backend
assigned_to: backend
phase: phase-001-migration-runner-and-registry
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Wire the migration runner into the SQLite bootstrap path so every DB open executes pending migrations before any reads.

## Scope

**In scope:**

- `src/lib/server/db/index.ts` (or `client.ts`): on connect, call runner with the registry list.
- `src/lib/server/db/migrations.ts` becomes a thin re-export that delegates to the runner; ad-hoc `ensureColumn` calls remain only as legacy migration bodies under `migrations/` (handled in phase-002).

**Out of scope:**

- Authoring individual migration files (phase-002).
- Snapshotting (phase-003).

## Implementation Steps

1. Import runner + migration registry list (placeholder until phase-002 lands real files; for this part, registry can be empty).
2. Call `runMigrations(db, REGISTRY)` immediately after `client.ts` instantiates the DB.
3. Surface failures with a clear console error and rethrow so the request fails fast.

## Files

**Update:**

- `src/lib/server/db/index.ts` or `src/lib/server/db/client.ts`
- `src/lib/server/db/migrations.ts`

## Acceptance Criteria

- [ ] Bootstrap on a fresh DB creates `schema_migrations` and applies the (currently empty) registry.
- [ ] Bootstrap on a legacy DB does not throw and leaves data intact.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Concurrent requests at first boot must not double-run migrations — connection is shared and runner is sync; document the assumption.
