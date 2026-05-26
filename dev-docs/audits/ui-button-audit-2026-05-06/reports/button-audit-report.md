# UI Button Audit Report

Date: 2026-05-06
Auditor: GitHub Copilot (GPT-5.3-Codex)
Environment: Local preview build (`pnpm build` + `pnpm run preview --host --port 4173`)
Scope: Buttons and navigation links across onboarding, home/library, reader, project hub/editor/worldbuilding, and global settings.

## Critical Findings

### 1) Project "Settings" link routes to a non-existent page (404)

- Location: Left sidebar -> LAST PROJECT -> Settings
- Expected: Open a valid settings page (project settings if route exists, otherwise app settings)
- Actual: Navigates to `/projects/<id>/settings`, which returns 404 and the app error view
- Impact: Hard dead-end from a primary navigation control
- Evidence:

  - [404 screen](../screenshots/18-project-settings-link-404.png)

### 2) Export actions do not open an export dialog/workflow

- Locations:

  - Left sidebar -> LAST PROJECT -> Export
  - Hub page -> Export button

- Expected: Open export modal/workflow
- Actual: No dialog appears (`role=dialog` count 0, `dialog[open]` count 0)
- Additional signal: Hub export click logs a runtime error (`props_invalid_value`)
- Impact: Core export path appears broken from two visible entry points
- Evidence:

  - [Sidebar export result](../screenshots/16-export-button-result.png)
  - [Hub export result](../screenshots/17-hub-export-button-result.png)

## High Findings

### 3) "Help & Docs" label is misleading for destination

- Location: Sidebar footer -> Help & Docs
- Expected: A help/docs destination (documentation center or docs route)
- Actual: Links to `/settings`, which lands on Settings (Appearance)
- Impact: User intent mismatch (label implies docs, destination is settings)
- Evidence:

  - [Settings destination screenshot](../screenshots/14-settings-tab-appearance.png)

### 4) Project "AI" nav label duplicates Editor destination and does not open AI panel

- Location: Left sidebar -> LAST PROJECT -> AI
- Expected: AI-focused destination or AI panel open state
- Actual: Navigates to the same editor route as "Editor" (`/projects/<id>/editor`), with no AI/Nova panel automatically opened
- Impact: Label ambiguity and possible user confusion
- Evidence:

  - [AI link lands on editor](../screenshots/15-ai-link-lands-editor-no-panel-open.png)

## Medium Findings

### 5) Navigation state updates before route content fully settles

- Observed behavior: Active nav highlighting changes before the new route content appears in snapshots
- Impact: Feels like misnavigation or flicker on slower transitions
- Notes: Routes eventually resolve, but transitional UX is confusing during click-to-load moments

## Passed Checks (Not Broken)

- Onboarding:

  - `Skip all` successfully exits onboarding to library
  - Evidence: [Onboarding step 1](../screenshots/10-onboarding-step-1.png), [Library after onboarding](../screenshots/11-home-after-onboarding.png)

- Home/Reader:

  - `Open Manuscript` opens reader
  - Reader `← Library` returns to books library route (`/books?library=1`)
  - Evidence: [Reader from Open Manuscript](../screenshots/12-reader-from-open-manuscript.png)

- New project action:

  - Topbar `New project` opens creation dialog on books route (`/books?create=1`)

- Settings category tabs:

  - Appearance, Defaults, Shortcuts, AI, Data, Backup, Export Defaults, Privacy, Updates, About all resolve to their routes after transition
  - Evidence: [Settings tab screenshots](../screenshots/14-settings-tab-about.png)

## Recommendations

1. Fix project settings route target.

- Option A: Point LAST PROJECT -> Settings to `/settings`.
- Option B: Implement `/projects/[id]/settings` route if project-scoped settings are intended.

1. Repair export entry points.

- Wire both export triggers to a working modal/open handler.
- Add integration tests that assert dialog open on both buttons.
- Investigate and fix `props_invalid_value` runtime error on hub export click.

1. Resolve label/destination mismatches.

- Either route `Help & Docs` to actual docs, or rename it to `Settings`.
- Either make `AI` open Nova panel/state, or relabel to `Editor (AI tools)`.

1. Smooth route transition UX.

- Defer active-state highlight until navigation commits, or add clear loading state on target content.

## Screenshot Inventory (fresh run)

- [10-onboarding-step-1.png](../screenshots/10-onboarding-step-1.png)
- [11-home-after-onboarding.png](../screenshots/11-home-after-onboarding.png)
- [12-reader-from-open-manuscript.png](../screenshots/12-reader-from-open-manuscript.png)
- [14-settings-tab-appearance.png](../screenshots/14-settings-tab-appearance.png)
- [14-settings-tab-ai.png](../screenshots/14-settings-tab-ai.png)
- [14-settings-tab-about.png](../screenshots/14-settings-tab-about.png)
- [15-ai-link-lands-editor-no-panel-open.png](../screenshots/15-ai-link-lands-editor-no-panel-open.png)
- [16-export-button-result.png](../screenshots/16-export-button-result.png)
- [17-hub-export-button-result.png](../screenshots/17-hub-export-button-result.png)
- [18-project-settings-link-404.png](../screenshots/18-project-settings-link-404.png)
