---
title: Runtime Import Sweep
slug: part-002-runtime-import-sweep
part_number: 2
status: complete
owner: architect
assigned_to: architect
phase: phase-003-dexie-freeze-and-import-sweep
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Rewrite every V1 runtime consumer of `$lib/db/index`, `$lib/db/db`, and `$lib/db/types` to import types from `$lib/db/domain-types` and to fetch data via `/api/db/*` instead of Dexie tables.

## Scope

**In scope:**

- Type-only imports → `$lib/db/domain-types`.
- Data reads/writes → `/api/db/*` (use existing `fetch` patterns; reuse repositories where they already exist).
- Files affected (initial set, may grow during sweep):
  - `src/routes/+layout.svelte`
  - `src/routes/api/ai/+server.ts`
  - `src/lib/migration/migration-service.ts` (this is migration code; it is allowed to remain on Dexie via `$lib/legacy/dexie/*`).
  - `src/routes/projects/[id]/editor/+page.svelte`
  - `src/modules/outliner/services/outline-data-service.ts`
  - `src/modules/outliner/services/pacing-telemetry.ts`
  - `src/modules/outliner/services/story-structure-service.ts`
  - `src/modules/outliner/services/migrations/outline-to-story-workspace.ts` (migration; legacy-allowed).
  - `src/lib/ai/context-builder.ts`
  - `src/routes/styles/+page.svelte`
  - `src/routes/projects/[id]/+layout.{svelte,ts}`
  - `src/routes/projects/[id]/hub/+page.{svelte,ts}`
  - `src/routes/stories/+page.svelte`
  - All outliner components currently importing `$lib/db/types.js`.

**Out of scope:**

- The phase-004 IndexedDB→SQLite migration UI (legitimate Dexie consumer).
- Adding new API endpoints — if a consumer needs a route that does not yet exist, surface a follow-up issue and use the existing closest-match route in the meantime.

## Implementation Steps

1. List every file from `pnpm run check` failures plus the workspace search for `$lib/db/`.
2. For each file:
   - Replace `import { db } from '$lib/db'` (or `db/index` / `db/db`) with a fetch call against the appropriate `/api/db/*` route.
   - Replace `import type { … } from '$lib/db/types'` with `from '$lib/db/domain-types'`.
3. After each module, run `pnpm run check` and fix anything that breaks.
4. Run `pnpm run test` after every 3-5 files to keep the failure surface manageable.

## Files

**Update:** every file in the in-scope list above (and any others surfaced during the sweep).

## Acceptance Criteria

- [ ] `grep -r "from '\$lib/db/index'" src/` returns 0 matches outside `src/lib/legacy/**` and migration files.
- [ ] `grep -r "from '\$lib/db/db'" src/` returns 0 matches outside `src/lib/legacy/**` and migration files.
- [ ] `grep -r "import.*Dexie" src/` returns 0 matches outside `src/lib/legacy/**`.
- [ ] `pnpm run lint`, `pnpm run check`, and `pnpm run test` all pass.

## Edge Cases

- Some current consumers do bulk `db.X.toArray()` reads with no equivalent route. If a route does not exist, prefer adding the route over inlining a one-off endpoint; if blocked, document the gap in the audit and proceed with the closest-fit approach.
- Components that currently subscribe to Dexie live queries lose reactivity; replace with `$effect` + interval invalidation or explicit refresh after mutation. Keep changes minimal.

## Notes

- Allowed exceptions (legacy-permitted): `src/lib/migration/migration-service.ts`, `src/modules/outliner/services/migrations/outline-to-story-workspace.ts`, the upcoming phase-004 migration page. These files stay on Dexie and import from `$lib/legacy/dexie/*`.
