---
title: Project Hub Trust Cards
slug: stage-003-project-hub-trust
stage_number: 3
status: complete
owner: Backend Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-project-health-service
  - phase-002-hub-status-cards
  - phase-003-hub-layout-integration
  - phase-004-tests
estimated_duration: 3d
risk_level: low
---

## Goal

Turn the Project Hub from a progress-and-details surface into a command center that surfaces trust information: last autosave time, backup recency, AI configuration status, and export readiness — all from live local data. Four new status cards answer the questions authors care about before a writing session.

## Context (already in tree — do not duplicate)

- `src/routes/projects/[id]/+page.svelte` — hub route. Currently renders: `ProjectHubHero`, `StructuralMetricsCarousel`, `HubProgressCard`, `HubNextStepCard`, `HubDetailsPanel` inside a `.hub-grid` (4-column, responsive). Three cards span the grid. No backup, save-status, or AI-status information shown.
- `src/routes/projects/[id]/+page.ts` — hub loader. Fetches `project`, `currentWordCount`, `writingStyles`. Does not fetch backup metadata, save timestamps, or API key status.
- `src/modules/project/components/` — existing components: `HubProgressCard.svelte`, `HubNextStepCard.svelte`, `HubDetailsPanel.svelte`, `ProjectHubHero.svelte`, `StructuralMetricsCarousel.svelte`, `HubActionBar.svelte`. All use design-system primitives.
- `src/modules/project/services/` — existing services: `project-repository.ts`, `chapter-repository.ts`, `hub-metrics-service.ts` (fetches scene/chapter/act/arc counts via API).
- `src/lib/preferences.ts` — `getPreference<T>(key, defaultValue)` client helper. Reads from SQLite `/api/db/preferences/[key]`.
- `src/lib/server/preferences/preferences-service.ts` — `getPreference`, `setPreference`, `deletePreference` server-side.
- `app_preferences` SQLite table — key-value store. Used by `model-selection.svelte.ts`, `reader-mode.svelte.ts`, `themeService.ts`, `appearance.svelte.ts`.
- Autosave: `src/modules/editor/services/autosave-service.ts` — writes scene updates to SQLite. Last-saved timestamp is the `updatedAt` field on `Scene` rows. No dedicated preference key for last-save time (the scene `updatedAt` IS the last-save record).
- API key status: `src/lib/stores/model-selection.svelte.ts` / `src/routes/api/db/credentials/` — the OpenRouter key existence can be detected by `GET /api/db/credentials/openrouter-key` returning a non-null value.
- No `project-health-service.ts` exists yet. No backup/AI/save status cards exist.
- `src/lib/components/ui/SurfaceCard.svelte` — card primitive used by all existing hub cards.

## Entry Criteria

- Hub route (`src/routes/projects/[id]/+page.svelte`) renders without error (already true).
- `src/lib/preferences.ts` exports `getPreference` (already true).
- `src/routes/api/db/scenes/+server.ts` (or equivalent) returns scenes including `updatedAt` (verify before starting — used to derive last-save time).
- `pnpm run check` and `pnpm run lint` pass on the current tree.

## Exit Criteria

- `src/routes/projects/[id]/services/project-health-service.ts` — new client-side service returning `ProjectHealthSummary`:

  ```ts
  interface ProjectHealthSummary {
    lastSavedAt: string | null;      // ISO 8601, latest scene.updatedAt across all scenes
    lastBackupAt: string | null;     // ISO 8601 from preferences key 'backup.lastCompletedAt', or null
    apiKeyConfigured: boolean;        // true if /api/db/credentials/openrouter-key returns non-null
    sceneCount: number;
    wordCount: number;
  }
  ```

- Four new Svelte components in `src/modules/project/components/`:
  - `BackupStatusCard.svelte` — shows `lastBackupAt` (formatted relative date or "Never"), a "Backup now" CTA button (calls the existing backup service).
  - `ExportReadinessCard.svelte` — shows `sceneCount`, `wordCount`, a "Export" CTA button (links to the export modal or `/projects/{id}/export`).
  - `SaveStatusCard.svelte` — shows `lastSavedAt` as relative time ("Saved 3 minutes ago" / "Never saved"). No CTA.
  - `AIStatusCard.svelte` — shows "AI ready" if `apiKeyConfigured`, else "No AI key" with a link to `/settings/ai`. No CTA beyond the settings link.

- Hub loader `src/routes/projects/[id]/+page.ts` calls `getProjectHealth(projectId)` and includes the result in `data`.
- Hub route mounts the four new cards in the existing `.hub-grid` below or alongside the existing three cards. No custom grid CSS changes — use existing grid classes.
- Tests pass:
  - `tests/project/project-health-service.test.ts` — covers: `lastSavedAt` is the max `updatedAt` across scenes; `lastBackupAt` reads from preferences; `apiKeyConfigured` is true/false based on credential response; `sceneCount` and `wordCount` match fixture data.
  - Component smoke tests in `tests/project/hub-status-cards.test.ts` — each card renders with mock data; `BackupStatusCard` shows "Never" when `lastBackupAt` is null; `AIStatusCard` shows settings link when `apiKeyConfigured` is false.
- `pnpm run check` clean; `pnpm run lint` clean; `pnpm run test` passes.

## Phases

### Phase-001 — Project health service

**Goal:** Build the server-side-safe client service that aggregates health data for a project: last-save time, last-backup time, API key status, scene count, and word count. All reads go through existing API routes — no new SQLite tables.

**Files:**

- `src/routes/projects/[id]/services/project-health-service.ts` — new file (route-scoped service).
- `src/routes/projects/[id]/+page.ts` — extend loader to call the service.

**Implementation:**

`project-health-service.ts` — browser-side service (uses `fetch` / existing client helpers):

```ts
import { apiGet } from '$lib/api-client.js';
import { getPreference } from '$lib/preferences.js';
import type { Scene } from '$lib/db/domain-types';

export interface ProjectHealthSummary {
  lastSavedAt: string | null;
  lastBackupAt: string | null;
  apiKeyConfigured: boolean;
  sceneCount: number;
  wordCount: number;
}

export async function getProjectHealth(projectId: string): Promise<ProjectHealthSummary> {
  const [scenes, lastBackupAt, credentialResult] = await Promise.all([
    apiGet<Scene[]>('/api/db/scenes', { projectId }),
    getPreference<string | null>('backup.lastCompletedAt', null),
    apiGet<{ value: string | null }>('/api/db/credentials/openrouter-key')
      .then((r) => r.value !== null)
      .catch(() => false),
  ]);

  const lastSavedAt = scenes.length === 0
    ? null
    : scenes.reduce((latest, s) => (s.updatedAt > latest ? s.updatedAt : latest), scenes[0].updatedAt);

  const wordCount = scenes.reduce((sum, s) => {
    const text = (s.content ?? '').replace(/<[^>]+>/g, ' ').trim();
    return sum + (text ? text.split(/\s+/).length : 0);
  }, 0);

  return {
    lastSavedAt,
    lastBackupAt,
    apiKeyConfigured: credentialResult,
    sceneCount: scenes.length,
    wordCount,
  };
}
```

In `src/routes/projects/[id]/+page.ts`, add `getProjectHealth` to the loader:

```ts
const health = await getProjectHealth(params.id);
return { project, currentWordCount, writingStyles, health };
```

Update `$props` type in `+page.svelte` to include `health: ProjectHealthSummary`.

**Acceptance checklist:**

- [ ] `getProjectHealth` is exported from `project-health-service.ts`.
- [ ] `lastSavedAt` is the maximum `updatedAt` across all scenes for the project.
- [ ] `lastBackupAt` reads from the `'backup.lastCompletedAt'` preference key.
- [ ] `apiKeyConfigured` is `false` when the credential fetch fails or returns null.
- [ ] `wordCount` strips HTML tags before counting.
- [ ] Hub loader includes `health` in the returned data object.
- [ ] `pnpm run check` clean (no type errors in loader or service).

---

### Phase-002 — Hub status cards

**Goal:** Build the four status card components that display health summary data. Display-only, no internal async logic — all data comes from props.

**Files:**

- `src/modules/project/components/BackupStatusCard.svelte` — new file.
- `src/modules/project/components/ExportReadinessCard.svelte` — new file.
- `src/modules/project/components/SaveStatusCard.svelte` — new file.
- `src/modules/project/components/AIStatusCard.svelte` — new file.
- `src/modules/project/index.ts` — export the four new components.

**Implementation:**

All four cards use `SurfaceCard variant="flat"` as the outer container. No bespoke card CSS — use existing `--space-*`, `--color-*`, `--radius-*` tokens.

`BackupStatusCard.svelte` props: `lastBackupAt: string | null`, `projectId: string`.
- Shows: heading "Backup", last backup relative date (use a `formatRelative(iso: string): string` local helper that returns e.g. "3 days ago" or "Never").
- CTA: `SecondaryButton` "Backup now" — `onclick` calls the existing `createBackup(projectId)` from the backup client (`$modules/export/services/project-backup-client.js` or equivalent). Handles loading state inline.
- If `lastBackupAt` is null: shows warning visual ("Never backed up").

`ExportReadinessCard.svelte` props: `sceneCount: number`, `wordCount: number`, `projectId: string`.
- Shows: heading "Export", scene count, word count (formatted with commas).
- CTA: `SecondaryButton` "Export manuscript" — `onclick` dispatches a custom event `exportrequest` (parent can open ExportModal).

`SaveStatusCard.svelte` props: `lastSavedAt: string | null`.
- Shows: heading "Last Saved", relative time string. No CTA.
- If `lastSavedAt` is null: shows "Not yet saved".

`AIStatusCard.svelte` props: `apiKeyConfigured: boolean`.
- If `apiKeyConfigured`: shows a positive indicator "AI ready".
- If not: shows "No AI key configured" + `GhostButton` or inline link "Configure in Settings" → `href="/settings/ai"`.

**Acceptance checklist:**

- [ ] All four components render with mock props in Vitest (smoke test — see phase-004).
- [ ] `BackupStatusCard` shows "Never backed up" when `lastBackupAt` is null.
- [ ] `ExportReadinessCard` shows formatted word count.
- [ ] `SaveStatusCard` shows "Not yet saved" when `lastSavedAt` is null.
- [ ] `AIStatusCard` shows settings link when `apiKeyConfigured` is false.
- [ ] No new CSS primitives introduced — all tokens from design system.
- [ ] `pnpm run check` clean.

---

### Phase-003 — Hub layout integration

**Goal:** Wire the four status cards into the hub route. Add them to the existing `.hub-grid` without restructuring the grid layout.

**Files:**

- `src/routes/projects/[id]/+page.svelte` — add the four new card imports and mount them.
- `src/modules/project/index.ts` — confirm exports are present.

**Implementation:**

Import the four new cards and the `ProjectHealthSummary` type in the hub route. Add them to the `.hub-grid` after the existing three cards:

```svelte
<BackupStatusCard
  lastBackupAt={data.health.lastBackupAt}
  projectId={project.id}
/>
<ExportReadinessCard
  sceneCount={data.health.sceneCount}
  wordCount={data.health.wordCount}
  projectId={project.id}
  on:exportrequest={() => (exportModalOpen = true)}
/>
<SaveStatusCard lastSavedAt={data.health.lastSavedAt} />
<AIStatusCard apiKeyConfigured={data.health.apiKeyConfigured} />
```

Add a local `exportModalOpen = $state(false)` and mount `<ExportModal projectId={project.id} open={exportModalOpen} onClose={() => (exportModalOpen = false)} />` if `ExportModal` is available from stage-001; otherwise leave a `<!-- TODO: wire ExportModal (stage-001) -->` comment.

No new grid layout rules. The four cards reflow naturally in the existing 4-column grid.

**Acceptance checklist:**

- [ ] All four cards visible in the hub route at `/projects/{id}`.
- [ ] `data.health` is correctly passed from the loader to all four cards.
- [ ] `ExportModal` wiring point present (either connected or `TODO` comment).
- [ ] Hub route `pnpm run check` clean.
- [ ] No grid layout regressions — existing three cards still render correctly.

---

### Phase-004 — Tests

**Goal:** Unit tests for `project-health-service.ts` and component smoke tests for each of the four status cards.

**Files:**

- `tests/project/project-health-service.test.ts` — new file.
- `tests/project/hub-status-cards.test.ts` — new file.

**Implementation:**

`project-health-service.test.ts` — vi.mock `$lib/api-client.js` and `$lib/preferences.js`:

- `lastSavedAt` is the max `updatedAt` across scenes (test with scenes having different timestamps).
- `lastSavedAt` is null when scenes array is empty.
- `lastBackupAt` returns the preference value.
- `apiKeyConfigured` is `true` when credential endpoint returns `{ value: 'sk-...' }`.
- `apiKeyConfigured` is `false` when credential endpoint returns `{ value: null }`.
- `apiKeyConfigured` is `false` when credential endpoint throws.
- `wordCount` counts words after stripping HTML.
- `sceneCount` matches the scenes array length.

`hub-status-cards.test.ts` — renders each component with Testing Library's `render`. Tests:

- `BackupStatusCard` with `lastBackupAt: null` → contains "Never backed up".
- `BackupStatusCard` with a recent ISO timestamp → shows a relative date string (not "Never").
- `ExportReadinessCard` with `sceneCount: 5, wordCount: 12500` → shows "12,500" (or equivalent formatted).
- `SaveStatusCard` with `lastSavedAt: null` → contains "Not yet saved".
- `AIStatusCard` with `apiKeyConfigured: false` → contains link to `/settings/ai`.
- `AIStatusCard` with `apiKeyConfigured: true` → contains "AI ready".

**Acceptance checklist:**

- [ ] All `tests/project/project-health-service.test.ts` tests pass.
- [ ] All `tests/project/hub-status-cards.test.ts` tests pass.
- [ ] `pnpm run test` passes (full suite, no regressions).
- [ ] `pnpm run lint` clean.
- [ ] `pnpm run check` clean.

## Out of Scope

- `HubRecentActivityCard` (recently edited scenes) — deferred to a future hub enhancement.
- `HubSafetyCard` (snapshot count, integrity status) — deferred; requires snapshot count API.
- `HubNextStepCard` AI-powered suggestions — the existing `HubNextStepCard` is not modified.
- Backup "now" action in `BackupStatusCard` may be a no-op stub if the plan-017 backup client is not yet wired; the component renders correctly either way.
- Real-time autosave pulse (WebSocket / SSE for live "saved X seconds ago") — deferred.
