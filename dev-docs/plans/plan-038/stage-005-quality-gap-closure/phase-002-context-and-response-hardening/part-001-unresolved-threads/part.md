---
title: Populate unresolvedThreads from plot_threads
slug: part-001-unresolved-threads
part_number: 1
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-context-and-response-hardening
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Replace the hardcoded `continuity.unresolvedThreads: []` in `buildSceneDraftContext`
with a real DB query against the `plot_threads` table.

## Scope

**Update:**

- `src/lib/ai/pipeline/author-draft-context.ts` — query `plot_threads WHERE project_id = ? AND resolved = 0`
  and map to string array for `continuity.unresolvedThreads`.

## Implementation Steps

1. Add a `SELECT id, title, description FROM plot_threads WHERE project_id = ? AND resolved = 0` query
   inside `buildSceneDraftContext` using the injected `db` connection.
2. Map results to `string[]` — use `title` (and optionally `description` as a suffix if populated).
3. Replace `unresolvedThreads: []` with the query result.

## Acceptance Criteria

- [ ] `buildSceneDraftContext` returns actual unresolved threads from `plot_threads`.
- [ ] Returns `[]` when no open threads exist (not null, not undefined).
- [ ] `pnpm check` — 0 errors.
- [ ] Corresponding test in `tests/ai/pipeline/author-draft-context.test.ts` un-skipped / passes.

## Schema Note

Query the `plot_threads` table columns: `id`, `project_id`, `title`, `description`, `resolved`.
If the table doesn't exist yet, check the schema migration files under `src/lib/db/migrations/`.
