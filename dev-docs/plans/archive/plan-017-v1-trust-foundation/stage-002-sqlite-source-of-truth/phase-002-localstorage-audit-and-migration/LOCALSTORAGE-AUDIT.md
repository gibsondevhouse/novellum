# localStorage Audit

**Date:** 2026-04-28
**Part:** [phase-002-localstorage-audit-and-migration/part-001-localstorage-audit](../part-001-localstorage-audit/part.md)

## Method

Workspace-wide search for `localStorage.{getItem,setItem,removeItem}` and `window.localStorage.*` under `src/**`. 67 raw matches across 24 files. Each call site classified as one of:

- **project-data** — per-project content (must move to SQLite via `/api/db/*`).
- **app-preference** — global UI/UX state (must move to `app_preferences` table via the new preferences service).
- **credential** — API keys / secrets (deferred to stage-005 BYOK Security; not addressed in stage-002).
- **legacy-portability** — Dexie-era export bundle reads/writes (allowed to remain; explicitly preserved by stage-002 phase-003 boundaries rule).
- **bootstrap** — runs in `app.html` before hydration; cannot use the API and must keep using localStorage.

## Inventory

### project-data (target: SQLite via `/api/db/*`)

| File | Key shape | Value shape | Target |
|---|---|---|---|
| [src/modules/outliner/components/SceneClarityPanel.svelte](src/modules/outliner/components/SceneClarityPanel.svelte) | `clarity:scene:${pid}:${sceneId}` | JSON | New `scene_clarity` columns on `scenes` (or join table) |
| [src/modules/outliner/components/SceneOutlineForm.svelte](src/modules/outliner/components/SceneOutlineForm.svelte) | `scene-outline:${id}:goal\|conflict\|outcome\|notes` | string | Columns on `scenes`: `outlineGoal`, `outlineConflict`, `outlineOutcome`, `outlineNotes` |
| [src/modules/outliner/components/ChapterClarityPanel.svelte](src/modules/outliner/components/ChapterClarityPanel.svelte) | `clarity:chapter:${pid}:${cid}` | JSON | Columns on `chapters` |
| [src/modules/outliner/components/ChapterOutlinePanel.svelte](src/modules/outliner/components/ChapterOutlinePanel.svelte) | `chapter-outline:${id}` and `chapter-outline:${id}:notes` | JSON beats + string | `beats` table is canonical; per-beat notes column on `beats` |
| [src/modules/outliner/components/ChapterOutlineForm.svelte](src/modules/outliner/components/ChapterOutlineForm.svelte) | `chapter-outline:${id}:notes\|function\|turn\|revelation` | string | Columns on `chapters` |
| [src/routes/projects/[id]/editor/+page.svelte](src/routes/projects/[id]/editor/+page.svelte) | `scene-definition:${id}` and `quickIntent:${id}` | JSON | Columns on `scenes` (`definition`, `quickIntent`) |
| [src/routes/projects/[id]/world-building/characters/individuals/+page.svelte](src/routes/projects/[id]/world-building/characters/individuals/+page.svelte) | `character-photo:${id}` | base64 image | New `assets` table with FK to `characters` |
| [src/routes/projects/[id]/world-building/lineages/+page.svelte](src/routes/projects/[id]/world-building/lineages/+page.svelte) | `lineages:${projectId}` | JSON map | New `lineages` table |
| [src/routes/projects/[id]/world-building/factions/+page.svelte](src/routes/projects/[id]/world-building/factions/+page.svelte) | `factions:${projectId}` | JSON map | New `factions` table |
| [src/routes/projects/[id]/world-building/locations/landmarks/+page.svelte](src/routes/projects/[id]/world-building/locations/landmarks/+page.svelte) | `landmark-photo:${id}` | base64 image | `assets` table |
| [src/routes/projects/[id]/world-building/locations/realms/+page.svelte](src/routes/projects/[id]/world-building/locations/realms/+page.svelte) | `realm-photo:${id}` | base64 image | `assets` table |

### app-preference (target: `app_preferences` table)

| File | Key | Default | Notes |
|---|---|---|---|
| [src/lib/components/ActiveProjectSection.svelte](src/lib/components/ActiveProjectSection.svelte) | `novellum_last_project_id` | none | Last opened project id |
| [src/lib/components/OnboardingModal.svelte](src/lib/components/OnboardingModal.svelte) | `novellum:seen_onboarding` | `false` | First-run flag |
| [src/lib/stores/model-selection.svelte.ts](src/lib/stores/model-selection.svelte.ts) | `novellum:model_selection` | constant | Selected OpenRouter model id |
| [src/lib/stores/reader-mode.svelte.ts](src/lib/stores/reader-mode.svelte.ts) | `novellum:reader-mode` | `{}` | Reader-mode UI state (font size, theme, etc.) |
| [src/modules/settings/services/themeService.ts](src/modules/settings/services/themeService.ts) | `novellum-theme` | `'system'` | Theme preference (light/dark/system) |

### credential (target: stage-005 BYOK Security — out of scope for stage-002)

| File | Key | Reason deferred |
|---|---|---|
| [src/modules/settings/components/ApiSettings.svelte](src/modules/settings/components/ApiSettings.svelte) | `novellum_openrouter_key` | API key — must not be stored unencrypted; see stage-005 |
| [src/lib/ai/openrouter.ts](src/lib/ai/openrouter.ts) | `novellum_openrouter_key` (read only) | Must read from secure store after stage-005 |

### legacy-portability (explicitly allowed)

| File | Reason |
|---|---|
| [src/modules/export/services/portability/snapshot-service.ts](src/modules/export/services/portability/snapshot-service.ts) | Reads localStorage as part of the .novellum.zip Dexie-era export bundle |
| [src/modules/export/services/portability/restore-service.ts](src/modules/export/services/portability/restore-service.ts) | Writes restored localStorage entries during legacy import |

### bootstrap (cannot use API)

| File | Key | Reason |
|---|---|---|
| [src/app.html](src/app.html) | `novellum-theme` | Inline FOUC-prevention script runs before SvelteKit hydration; must be synchronous |

## Implementation Phasing

This audit informs three downstream pieces of work:

1. **Part-003 (this stage)** — `app_preferences` SQLite table + typed preferences service. Migrate the 5 `app-preference` sites listed above. **Bootstrap** site continues using localStorage as a write-through cache (preferences service writes to both SQLite and `localStorage['novellum-theme']` on theme change so the FOUC script keeps working).

2. **Part-002 (this stage)** — `project-data` migration. Largest piece; requires several schema additions:
   - `scenes`: `outlineGoal`, `outlineConflict`, `outlineOutcome`, `outlineNotes`, `definition`, `quickIntent`, plus a flat `clarity` JSON column.
   - `chapters`: `outlineNotes`, `chapterFunction`, `majorTurn`, `revelation`, `clarity`.
   - `beats`: per-beat `notes` already exists.
   - New `lineages`, `factions`, `assets` tables (with FK to `projects` and parent entity).
   - One-shot lift-and-shift inline migration on each component's mount (read localStorage → write API → `removeItem`).

3. **Stage-005 (deferred)** — `credential` sites move to the secure credential service.

## Decisions

- The `app_preferences` table will use `(key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)` to match the existing `createdAt`/`updatedAt` ISO-string convention noted in the schema audit.
- The preferences service will expose `getPreference<T>(key, default)` and `setPreference<T>(key, value)`, JSON-encoding values transparently.
- The theme bootstrap script in `app.html` will continue to read `localStorage['novellum-theme']`. The preferences service is responsible for keeping that key in sync (write-through) until stage-008 desktop packaging removes the FOUC-prevention pattern entirely.
