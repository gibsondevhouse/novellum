# Bible & Worldbuilding Route Validation — 2026-04-14

## Dexie Violation Fix

### Before

```ts
// src/routes/projects/[id]/world-building/plot-threads/+page.ts
import { db } from '$lib/db';
// ...
db.scenes.where('projectId').equals(params.id).toArray()
```

### After

```ts
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
// ...
getScenesByProjectId(params.id)
```

Return shape unchanged: `{ projectId, plotThreads, scenes }`.

---

## Loader Audit — All Bible Routes

All bible routes (`/projects/[id]/bible/*`) redirect to their world-building counterparts via `redirect(307, ...)`. No data loading occurs in bible loaders — no violations possible.

| Route | Behavior |
| --- | --- |
| `/bible` | → `/world-building` |
| `/bible/characters` | → `/world-building/characters` |
| `/bible/characters/[charId]` | → `/world-building/characters/[charId]` |
| `/bible/locations` | → `/world-building/locations` |
| `/bible/plot-threads` | → `/world-building/plot-threads` |
| `/bible/lore` | → `/world-building/lore` |
| `/bible/timeline` | → `/world-building/timeline` |

## Loader Audit — All World-Building Routes

| Route | Data Source | Status |
| --- | --- | --- |
| `/world-building` | `params.id` only | Clean |
| `/world-building/characters` | `getCharactersByProjectId` (bible repo) | Clean |
| `/world-building/characters/[charId]` | `getCharacterById`, `getCharactersByProjectId`, `getRelationshipsByProjectId` (bible repo) | Clean |
| `/world-building/locations` | `getLocationsByProjectId` (bible repo) | Clean |
| `/world-building/plot-threads` | `getPlotThreadsByProjectId` (bible repo), `getScenesByProjectId` (editor repo) | **Fixed** |
| `/world-building/lore` | `getLoreEntriesByProjectId` (bible repo) | Clean |
| `/world-building/timeline` | `getTimelineEventsByProjectId` (bible repo), `getCharactersByProjectId` (bible repo) | Clean |

## Remaining `$lib/db` Imports in Routes

| File | Import | Assessment |
| --- | --- | --- |
| `+layout.svelte` | `import { db } from '$lib/db'` | Root layout init — not a loader data query |
| `editor/+page.svelte` | `import type { Scene } from '$lib/db'` | Type-only — clean |
| `projects/[id]/+layout.svelte` | `import type { Project } from '$lib/db'` | Type-only — clean |

No Dexie data-query violations remain in any route loader.

## Quality Gate Results

```text
pnpm run lint    → 0 errors, 0 warnings
pnpm run check   → 0 errors, 0 warnings
pnpm run test    → 33 files, 215 tests passed, 0 failures
```
