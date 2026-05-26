---
title: Settings Trust Center
slug: stage-004-settings-trust-center
stage_number: 4
status: complete
owner: Architect Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-nav-expansion-and-routes
  - phase-002-backup-restore-section
  - phase-003-export-defaults-section
  - phase-004-about-privacy-updates
estimated_duration: 5d
risk_level: medium
---

## Goal

Extend the settings IA delivered by plan-022 from five categories into a full trust center. Add Backup & Restore, Export Defaults, Privacy, Updates, and About sections. Authors can find where their data lives, create or restore a backup, configure export defaults, understand what is sent to OpenRouter, and see the app version — all without leaving settings.

## Context (already in tree — do not duplicate)

**What plan-022 already delivered — do not re-implement:**

- `src/routes/settings/+layout.svelte` — PillNav with five tabs: Appearance, Defaults, Shortcuts, AI, Data. Active tab driven by `page.url.pathname`. Uses `PillNav` primitive + `goto`.
- `src/routes/settings/+page.ts` — redirect to `/settings/appearance`.
- `/settings/appearance/+page.svelte` — `ThemeSelector`, editor font size, line spacing (reads/writes via `appearance` store → preferences service).
- `/settings/defaults/+page.svelte` — home page, reader view, project type, default AI model (reads/writes via `defaults` store and `model-selection` store → preferences service).
- `/settings/shortcuts/+page.svelte` — keyboard binding customization via `src/lib/keyboard/index.js`.
- `/settings/ai/+page.svelte` — OpenRouter panel (key entry, status) + coming-soon Ollama / LM Studio stubs.
- `/settings/data/+page.svelte` — Dexie → SQLite data migration/portability surface.
- `app_preferences` SQLite table exists (schema in `src/lib/server/db/schema.ts` line 339).
- `src/lib/server/preferences/preferences-service.ts` — `getPreference`, `setPreference`, `deletePreference` (server-side).
- `src/lib/preferences.ts` — `getPreference<T>(key, default)`, `setPreference<T>(key, value)` (client helper, SSR-safe).
- `src/lib/components/ui/PillNav.svelte` — the tab-nav primitive used in the settings layout. Do not modify its contract.
- `src/modules/export/components/ImportBackupDialog.svelte` — currently in the export module. Backup & Restore section will host this dialog or a similar surface.

**What this stage adds (the gap):**

- Five new route pages: `/settings/backup`, `/settings/export-defaults`, `/settings/privacy`, `/settings/updates`, `/settings/about`.
- PillNav expansion to include the five new tabs.
- Backup & Restore section — surfaces the backup/restore workflow (using existing backup service infrastructure or a stub with `TODO` annotation if plan-017 backup API not yet available).
- Export Defaults section — persists default profile, format, and metadata fields via the preferences service.
- About, Privacy, Updates pages.

## Entry Criteria

- plan-022 (Settings IA) status `complete` — the five-category shell, layout, and all existing category pages are in the tree (already true).
- `src/lib/preferences.ts` client helper available (already true).
- `pnpm run check` and `pnpm run lint` pass on the current tree.

## Exit Criteria

- `src/routes/settings/+layout.svelte` PillNav expanded to ten tabs: Appearance, Defaults, Shortcuts, AI, Data, **Backup**, **Export Defaults**, **Privacy**, **Updates**, **About**. Active tab detection and `goto` routing work for all ten.
- New route pages exist (Svelte 5 Runes):
  - `/settings/backup/+page.svelte` — Backup & Restore section (see phase-002).
  - `/settings/export-defaults/+page.svelte` — Export Defaults section (see phase-003).
  - `/settings/privacy/+page.svelte` — Privacy notice (see phase-004).
  - `/settings/updates/+page.svelte` — Updates section (see phase-004).
  - `/settings/about/+page.svelte` — About section (see phase-004).
- `export-defaults.svelte.ts` store persists default profile and format via preferences service.
- Tests pass:
  - `tests/settings/settings-backup-page.test.ts` — backup page renders expected headings.
  - `tests/settings/settings-export-defaults.test.ts` — preference round-trip for default profile.
  - `tests/settings/settings-about-page.test.ts` — About page renders app name and version.
- `pnpm run check` clean; `pnpm run lint` clean (`eslint-plugin-boundaries` passes).
- Acceptance scenario: a user can navigate to Settings and find, from the tab nav: where data is stored, how to create/restore a backup, what export defaults are set, what data is sent to OpenRouter (Privacy), the app version (About).

## Phases

### Phase-001 — Nav expansion and routes

**Goal:** Expand the settings PillNav with five new tabs and create stub pages for each new category. Zero behavior change to existing categories.

**Files:**

- `src/routes/settings/+layout.svelte` — add five items to the PillNav `items` array.
- `src/routes/settings/backup/+page.svelte` — new stub.
- `src/routes/settings/export-defaults/+page.svelte` — new stub.
- `src/routes/settings/privacy/+page.svelte` — new stub.
- `src/routes/settings/updates/+page.svelte` — new stub.
- `src/routes/settings/about/+page.svelte` — new stub.

**Implementation:**

In `+layout.svelte`, extend the `items` array:

```ts
const items = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'defaults', label: 'Defaults' },
  { id: 'shortcuts', label: 'Shortcuts' },
  { id: 'ai', label: 'AI' },
  { id: 'data', label: 'Data' },
  { id: 'backup', label: 'Backup' },
  { id: 'export-defaults', label: 'Export Defaults' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'updates', label: 'Updates' },
  { id: 'about', label: 'About' },
];
```

The `activeId` derivation reads the last segment of `page.url.pathname` — verify the existing logic handles multi-segment slugs like `export-defaults` correctly. If `pathname.split('/').at(-1)` is used, `export-defaults` will resolve correctly as-is.

Each stub page:

```svelte
<svelte:head><title>{Category} — Novellum</title></svelte:head>
<h1>{Category}</h1>
<p>Coming in plan-018 stage-004 phase-NNN.</p>
```

**Acceptance checklist:**

- [ ] All ten tabs render in the PillNav at `/settings/appearance`.
- [ ] Clicking each new tab navigates to the correct sub-route.
- [ ] Active tab highlights correctly for each of the ten routes.
- [ ] Existing five category pages still render without regression.
- [ ] `pnpm run check` clean; `pnpm run lint` clean.

---

### Phase-002 — Backup and Restore section

**Goal:** Replace the stub at `/settings/backup` with a real Backup & Restore page — the canonical home for backup creation, backup history, and restore operations.

**Files:**

- `src/routes/settings/backup/+page.svelte` — replace stub with full content.
- `src/routes/settings/backup/+page.ts` — loader (if async data needed).

**Implementation:**

The Backup & Restore page should answer:
- "When was the last backup made?"
- "How do I create a backup now?"
- "How do I restore from a backup file?"

Page structure:
1. **Last backup status** — reads `'backup.lastCompletedAt'` from preferences via `getPreference`. Shows formatted date or "No backups yet".
2. **Create backup** — `PrimaryButton` "Create backup" that calls the existing backup service (from `src/modules/export/services/project-backup-client.ts` or equivalent). If the backup client requires a `projectId`, display per-project backup CTAs or document that backup is available per-project from the hub (and this page shows the app-level backup preference). Add `TODO: wire project-level backup when plan-017 backup API is available` if the server-side backup is not yet ready.
3. **Restore from file** — mounts `ImportBackupDialog.svelte` (already exists in `src/modules/export/components/`). Trigger via `SecondaryButton` "Restore from backup file…" which opens the dialog.
4. **Storage location** — `<p>` explaining that project data is stored in a local SQLite database at the app data directory. Link to `/settings/data` for migration tools.

Use `SurfaceCard variant="flat"` for each section. No new CSS primitives.

If plan-017 backup server-side infrastructure (e.g., `POST /api/backup/create`) is not yet available, stub the "Create backup" button with a `disabled` state and a `TODO` comment. The page structure is final; the wiring is the variable.

**Acceptance checklist:**

- [ ] Page renders "No backups yet" when `backup.lastCompletedAt` preference is absent.
- [ ] "Restore from backup file" button opens `ImportBackupDialog`.
- [ ] Storage location paragraph present.
- [ ] `pnpm run check` clean.
- [ ] `tests/settings/settings-backup-page.test.ts` — heading "Backup & Restore" present; "Restore from backup file" button present.

---

### Phase-003 — Export Defaults section

**Goal:** Persist export defaults (default profile and format) via the preferences service. Authors set these once in settings and the `ExportModal` pre-selects them on open.

**Files:**

- `src/routes/settings/export-defaults/+page.svelte` — replace stub with full content.
- `src/lib/stores/export-defaults.svelte.ts` — new store (mirrors pattern of `appearance.svelte.ts`).

**Implementation:**

`export-defaults.svelte.ts`:

```ts
import { getPreference, setPreference } from '$lib/preferences.js';
import type { ManuscriptProfileId } from '$modules/export/types.js';

export type ExportFormatDefault = 'markdown' | 'docx' | 'epub';

interface ExportDefaults {
  profileId: ManuscriptProfileId;
  format: ExportFormatDefault;
}

const DEFAULTS: ExportDefaults = { profileId: 'standard_manuscript', format: 'markdown' };
const PREF_KEY = 'export.defaults';

function createExportDefaults() {
  let profileId = $state<ManuscriptProfileId>('standard_manuscript');
  let format = $state<ExportFormatDefault>('markdown');

  async function hydrate() {
    const saved = await getPreference<ExportDefaults>(PREF_KEY, DEFAULTS);
    profileId = saved.profileId;
    format = saved.format;
  }

  async function setProfile(next: ManuscriptProfileId) {
    profileId = next;
    await setPreference(PREF_KEY, { profileId, format });
  }

  async function setFormat(next: ExportFormatDefault) {
    format = next;
    await setPreference(PREF_KEY, { profileId, format });
  }

  return {
    get profileId() { return profileId; },
    get format() { return format; },
    hydrate, setProfile, setFormat,
  };
}

export const exportDefaults = createExportDefaults();
```

Note: `ManuscriptProfileId` type is defined in `src/modules/export/types.ts` (added in stage-001). If stage-001 has not shipped yet, import from the stub location or inline the type as `string` with a `TODO` comment.

`/settings/export-defaults/+page.svelte`:
- Calls `void exportDefaults.hydrate()` in `onMount`.
- Section 1 — Default Profile: four radio cards (one per profile) binding to `exportDefaults.profileId`.
- Section 2 — Default Format: three radio buttons (Markdown / DOCX / EPUB) binding to `exportDefaults.format`.
- No Save button — each change auto-saves via `setProfile`/`setFormat`.

**Acceptance checklist:**

- [ ] `export-defaults.svelte.ts` exported from `src/lib/stores/`.
- [ ] Page renders four profile options and three format options.
- [ ] Changing a selection persists immediately (call to `setPreference` on each change).
- [ ] `hydrate()` restores previously saved values.
- [ ] `tests/settings/settings-export-defaults.test.ts` — mock `getPreference`; assert hydrate populates store; assert `setProfile` calls `setPreference`.
- [ ] `pnpm run check` clean; `pnpm run lint` clean.

---

### Phase-004 — About, Privacy, and Updates pages

**Goal:** Replace the three remaining stubs with real content pages. Minimal logic — these are mostly static with one dynamic read (app version).

**Files:**

- `src/routes/settings/about/+page.svelte` — replace stub.
- `src/routes/settings/about/+page.ts` — server load for version info.
- `src/routes/settings/privacy/+page.svelte` — replace stub.
- `src/routes/settings/updates/+page.svelte` — replace stub.
- `src/routes/api/settings/about/+server.ts` — new API route (returns version + build info).

**Implementation:**

**About page:**

Create `src/routes/api/settings/about/+server.ts`:

```ts
import { json } from '@sveltejs/kit';
import { version } from '$app/environment';

export const GET = () =>
  json({
    appName: 'Novellum',
    version: version ?? 'dev',
    license: 'Proprietary — All rights reserved',
    buildDate: import.meta.env.VITE_BUILD_DATE ?? 'unknown',
  });
```

`/settings/about/+page.ts` loader: fetches `/api/settings/about`, returns `{ appName, version, license, buildDate }`.

`/settings/about/+page.svelte`: Shows app name, version badge, license, copyright year. Include a small tagline ("The writing companion built for fiction authors."). No external links.

**Privacy page:**

Static content. Sections:
1. "What data is stored locally" — SQLite database on your device, no cloud sync.
2. "What is sent to OpenRouter" — scene context included in prompts (sent over HTTPS, subject to OpenRouter's privacy policy). Link text only, no external href in the rendered HTML — author it as: "See OpenRouter's privacy policy at openrouter.ai/privacy".
3. "What data is never transmitted" — project files, local preferences, backup archives.

Use `SurfaceCard variant="flat"` per section. Copy is reviewed in stage-011 (legal/privacy) before V1 lock — mark each section with a `<!-- LEGAL_REVIEW_REQUIRED -->` HTML comment.

**Updates page:**

- Heading "Updates".
- `<p>` "You are running Novellum {version}."
- `<p>` "Novellum is distributed as a standalone app. Updates are delivered as new releases. Check the release notes for the latest version." (No auto-update machinery in this stage — that is a future task.)
- `SecondaryButton` "Check for updates" — `disabled` with `title="Auto-update not yet available"` and a `TODO` comment.

**Acceptance checklist:**

- [ ] About page renders app name and version from the API route.
- [ ] Privacy page has all three sections with `<!-- LEGAL_REVIEW_REQUIRED -->` comments.
- [ ] Updates page shows current version string.
- [ ] `tests/settings/settings-about-page.test.ts` — mocks the API route; asserts "Novellum" heading and version string present.
- [ ] `pnpm run check` clean; `pnpm run lint` clean.
- [ ] `pnpm run test` passes (full suite, no regressions).

## Out of Scope

- Auto-update machinery (Tauri updater integration) — deferred to a dedicated maintenance plan.
- Legal review of Privacy and About copy — owned by stage-011.
- Backup creation server-side infrastructure (e.g., `POST /api/backup/create`) — owned by plan-017 stage-004; this stage only surfaces the UI shell.
- `ExportModal` integration into Backup page — backup creates a `.novellum.zip`; manuscript export is in stage-001. These are separate flows.
- Ollama / LM Studio activation in the AI category — out of scope per plan-022 scope definition; parked in roadmap.
- Preferences migration utilities (clearing/resetting all prefs) — deferred.
