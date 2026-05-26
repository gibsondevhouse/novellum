---
title: Project Data to SQLite
slug: part-002-project-data-to-sqlite
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-002-localstorage-audit-and-migration
started_at: 2025-01-09
completed_at: 2025-01-09
estimated_duration: 0.5d
---

## Objective

Move every `project-data`-classified `localStorage` call site (per the phase-002 audit) onto SQLite via `/api/db/*` writes, with no behavioral regression.

## Scope

**In scope:**

- Add new SQLite columns or tables identified by the audit (e.g. `scene_clarity`, `chapter_clarity`, scene `definition`, scene `quick_intent`, lineages, factions).
- Add the corresponding API routes under `src/routes/api/db/*`.
- Refactor each call site to use the API instead of `localStorage`.
- Add Vitest coverage for new repositories.

**Out of scope:**

- App-preference call sites — part-003.
- IndexedDB migration UI — phase-004.

## Implementation Steps

1. Land any new DDL in `src/lib/server/db/schema.ts` (no migration runner yet — that's stage-003).
2. Implement repositories under `src/lib/server/repositories/*` for each new table, following the existing `EntityRouteConfig` pattern.
3. Add API routes under `src/routes/api/db/*` and wire `createPostHandler` / `createPatchHandler`.
4. Refactor each `project-data` call site:
   - Read on mount → API GET (already on the page load promise where possible).
   - Debounced write → API POST/PATCH.
5. Add Vitest tests for each new repository and a tests/routes/* test exercising the migrated component.

## Files

**Update (per audit):**

- `src/lib/server/db/schema.ts`
- `src/modules/outliner/components/SceneClarityPanel.svelte`
- `src/modules/outliner/components/ChapterClarityPanel.svelte`
- `src/modules/outliner/components/ChapterOutlinePanel.svelte`
- `src/modules/outliner/components/SceneOutlineForm.svelte`
- `src/modules/outliner/components/ChapterOutlineForm.svelte`
- `src/routes/projects/[id]/editor/+page.svelte`
- `src/routes/projects/[id]/world-building/lineages/+page.svelte`
- `src/routes/projects/[id]/world-building/factions/+page.svelte`

**Create (per audit):**

- New repository / route files under `src/lib/server/repositories/*` and `src/routes/api/db/*`.

## Acceptance Criteria

- [ ] No `localStorage` reads or writes remain for project-owned data.
- [ ] Every new table/column has a repository, an API route, and at least one Vitest test.
- [ ] Acceptance scenario: editing scene clarity, closing the tab, and re-opening shows the saved value (no localStorage involved).
- [ ] `pnpm run lint` and `pnpm run test` pass.

## Edge Cases

- Existing localStorage values must not be silently dropped on first load. On mount, if SQLite returns nothing and a localStorage value exists, write the localStorage value to SQLite then `removeItem` it (one-shot lift-and-shift inline migration).
- Debounce must not fire during teardown — guard against unmounted component writes.

## Notes

- Boundary check: API route changes must keep server-only modules (`$lib/server/*`) out of client imports.
