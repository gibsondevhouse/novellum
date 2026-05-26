# Project Workspace Validation — 2026-04-14

## Summary

Refactored project workspace route loaders to remove direct Dexie access and use repository pattern consistently. Verified all project-scoped routes conform to the approved loader-source contract.

## Changes Made

### Violation 1: Hub Loader (`src/routes/projects/[id]/hub/+page.ts`)

**Before:** Direct `db.scenes.where('projectId').equals(project.id).toArray()` via `import { db } from '$lib/db'`.

**After:** Uses `getScenesByProjectId(project.id)` from `$modules/editor/services/scene-repository.js`. Return shape unchanged (`{ currentWordCount }`).

### Violation 2: Editor Loader (`src/routes/projects/[id]/editor/+page.ts`)

**Before:** Direct `db.scenes.where('projectId').equals(params.id).sortBy('order')` via `import { db } from '$lib/db'`.

**After:** Uses `getScenesByProjectId(params.id)` from `$modules/editor/services/scene-repository.js` with explicit `scenes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))` to preserve sort order. Return shape unchanged (`{ scenes }`).

## Verification Results

### Already Clean Routes

| Route | Loader Source | Status |
| --- | --- | --- |
| `/projects/[id]` | Redirect (no data loading) | Clean |
| `/projects/[id]/workspace` | `workspace-data-service` aggregator | Clean |
| `/projects/[id]/editor/[sceneId]` | `scene-repository` + `chapter-repository` | Clean |

### Active-State Sidebar Behavior

`SidebarItem` uses `page.url.pathname.startsWith(href)` for active state detection. Deep routes like `/projects/[id]/editor/[sceneId]` correctly highlight the "Editor" sidebar item since the path starts with `/projects/[id]/editor`.

### Out-of-Scope Issue Noted

`src/routes/projects/[id]/world-building/plot-threads/+page.ts` still imports `db` directly from `$lib/db`. This is in the world-building route family and belongs to Part 3 (bible/worldbuilding refactors).

## Quality Gates

```text
pnpm run lint    → 0 errors, 0 warnings
pnpm run check   → 0 errors, 0 warnings
pnpm run test    → 33 files, 215 tests passed (3.22s)
```

All three quality gates pass.
