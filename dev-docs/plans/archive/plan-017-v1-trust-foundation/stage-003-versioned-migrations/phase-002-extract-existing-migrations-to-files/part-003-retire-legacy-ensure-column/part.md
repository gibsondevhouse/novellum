---
title: Retire Legacy ensureColumn
slug: part-003-retire-legacy-ensure-column
part_number: 3
status: complete
owner: backend
assigned_to: backend
phase: phase-002-extract-existing-migrations-to-files
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Delete `src/lib/server/db/migrations.ts` (the legacy `ensureColumn`-based entry point) and remove its bridge call from `client.ts` once `0001_baseline` covers everything it did.

## Scope

**In scope:**

- Delete `src/lib/server/db/migrations.ts`.
- Remove `runLegacyEnsureColumns` import and call from `src/lib/server/db/client.ts`.
- Remove the `runLegacyEnsureColumns` re-export from `src/lib/server/db/index.ts`.

**Out of scope:**

- Snapshot pre-flight (phase-003).
- Test matrix (phase-004).

## Implementation Steps

1. Confirm `0001_baseline.ts` contains every helper and backfill formerly in `migrations.ts`.
2. Delete the file.
3. Update `client.ts` and `index.ts`.
4. Run `pnpm run check && pnpm run lint && pnpm run test`.

## Files

**Delete:**

- `src/lib/server/db/migrations.ts`

**Update:**

- `src/lib/server/db/client.ts`
- `src/lib/server/db/index.ts`

## Acceptance Criteria

- [ ] `migrations.ts` no longer exists.
- [ ] `client.ts` only invokes the new `runMigrations(db, MIGRATION_REGISTRY)`.
- [ ] All existing tests still pass; no consumer of `runLegacyEnsureColumns` remains in product code.

## Edge Cases

- A test that imports the legacy entry directly: rewrite it to use the runner and registry.
