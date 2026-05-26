---
title: Bible, Outliner, and Consistency Repositories
slug: part-002-bible-outliner-consistency-repos
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-repository-rewrites
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

> Rewrite the story bible module repositories (characters, locations, lore entries, plot threads, timeline events, character relationships), the outliner module arc repository, and the consistency module repository to use the fetch API client.

## Scope

**In scope:**

- `src/modules/bible/services/character-repository.ts`
- `src/modules/bible/services/location-repository.ts`
- `src/modules/bible/services/lore-entry-repository.ts`
- `src/modules/bible/services/plot-thread-repository.ts`
- `src/modules/bible/services/timeline-event-repository.ts`
- `src/modules/bible/services/character-relationship-repository.ts` (if exists)
- `src/modules/outliner/services/arc-repository.ts`
- `src/modules/consistency/services/consistency-repository.ts`
- `src/modules/export/services/export-settings-repository.ts`

**Out of scope:**

- `src/modules/outliner/services/story-structure-service.ts` (orchestrates other services, no direct Dexie)
- `src/modules/outliner/services/pacing-telemetry.ts` (reads from scene/beat repos, no direct Dexie)

## Implementation Steps

1. List existing files in `src/modules/bible/services/` and confirm which repositories exist
2. For each bible repository: replace Dexie query with appropriate `apiGet`/`apiPost`/`apiPut`/`apiDel` calls
3. Character repository: ensure `traits`, `goals`, `flaws`, `arcs`, `tags` fields arrive as arrays in response (API handles deserialization)
4. Rewrite `arc-repository.ts` — include reorder support if `reorderArcs` function exists
5. Rewrite `consistency-repository.ts` — support status/type filtering via query params
6. Rewrite `export-settings-repository.ts` — upsert pattern (POST idempotent by projectId)
7. Run `pnpm check` after each file to catch type errors early

## Files

**Update:**

- `src/modules/bible/services/character-repository.ts`
- `src/modules/bible/services/location-repository.ts`
- `src/modules/bible/services/lore-entry-repository.ts`
- `src/modules/bible/services/plot-thread-repository.ts`
- `src/modules/bible/services/timeline-event-repository.ts`
- `src/modules/bible/services/character-relationship-repository.ts` (if present)
- `src/modules/outliner/services/arc-repository.ts`
- `src/modules/consistency/services/consistency-repository.ts`
- `src/modules/export/services/export-settings-repository.ts`

## Acceptance Criteria

- [ ] All listed repositories import from `$lib/api-client` instead of `$lib/db`
- [ ] Character response has all array fields as proper TypeScript arrays
- [ ] `getExportSettings(projectId)` returns `ExportSettings | undefined` — maps API `{ data: null }` to `undefined`
- [ ] Consistency repository supports `getIssuesByProject`, `updateIssueStatus`, and `createIssue`
- [ ] `pnpm check` passes with zero errors on all updated files
- [ ] `pnpm lint` passes

## Edge Cases

- Character `arcs` field name conflicts with the `arcs` table entity name — be careful with variable naming in the repository
- `export-settings-repository` upsert: POST to collection with full object; API uses `INSERT OR REPLACE` to handle re-saves
- If `character-relationship-repository.ts` does not yet exist as a separate file (may be inline in character-repository), create it during this part

## Notes

> After all repositories are rewritten, the only remaining Dexie usage in the codebase should be:
>
> 1. `src/lib/db/index.ts`, `schema.ts`, `types.ts` — the Dexie class definition (preserved for portability)
> 2. `src/modules/export/services/portability/` — snapshot and restore services (preserved for plan-006)
> 3. Any test files using `fake-indexeddb` (preserved for portability tests)
