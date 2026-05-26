# Novellum V1 Sellable Readiness Plan

## Part 2: Product Experience, Export Quality, AI Scope, Onboarding, Documentation, QA, Licensing, Release, and Final V1 Definition

This is the second half of the V1 readiness plan. Part 1 covered the trust foundation: desktop packaging, SQLite as source of truth, Dexie removal/migration, BYOK key handling, backup/restore, migrations, autosave, and recovery.

This half covers the product layer: what the user actually experiences, what must feel polished, what must be documented, and what has to be true before you can charge money without feeling like you’re selling a dev prototype.

One limitation up front: I cannot live-browse official docs in this session, so I cannot provide fresh official-doc citations. I can include stable official documentation links to verify against during implementation. Repo citations below come from the actual Novellum repository inspection.

---

## 17. V1 Product Experience Standard

A sellable V1 does not need every planned feature. It needs a small number of things to feel complete.

The current app already has a meaningful structure: project hub, editor, AI assistant, settings, export, backup/import pieces, story structure, and worldbuilding. But several areas still feel like internal tooling or prototype wiring rather than a commercial writing product.

The V1 experience should answer these user questions clearly:

“Where is my book?”

“Is my book saved?”

“Can I get my book out?”

“Can I back it up?”

“Can I restore it?”

“Where is my API key stored?”

“What happens if AI fails?”

“What happens if the app updates?”

“Can I trust this with a real manuscript?”

Until those answers are obvious in the app, not just in documentation, Novellum is not sellable.

---

## 18. Export Must Become a Core Product Surface, Not a Utility

### Current state

The export module currently supports these formats:

```ts
export type ExportFormat = 'markdown' | 'docx' | 'epub' | 'backup_zip';
```

That appears in `src/modules/export/types.ts`. The current export options are limited to title page, chapter style, font family, font size, and line spacing. 

The export constants expose Markdown, DOCX, EPUB, and Backup ZIP, with simple format extensions and default font options. 

The actual export service dispatches Markdown, DOCX, EPUB, and backup ZIP.  The assembler pulls project, chapters, and scenes, then maps scene content into chapter scene arrays. 

That is a good early skeleton, but it is not enough for a writing product people pay for.

### What is missing

The export system currently does not treat the manuscript as a professional artifact.

Missing V1-level export concepts:

Author name.

Pen name.

Copyright year.

Front matter.

Back matter.

Dedication.

Acknowledgments.

Table of contents controls.

Manuscript format preset.

Reader copy preset.

Ebook draft preset.

Scene separator style.

Chapter start page behavior.

Paragraph indentation.

Page breaks.

Title page metadata.

Export preview.

Export validation.

HTML escaping and sanitization for EPUB.

DOCX styles instead of basic paragraph dumping.

A way to exclude planning notes from export.

A way to include or exclude scene titles.

A way to compile only selected chapters.

A way to export story bible separately.

### Why this matters

For a novelist, export is the moment of truth.

The user can tolerate a missing AI feature. They cannot tolerate exporting a messy manuscript after writing 60,000 words.

A sellable V1 does not need to match Scrivener compile. But it does need to produce clean, predictable output.

---

## 19. Export V1 Requirements

### V1 export formats

Keep these for V1:

Markdown.

DOCX.

EPUB.

Novellum backup.

But rename “Backup ZIP” in the UI. Users should not think of backup as “export format.” Backup is data safety. Export is manuscript output.

Recommended UI split:

**Manuscript Export**

Markdown.

DOCX.

EPUB.

**Project Backup**

Create `.novellum` backup.

Restore `.novellum` backup.

This matters because backup and export have different mental models.

### Required manuscript profiles

Add these presets:

```ts
type ManuscriptProfile =
  | 'standard_manuscript'
  | 'reader_copy'
  | 'ebook_draft'
  | 'plain_text_archive';
```

#### Standard manuscript

Use for agents/editors.

Expected:

12 pt Times New Roman.

Double spaced.

First-line indent.

Chapter starts on new page.

Title page optional.

No decorative scene styling.

#### Reader copy

Use for beta readers.

Expected:

Readable font.

1.15 or 1.5 spacing.

Clean chapter headings.

Optional title page.

Optional scene separators.

#### Ebook draft

Use for EPUB proofing.

Expected:

Clean HTML.

Metadata.

TOC.

Chapter breaks.

Escaped content.

#### Plain text archive

Use for durability.

Expected:

Markdown or `.txt`.

No fancy formatting.

Clean hierarchy.

---

## 20. Export Files to Change

### Current files

| File                                                      | Required V1 change                                                                                                                                               |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/export/types.ts`                             | Expand `ExportOptions`, `AssembledProject`, and `AssembledChapter` to include author metadata, profile, scene metadata, front/back matter, and compile settings. |
| `src/modules/export/constants.ts`                         | Separate manuscript formats from backup formats. Add manuscript profile options.                                                                                 |
| `src/modules/export/services/export-service.ts`           | Route manuscript export and project backup through separate service paths.                                                                                       |
| `src/modules/export/services/assembler.ts`                | Assemble full manuscript, not just title/genre/chapter scene strings.                                                                                            |
| `src/modules/export/services/markdown-driver.ts`          | Remove hardcoded `author: Unknown`; support profiles and metadata.                                                                                               |
| `src/modules/export/services/docx-driver.ts`              | Add styles, page breaks, title page, author metadata, paragraph indentation, and profile logic.                                                                  |
| `src/modules/export/services/epub-driver.ts`              | Escape HTML, add metadata, add TOC behavior, validate generated output.                                                                                          |
| `src/modules/export/components/ExportModal.svelte`        | Replace JSON-copy focused UI with real manuscript export UI or move backup JSON to advanced/debug.                                                               |
| `src/modules/export/components/ImportBackupDialog.svelte` | Move to Backup/Restore settings, not manuscript export.                                                                                                          |

### Current import/export warning

`ImportBackupDialog.svelte` currently says it restores into “this browser” and warns that it replaces existing data in the current browser.  That language confirms the product is still browser/IndexedDB-minded. V1 desktop language should say “this device” or “this Novellum library,” depending on the final architecture.

### New files to create

```text
src/modules/export/services/manuscript-assembler.ts
src/modules/export/services/manuscript-types.ts
src/modules/export/services/manuscript-profiles.ts
src/modules/export/services/text-normalization.ts
src/modules/export/services/html-escape.ts
src/modules/export/services/docx-styles.ts
src/modules/export/services/export-validation.ts
src/modules/export/components/ManuscriptExportPanel.svelte
src/modules/export/components/ExportPreview.svelte
src/modules/export/components/ExportProfilePicker.svelte
src/modules/export/components/ExportMetadataForm.svelte
src/modules/export/components/BackupPanel.svelte
tests/export/manuscript-assembler.test.ts
tests/export/markdown-export.test.ts
tests/export/docx-export.test.ts
tests/export/epub-export.test.ts
tests/export/export-validation.test.ts
```

### Suggested updated export types

```ts
export type ManuscriptExportFormat = 'markdown' | 'docx' | 'epub';
export type BackupFormat = 'novellum_backup';

export type ManuscriptProfile =
  | 'standard_manuscript'
  | 'reader_copy'
  | 'ebook_draft'
  | 'plain_text_archive';

export interface ManuscriptMetadata {
  title: string;
  subtitle?: string;
  authorName: string;
  penName?: string;
  copyrightYear?: string;
  publisher?: string;
  language?: string;
  description?: string;
}

export interface FrontMatterOptions {
  includeTitlePage: boolean;
  includeCopyrightPage: boolean;
  dedication?: string;
  acknowledgments?: string;
}

export interface ManuscriptCompileOptions {
  format: ManuscriptExportFormat;
  profile: ManuscriptProfile;
  metadata: ManuscriptMetadata;
  frontMatter: FrontMatterOptions;
  includeSceneTitles: boolean;
  includeSceneSeparators: boolean;
  chapterStyle: 'heading' | 'chapter_number' | 'both';
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  paragraphIndent: boolean;
  selectedChapterIds?: string[];
}

export interface AssembledScene {
  id: string;
  title: string;
  order: number;
  contentHtml: string;
  contentText: string;
  wordCount: number;
}

export interface AssembledChapter {
  id: string;
  title: string;
  order: number;
  summary?: string;
  scenes: AssembledScene[];
}

export interface AssembledManuscript {
  projectId: string;
  metadata: ManuscriptMetadata;
  chapters: AssembledChapter[];
  totalWordCount: number;
  compiledAt: string;
}
```

### Export V1 acceptance criteria

Export must pass these tests:

A 3-chapter project exports in correct order.

Scene order is preserved.

Empty scenes do not crash export.

HTML in scene content does not break EPUB.

User-provided `<script>` text is escaped.

DOCX opens in Microsoft Word, LibreOffice, and Google Docs.

EPUB opens in Apple Books or another EPUB reader.

Markdown includes correct title, author, and chapter headings.

Backup does not appear as just another manuscript export option.

---

## 21. Editor Must Feel Like the Product, Not a Control Room

### Current state

The editor page is doing a lot. It handles active scene state, scene definitions, quick intent, story compass, localStorage scene metadata, autosave, AI panel commands, live writing signals, POV, participants, location, progress meters, scene navigation, and editor rendering in one route component. 

That creates two problems.

First, the route component is too important. It owns too much behavior.

Second, the author experience risks feeling like a cockpit rather than a writing surface.

You already noticed this in earlier UI critiques: the editor needs to feel like a word processor, not a dev console.

### V1 editor principle

The editor should default to writing.

Everything else should be available, but not visually equal to the manuscript.

The manuscript is primary.

The story compass is secondary.

AI is tertiary.

Planning metadata is supportive.

### V1 editor layout

Recommended structure:

```text
Editor
├── Top manuscript bar
│   ├── Chapter / Scene breadcrumb
│   ├── Save status
│   ├── Word count
│   ├── Export quick action
│   └── Focus mode
├── Main writing surface
│   └── Tiptap manuscript editor
├── Left scene navigator
│   └── Collapsible
├── Right context panel
│   ├── Scene card
│   ├── POV / participants / location
│   ├── Scene goal / obstacle / turn
│   └── Snapshot history
└── AI panel
    └── Hidden until invoked
```

### V1 editor modes

Add three modes:

#### Writing mode

Minimal UI.

Manuscript centered.

Save status visible.

Word count visible.

AI hidden.

Right panel collapsed.

#### Planning mode

Scene card visible.

Goal/obstacle/outcome visible.

Participants visible.

Chapter/arc context visible.

#### Revision mode

Snapshots visible.

AI revision tools visible.

Diff/compare tools can be later, not required V1.

### Files to change

| File                                                     | Required change                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/routes/projects/[id]/editor/+page.svelte`           | Split route into smaller editor shell components.                            |
| `src/routes/projects/[id]/editor/+page.ts`               | Keep data loading, but do not push all editor behavior into route component. |
| `src/modules/editor/services/autosave-service.ts`        | Return richer save status.                                                   |
| `src/modules/editor/services/snapshot-repository.ts`     | Support listing/restoring snapshots.                                         |
| `src/modules/editor/components/ManuscriptSurface.svelte` | Make this the visual center of the editor.                                   |
| `src/lib/components/AiPanel.svelte`                      | Ensure AI panel is secondary, not always visually dominant.                  |

### Files to create

```text
src/modules/editor/components/EditorShell.svelte
src/modules/editor/components/EditorTopBar.svelte
src/modules/editor/components/SceneNavigator.svelte
src/modules/editor/components/SceneContextPanel.svelte
src/modules/editor/components/SceneCompassPanel.svelte
src/modules/editor/components/EditorModeToggle.svelte
src/modules/editor/components/FocusModeToggle.svelte
src/modules/editor/components/SaveStatus.svelte
src/modules/editor/components/WordCountBadge.svelte
src/modules/editor/components/SnapshotHistoryPanel.svelte
src/modules/editor/stores/editor-preferences.svelte.ts
src/modules/editor/services/editor-session-service.ts
src/modules/editor/services/scene-metadata-service.ts
tests/editor/editor-mode.test.ts
tests/editor/save-status.test.ts
tests/editor/scene-context.test.ts
```

### Editor V1 acceptance criteria

A user can open the editor and immediately know where to write.

The manuscript surface visually dominates the page.

The app shows whether the scene is saved.

A user can switch scenes without losing pending changes.

A user can restore a snapshot.

Focus mode removes nonessential UI.

The AI panel does not steal layout priority.

The editor still works with zero characters, zero locations, and zero scene metadata.

---

## 22. Project Hub Should Become the Command Center

### Current state

The project hub route is clean and already structured around a hero, structural metrics carousel, progress card, next step card, and details panel.  Its loader pulls scenes and writing styles, then calculates current word count from scene word counts. 

This is one of the stronger surfaces conceptually.

### V1 improvement

The hub should answer:

What am I working on?

How much have I written?

What needs attention?

What is safe?

What is the next useful action?

Add these V1 cards:

Backup status.

Last saved.

Last backup.

Export readiness.

Draft progress.

Open issues/continuity warnings.

Recent scenes.

Next writing action.

API key status.

### Files to change

| File                                                    | Required change                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/routes/projects/[id]/hub/+page.svelte`             | Add V1 trust/status cards.                                                        |
| `src/routes/projects/[id]/hub/+page.ts`                 | Load backup status, last scene update, last backup time, export readiness.        |
| `src/modules/project/components/HubProgressCard.svelte` | Ensure word count is accurate and recalculated from live scene content if needed. |
| `src/modules/project/components/HubNextStepCard.svelte` | Make next steps useful, not decorative.                                           |
| `src/modules/project/components/HubDetailsPanel.svelte` | Include metadata needed for export readiness.                                     |

### Files to create

```text
src/modules/project/components/HubBackupStatusCard.svelte
src/modules/project/components/HubExportReadinessCard.svelte
src/modules/project/components/HubRecentActivityCard.svelte
src/modules/project/components/HubSafetyCard.svelte
src/modules/project/services/project-health-service.ts
src/modules/project/services/export-readiness-service.ts
tests/project/project-health.test.ts
tests/project/export-readiness.test.ts
```

### Hub V1 acceptance criteria

From the hub, a user can tell:

Last saved.

Last backup.

Current word count.

Whether export metadata is incomplete.

Whether AI is configured.

What to do next.

How to open editor, outline, worldbuilding, export, backup.

---

## 23. Settings Must Become the Trust Center

### Current state

The settings route currently imports `ApiSettings` and presents “Integrations & Settings.” The content grid only includes the API settings component. 

That is not enough for a sellable local-first app.

### V1 settings sections

Settings should have these sections:

1. AI Provider.
2. Storage.
3. Backup and Restore.
4. Export Defaults.
5. App Preferences.
6. Privacy.
7. Updates.
8. About.

### Recommended settings structure

```text
Settings
├── AI
│   ├── Provider
│   ├── API key status
│   ├── Validate key
│   ├── Default model
│   └── Test prompt
├── Storage
│   ├── Database location
│   ├── Open data folder
│   ├── Change backup folder
│   └── Reset local data
├── Backup & Restore
│   ├── Create backup
│   ├── Restore backup
│   ├── Last backup
│   └── Auto-backup reminder
├── Export Defaults
│   ├── Author name
│   ├── Manuscript profile
│   ├── Font
│   ├── Line spacing
│   └── Chapter style
├── Privacy
│   ├── Local-first explanation
│   ├── What goes to AI provider
│   ├── What never leaves device
│   └── Backup contents
├── Updates
│   ├── Current version
│   ├── Check for updates
│   └── Release notes
└── About
    ├── Version
    ├── License
    ├── Third-party notices
    └── Support/contact
```

### Files to change

| File                                                 | Required change                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/routes/settings/+page.svelte`                   | Replace single settings grid with tabbed or sidebar settings layout.       |
| `src/modules/settings/components/ApiSettings.svelte` | Refactor into AI provider settings.                                        |
| `src/lib/stores/model-selection.svelte.ts`           | Move from localStorage to preferences/settings service.                    |
| `.env.example`                                       | Remove production-facing API key instructions after secure storage exists. |
| `novellum-docs/docs/setup-guide.md`                  | Add user-facing Settings guide.                                            |

### Files to create

```text
src/modules/settings/components/SettingsShell.svelte
src/modules/settings/components/AiProviderSettings.svelte
src/modules/settings/components/StorageSettings.svelte
src/modules/settings/components/BackupRestoreSettings.svelte
src/modules/settings/components/ExportDefaultsSettings.svelte
src/modules/settings/components/PrivacySettings.svelte
src/modules/settings/components/UpdateSettings.svelte
src/modules/settings/components/AboutSettings.svelte
src/modules/settings/services/preferences-service.ts
src/routes/api/settings/preferences/+server.ts
src/routes/api/settings/storage/+server.ts
src/routes/api/settings/about/+server.ts
tests/settings/preferences.test.ts
tests/settings/storage-settings.test.ts
```

### Settings V1 acceptance criteria

A user can find where their data is stored.

A user can create and restore a backup.

A user can see whether AI is configured.

A user can delete their API key.

A user can see what data is sent to OpenRouter.

A user can see app version and license.

---

## 24. AI Assistant V1 Scope

### Current state

The chat interface uses `OpenRouterClient`, `safeHtml`, project/file context attachments, selected model store, and a session context planner. It streams responses into the UI. 

This is promising. But V1 AI needs boundaries.

### V1 AI should do

Answer story questions.

Help brainstorm.

Help revise selected text.

Continue a scene from context.

Summarize scene/chapter/project.

Generate character/setting suggestions.

Use attached project context.

Warn when context is incomplete.

Respect user’s selected model.

Fail cleanly when no key is configured.

### V1 AI should not do yet

Automatically rewrite the manuscript without explicit accept.

Perform destructive bulk changes.

Pretend it has full project context when it does not.

Hide token/cost implications.

Use app-owned API keys.

Send data without user action.

### AI privacy requirements

Before sending a prompt, the app should make it clear:

What is being sent.

Which provider receives it.

Which model is used.

Whether attached files are included.

Whether project context is included.

This does not have to be a giant warning every time. It can be a small “Context included” pill with a hover/details popover.

### Files to change

| File                                             | Required change                                                                                                         |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `src/modules/ai/components/ChatInterface.svelte` | Add provider/model status, context disclosure, missing-key empty state, retry behavior.                                 |
| `src/lib/ai/openrouter.ts`                       | Move into provider abstraction and remove credential storage logic.                                                     |
| `src/lib/stores/model-selection.svelte.ts`       | Move to settings/preferences.                                                                                           |
| `src/routes/api/ai/+server.ts`                   | Remove app-owned env key behavior or refactor into local BYOK-only provider route.                                      |
| `src/routes/api/ai/validate-key/+server.ts`      | Keep validation but make privacy behavior explicit.                                                                     |
| `src/lib/ai/markdown.ts`                         | Keep sanitization, but expand markdown support carefully if needed. Current `safeHtml()` uses DOMPurify after parsing.  |

### Files to create

```text
src/modules/ai/components/AiProviderStatus.svelte
src/modules/ai/components/ContextDisclosure.svelte
src/modules/ai/components/MissingApiKeyState.svelte
src/modules/ai/components/AiErrorState.svelte
src/modules/ai/components/ModelPicker.svelte
src/modules/ai/services/ai-session-service.ts
src/modules/ai/services/context-disclosure-service.ts
src/lib/ai/providers/types.ts
src/lib/ai/providers/openrouter-provider.ts
tests/ai/context-disclosure.test.ts
tests/ai/missing-key-state.test.ts
tests/ai/provider-errors.test.ts
```

### AI V1 acceptance criteria

With no API key, AI UI tells the user exactly what to do.

With invalid API key, error is clear.

With no internet, error is clear.

With model unavailable, error is clear.

AI never modifies manuscript without user accepting the output.

AI context disclosure is visible before or during send.

API key is never included in backup/export/logs.

---

## 25. Onboarding Must Teach Trust First

### Problem

A local-first BYOK app has more setup friction than a normal SaaS app. That friction is not bad, but it must be explained.

If onboarding only says “create a project,” users may not understand:

Their manuscript is local.

They need their own AI key.

AI costs are handled by OpenRouter.

Backups are their responsibility.

Novellum does not automatically cloud-sync.

### V1 onboarding flow

First launch should show:

1. Welcome.
2. Local-first explanation.
3. Choose/create data location or show default.
4. Set backup reminder.
5. Optional OpenRouter key setup.
6. Create first project.
7. Optional sample project.

### Onboarding copy direction

Keep it plain:

“Novellum stores your writing on this device.”

“AI features use your own provider key.”

“Your API usage is billed by your provider, not by Novellum.”

“Backups are how you move projects between devices.”

“Create a backup before major updates.”

### Files to create

```text
src/routes/onboarding/+page.svelte
src/modules/onboarding/components/OnboardingShell.svelte
src/modules/onboarding/components/WelcomeStep.svelte
src/modules/onboarding/components/LocalFirstStep.svelte
src/modules/onboarding/components/StorageStep.svelte
src/modules/onboarding/components/BackupStep.svelte
src/modules/onboarding/components/AiKeyStep.svelte
src/modules/onboarding/components/CreateProjectStep.svelte
src/modules/onboarding/services/onboarding-service.ts
src/routes/api/onboarding/status/+server.ts
src/routes/api/onboarding/complete/+server.ts
tests/onboarding/onboarding-flow.test.ts
```

### Files to change

| File                                                 | Required change                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/routes/+layout.svelte`                          | Redirect first-run users to onboarding if not complete.                                    |
| `src/routes/projects/+page.svelte`                   | Add “start from sample” or “create first project” state.                                   |
| `src/modules/project/services/project-repository.ts` | Support sample project creation if desired.                                                |
| `src/lib/server/db/schema.ts`                        | Add app preferences/onboarding completion table if not using separate preferences storage. |

### Onboarding V1 acceptance criteria

A new user understands the local-first model before creating a project.

A new user can skip AI setup and still use the app.

A new user can create a project in under two minutes.

A new user is prompted to create a backup after meaningful work.

---

## 26. Documentation Required for Paid V1

### Current state

The README and setup guide are developer-centric. README says Node and pnpm are prerequisites and instructs `pnpm run dev`.  The setup guide likewise walks through cloning, installing, and running a dev server. 

That is fine for contributors. It is wrong as the primary user documentation.

### Required docs

Create two documentation tracks:

**User docs**

Install Novellum.

Create first project.

Set up OpenRouter.

Understand local-first storage.

Create backup.

Restore backup.

Export manuscript.

Recover previous scene version.

Move to another computer.

Troubleshooting.

Privacy.

**Developer docs**

Clone repo.

Install dependencies.

Run dev server.

Run tests.

Build desktop app.

Run migrations.

Architecture overview.

Release process.

### Files to change

| File                                | Required change                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                         | Make product intro and developer link. Do not lead with dev-server setup for customers.                                       |
| `novellum-docs/docs/setup-guide.md` | Split into user install guide and developer setup guide.                                                                      |
| `dev-docs/README.md`                | Keep developer architecture docs.                                                                                             |
| `.github/*`                         | Stop ignoring all GitHub docs/workflows if they are part of development process. `.gitignore` currently ignores `.github/*`.  |

### Files to create

```text
novellum-docs/user/install.md
novellum-docs/user/quick-start.md
novellum-docs/user/local-first.md
novellum-docs/user/openrouter-byok.md
novellum-docs/user/backups.md
novellum-docs/user/restore.md
novellum-docs/user/exporting.md
novellum-docs/user/recovery.md
novellum-docs/user/privacy.md
novellum-docs/user/troubleshooting.md
novellum-docs/developer/setup.md
novellum-docs/developer/architecture.md
novellum-docs/developer/database.md
novellum-docs/developer/release.md
```

### Documentation acceptance criteria

A non-developer can install and use Novellum from the user docs.

A developer can clone and run Novellum from developer docs.

The docs explain that BYOK means users pay their own AI provider.

The docs explain exactly where data lives.

The docs explain backup and restore.

The docs explain what is sent to AI.

---

## 27. CI/CD and Release Pipeline

### Current state

`package.json` includes useful scripts: check, lint, CSS lint, tests, coverage, visual tests, Storybook, and build. 

But I did not find a CI workflow. Also `.gitignore` currently ignores `.github/*`, which would prevent normal committed workflows unless explicitly forced. 

### Required V1 CI

Add a GitHub Actions workflow that runs:

Install dependencies.

Svelte check.

ESLint.

Stylelint.

Vitest.

Coverage.

Build.

Backup/restore tests.

Migration tests.

Export tests.

Optional Playwright smoke tests.

### Required release pipeline

Add release workflow after desktop packaging exists:

Build macOS.

Build Windows.

Build Linux if supported.

Sign/notarize where applicable.

Generate checksums.

Attach artifacts to GitHub release or private release channel.

Generate release notes.

Run post-build smoke test.

### Files to create

```text
.github/workflows/ci.yml
.github/workflows/release.yml
.github/workflows/visual-tests.yml
.github/dependabot.yml
scripts/release/check-version.mjs
scripts/release/generate-notes.mjs
scripts/release/verify-artifacts.mjs
```

### Files to change

| File             | Required change                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `.gitignore`     | Remove broad `.github/*` ignore. Add targeted ignores only. Add `coverage/`.                                    |
| `package.json`   | Add `ci`, `test:unit`, `test:integration`, `test:export`, `test:backup`, `test:migration`, `release:*` scripts. |
| `README.md`      | Add build status once CI exists.                                                                                |
| `pnpm-lock.yaml` | Keep committed and stable.                                                                                      |

### Suggested scripts

```json
{
  "scripts": {
    "ci": "pnpm run check && pnpm run lint && pnpm run lint:css && pnpm run test && pnpm run build",
    "test:backup": "vitest run tests/backup",
    "test:migration": "vitest run tests/sqlite/migrations",
    "test:export": "vitest run tests/export",
    "test:editor": "vitest run tests/editor",
    "release:check": "node scripts/release/check-version.mjs"
  }
}
```

### CI acceptance criteria

No release can be cut unless:

Type check passes.

Lint passes.

Tests pass.

Build passes.

Backup/restore tests pass.

Migration tests pass.

Export tests pass.

---

## 28. Licensing, Payment, and Activation

### Current state

The repo is public according to GitHub metadata.  I did not find a `LICENSE` file during inspection.

That matters before selling.

### Decision required

You need to decide whether Novellum is:

Closed source commercial.

Source-available commercial.

Open-core.

Open source with paid builds.

Private repo product.

Do not leave this ambiguous.

### My recommendation

For your situation:

Keep the commercial product closed-source or source-available.

Do not casually MIT-license it if you intend to sell one-time licenses.

You can still keep internal/dev docs and prompt packs in a private repo.

### Payment options

For V1, keep payment simple.

Practical one-time purchase platforms:

Gumroad.

Lemon Squeezy.

Paddle.

Stripe Payment Links plus manual license email.

For a solo builder, Lemon Squeezy or Gumroad is probably less operational work.

### Activation strategy

You have two choices.

#### Option A: No activation

User buys and downloads.

Pros:

Simple.

Local-first friendly.

No licensing server.

Cons:

Easy to share.

Less control.

Best for early founder license.

#### Option B: Lightweight license key

User enters license key.

App validates occasionally.

Pros:

Basic piracy deterrent.

Can support updates.

Cons:

Requires licensing backend.

Can conflict with local-first expectations.

For V1, I’d start with **no activation or lightweight license file**, not heavy DRM. The app’s real audience is authors who want trust. Overbuilding licensing can make the app feel hostile.

### Files to create

```text
LICENSE
NOTICE.md
SECURITY.md
PRIVACY.md
TERMS.md
EULA.md
novellum-docs/user/license.md
src/modules/settings/components/LicenseSettings.svelte
src/routes/api/settings/license/+server.ts
```

### Files to change

| File                               | Required change                                                          |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `package.json`                     | Add correct license field or omit if proprietary and document elsewhere. |
| `README.md`                        | Clarify commercial/license status.                                       |
| `src/routes/settings/+page.svelte` | Add About/License section.                                               |

### Licensing acceptance criteria

A user knows what they bought.

A user knows whether updates are included.

A user knows whether they can install on multiple devices.

A user knows whether source code access is included.

A user knows how to get support.

---

## 29. Privacy and Trust Copy

### Required privacy promise

Novellum should have a plain privacy page in the app and docs.

It should say:

Your projects are stored locally.

Your backups are created locally.

Your AI key is stored locally/securely.

When you use AI, selected prompt/context is sent to your chosen AI provider.

Novellum does not include API keys in backups.

Novellum does not cloud-sync your manuscript.

If update checks exist, explain what is sent.

If telemetry exists, disclose it. Prefer no telemetry in V1.

### Files to create

```text
PRIVACY.md
src/modules/settings/components/PrivacySettings.svelte
novellum-docs/user/privacy.md
```

### Privacy acceptance criteria

The user can answer:

Where is my writing?

Where is my API key?

What leaves my device?

What is included in backup?

What happens when I use AI?

---

## 30. Error Handling and Empty States

### Problem

A paid app must handle normal failure without feeling broken.

Examples:

No API key.

Invalid API key.

OpenRouter down.

No internet.

No projects.

No scenes.

No chapters.

Export failed.

Restore failed.

Corrupt backup.

Database locked.

Migration failed.

Autosave failed.

### Required error behavior

Each error should have:

Plain-English message.

Cause if known.

Next action.

Retry if possible.

Support/log option if needed.

No raw stack traces to normal users.

### Files to create

```text
src/lib/errors/app-error.ts
src/lib/errors/error-map.ts
src/lib/components/errors/ErrorNotice.svelte
src/lib/components/errors/RecoveryAction.svelte
src/lib/server/errors/logging.ts
tests/errors/error-map.test.ts
```

### Files to change

| File                                                      | Required change                                          |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `src/lib/api-client.ts`                                   | Map API errors to structured app errors.                 |
| `src/routes/+error.svelte`                                | Make global error page useful.                           |
| `src/modules/ai/components/ChatInterface.svelte`          | Replace raw error append with structured AI error state. |
| `src/modules/export/components/ImportBackupDialog.svelte` | Improve corrupt/unsupported backup guidance.             |
| `src/modules/export/components/ExportModal.svelte`        | Improve export failure guidance.                         |

### Error acceptance criteria

A nontechnical user knows what to do after each common failure.

---

## 31. Worldbuilding V1 Scope Control

You have a lot of worldbuilding ambition: personae, atlas, archive, threads, chronicles, realms, landmarks, myths, technology, traditions, arcs, subplots, motivations.

That is good for the long-term vision.

For V1, the question is not “is every surface finished?”

The question is:

**Does every included surface save reliably, look consistent, and feed the manuscript/AI context correctly?**

If not, hide it from V1 navigation.

### V1 worldbuilding rule

Only ship a worldbuilding surface if it passes:

Consistent layout.

SQLite persistence.

Create/edit/delete.

Project-scoped query.

Export/backup inclusion.

AI context inclusion if relevant.

No old simple forms mixed with new structured forms.

No fake fields that do not persist.

No “coming soon” dead ends in primary nav.

### Required V1 worldbuilding surfaces

Minimum viable:

Characters.

Locations.

Lore.

Plot threads.

Timeline.

Arcs.

Acts/chapters/scenes integration.

Everything else can be “Labs” or hidden.

### Files to audit

```text
src/routes/projects/[id]/worldbuilding/*
src/routes/projects/[id]/personae/*
src/routes/projects/[id]/atlas/*
src/routes/projects/[id]/archive/*
src/routes/projects/[id]/threads/*
src/routes/projects/[id]/chronicles/*
src/modules/bible/*
src/modules/worldbuilding/*
src/modules/project/*
src/lib/server/db/schema.ts
src/routes/api/db/characters/*
src/routes/api/db/locations/*
src/routes/api/db/lore_entries/*
src/routes/api/db/plot_threads/*
src/routes/api/db/timeline_events/*
```

### V1 worldbuilding acceptance criteria

Every visible worldbuilding field persists.

Every visible worldbuilding record is included in backup.

No surface uses a different visual grammar without reason.

No surface has prototype-only form layout.

No surface creates data that export/backup ignores.

---

## 32. Navigation and Information Architecture

### V1 navigation should be simple

Recommended project-level navigation:

Hub.

Editor.

Outline.

Worldbuilding.

AI.

Export.

Settings.

Backup should be accessible from Hub, Export, and Settings, but conceptually live in Settings/Safety.

### Avoid navigation bloat

Do not expose every submodule as a top-level nav item.

For example:

Worldbuilding can contain Characters, Locations, Lore, Timeline, Threads.

Outline can contain Arcs, Acts, Chapters, Scenes, Beats.

AI can contain Chat and Behavior/Styles if stable.

### Files to audit/change

```text
src/routes/projects/[id]/+layout.svelte
src/routes/projects/[id]/+layout.ts
src/lib/components/navigation/*
src/lib/components/Sidebar*
src/modules/project/*
src/modules/worldbuilding/*
src/modules/editor/*
```

### Navigation acceptance criteria

A new user understands where to go.

A writer can get from Hub to writing in one click.

Backup is discoverable.

Export is discoverable.

Settings are discoverable.

AI setup is discoverable when AI is unavailable.

---

## 33. Visual Consistency and Design System Freeze

You have already cared a lot about UI consistency. For V1, you need to freeze the design system enough that coding agents stop inventing one-off patterns.

### Required design system artifacts

Buttons.

Inputs.

Textareas.

Selects.

Cards.

Panels.

Modals.

Tabs.

Sidebars.

Empty states.

Error notices.

Toasts.

Page headers.

Toolbars.

Badges/chips.

Meters/progress.

Dialogs.

### Files to audit

```text
src/lib/components/ui/*
src/lib/styles/*
src/app.css
tailwind.config.*
src/modules/*/components/*
src/routes/**/*.svelte
```

### Current evidence

The app already uses shared UI imports such as `PageHeader`, `SurfacePanel`, `PrimaryButton`, `SecondaryButton`, and others in places like settings and API settings.  

That is good. The problem is likely not “no components.” The problem is inconsistent application across pages.

### V1 rule

No route-level custom card/input/button styling unless it composes a shared primitive.

### Files to create

```text
src/lib/components/ui/ErrorNotice.svelte
src/lib/components/ui/SettingsSection.svelte
src/lib/components/ui/Toolbar.svelte
src/lib/components/ui/StatusBadge.svelte
src/lib/components/ui/ConfirmDialog.svelte
src/lib/components/ui/FileDropzone.svelte
src/lib/components/ui/Stepper.svelte
src/lib/components/ui/SegmentedControl.svelte
src/lib/components/ui/MetadataRow.svelte
```

### Tests/checks

Keep your visual token checker and Storybook. `package.json` already includes `check:tokens`, `test:visual`, `storybook`, and `build-storybook`. 

Add Storybook coverage for:

Settings panels.

Export modal.

Backup restore dialog.

Editor save status.

Project hub cards.

Empty states.

Error states.

---

## 34. QA Matrix for V1

A sellable V1 needs a practical QA matrix.

### Platforms

Minimum:

macOS Apple Silicon.

Windows 11.

Optional later:

Linux.

### Core flows

#### First launch

Install app.

Open app.

Complete onboarding.

Create project.

Close app.

Reopen app.

Project remains.

#### BYOK

Open Settings.

Add OpenRouter key.

Validate key.

Select model.

Send test prompt.

Delete key.

AI disables.

#### Writing

Create chapter.

Create scene.

Write text.

Switch scene.

Return.

Text remains.

Kill app mid-writing.

Reopen.

Text saved or recovery offered.

#### Backup

Create backup.

Verify file exists.

Delete local project.

Restore backup.

Project returns.

#### Export

Export Markdown.

Export DOCX.

Export EPUB.

Open exported files.

Confirm title, author, chapter order.

#### Migration

Open older test DB.

Migration runs.

Data intact.

Backup created before migration.

#### Error cases

Invalid API key.

No internet.

Corrupt backup.

Unsupported backup version.

Database locked.

Export with missing metadata.

No scenes.

No chapters.

### Files to create

```text
tests/e2e/first-launch.spec.ts
tests/e2e/create-project.spec.ts
tests/e2e/editor-autosave.spec.ts
tests/e2e/backup-restore.spec.ts
tests/e2e/export-manuscript.spec.ts
tests/e2e/settings-ai-key.spec.ts
tests/e2e/error-states.spec.ts
tests/fixtures/projects/basic-novel.json
tests/fixtures/projects/large-novel.json
tests/fixtures/backups/valid-v1.novellum
tests/fixtures/backups/corrupt.novellum
```

### QA acceptance criteria

A release candidate must pass the QA matrix before it is tagged.

---

## 35. Performance Requirements

A writing app does not need flashy performance. It needs to avoid lag while typing and avoid freezing during export/backup.

### V1 performance targets

Typing should not lag in a 5,000-word scene.

Scene switching should feel immediate under normal project size.

Project hub should load under two seconds for a normal project.

Backup should show progress for large projects.

Export should show progress.

AI streaming should not block editor input.

Large project target for V1 testing:

100 chapters.

500 scenes.

150 characters.

150 locations/lore entries.

100,000 to 150,000 manuscript words.

### Files to audit

```text
src/routes/projects/[id]/editor/+page.svelte
src/modules/editor/components/ManuscriptSurface.svelte
src/modules/editor/services/autosave-service.ts
src/modules/export/services/*
src/lib/server/db/schema.ts
src/lib/server/db/client.ts
src/routes/api/db/*
```

### Performance tasks

Add indexes for common queries.

Avoid loading all project data into editor if not needed.

Avoid recomputing word count across all scenes on every keystroke.

Debounce expensive analysis.

Move export/backup to async progress flow.

Avoid creating snapshots too aggressively.

Current autosave creates a snapshot after every successful non-empty flush.  Snapshot repository trims to 20 snapshots.  That is acceptable early, but V1 should avoid creating near-duplicate snapshots every few seconds if a user writes continuously.

### Acceptance criteria

No typing lag in normal scenes.

No UI freeze during export.

No UI freeze during backup.

No runaway snapshot growth.

---

## 36. App Versioning and Update Policy

### Required V1 versioning

Use semantic versioning:

`1.0.0`

Before paid V1:

`0.9.0-beta.1`

`0.9.0-beta.2`

`1.0.0-rc.1`

`1.0.0`

### App version should appear in

Settings → About.

Backup manifest.

Export metadata optionally.

Error reports.

Release notes.

### Files to change

| File                                                    | Required change                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `package.json`                                          | Set real version progression. Currently version is `0.0.1`.                          |
| `src/modules/export/services/portability/zip-export.ts` | Stop hardcoding app version. Current backup code hardcodes `APP_VERSION = '0.1.0'`.  |
| `src/routes/settings/+page.svelte`                      | Add About section.                                                                   |
| `src/lib/server/backup/manifest.ts`                     | Include app version from a canonical source.                                         |

### Files to create

```text
src/lib/version.ts
src/routes/api/settings/about/+server.ts
scripts/version/sync-version.mjs
CHANGELOG.md
```

### Update policy

For paid V1, define:

Are updates free for 1 year?

Are all 1.x updates included?

Is 2.0 paid?

Does founder license include lifetime updates?

My recommendation:

Founder license: lifetime 1.x updates.

Standard license: all 1.x updates.

Major upgrades TBD.

Keep it simple.

---

## 37. Public Website and Sales Page

A one-time BYOK app needs clear positioning. Do not bury the local-first angle.

### Sales page headline options

Option 1:

**A local-first writing workspace for novelists who want AI help without giving up their manuscript.**

Option 2:

**Plan, draft, and export your novel in a private local workspace with your own AI key.**

Option 3:

**Novellum is a local-first novel production app for writers who want structure, continuity, and BYOK AI assistance.**

### What to avoid

Avoid “write a bestseller with AI.”

Avoid “AI-powered everything.”

Avoid “revolutionary.”

Avoid “never lose your story” unless backup/recovery is extremely solid.

Avoid promising cloud sync if it does not exist.

### Sales page sections

1. Hero.
2. Local-first promise.
3. BYOK explanation.
4. Author workspace screenshots.
5. Planning/story bible.
6. Editor.
7. Export.
8. Backup/restore.
9. Pricing.
10. FAQ.
11. Privacy.
12. Download.

### FAQ questions

Does Novellum write the book for me?

Where is my manuscript stored?

Do I need an OpenRouter key?

Do I pay for AI usage separately?

Can I use Novellum offline?

Can I export DOCX?

Can I back up my project?

Can I move projects between computers?

Is there cloud sync?

Can I get a refund?

### Files to create if website lives in repo

```text
marketing/index.md
marketing/pricing.md
marketing/faq.md
marketing/privacy.md
marketing/screenshots/README.md
```

---

## 38. Beta Program Before Paid V1

Do not go straight from private dev to $79 public release.

Run a small beta.

### Beta target

10 to 25 writers.

Prefer people who actually write fiction.

Give them a concrete task:

Create a project.

Add structure.

Write at least 2,000 words.

Use AI once.

Export DOCX.

Create backup.

Restore backup.

Report friction.

### Beta success criteria

At least 80% can install without help.

At least 80% can create a project.

At least 80% understand BYOK after onboarding.

At least 80% can export.

At least 80% can create backup.

Zero manuscript-loss bugs.

Zero credential leaks.

### Files to create

```text
beta/BETA_TEST_PLAN.md
beta/FEEDBACK_FORM.md
beta/KNOWN_ISSUES.md
beta/RELEASE_NOTES_TEMPLATE.md
```

### Beta feedback categories

Install.

First-run clarity.

Project creation.

Editor feel.

Save trust.

AI setup.

AI usefulness.

Export quality.

Backup confidence.

Visual polish.

Confusing labels.

Missing must-have feature.

---

## 39. Pricing Readiness

From the previous assessment, a solid V1 likely fits:

Early beta: $29.

Solid V1: $49 to $79.

Polished V1.5: $99 to $129.

Mature version: $149 to $199.

For your first paid V1, I still think:

**$59 Founder License**

Then later:

**$89 or $99 Standard License**

Do not price above $99 until:

Desktop packaging is clean.

Backup/restore is proven.

Export feels good.

Docs are strong.

Support burden is understood.

The app has beta evidence.

### Pricing page must say

One-time purchase.

BYOK: AI provider costs not included.

Local-first.

No cloud sync in V1.

Export included.

Backup/restore included.

Supported platforms.

Update policy.

Refund policy.

---

## 40. V1 Definition of Done

This is the master checklist.

Do not call it V1 until this is true.

### Install

* [ ] App installs on supported OS.
* [ ] App launches without terminal.
* [ ] User does not need Node.
* [ ] User does not need pnpm.
* [ ] App version visible in Settings.
* [ ] App has icon/name/metadata.

### Data

* [ ] SQLite is source of truth.
* [ ] Project-owned data is not scattered in localStorage.
* [ ] Dexie is removed from V1 runtime or legacy-only.
* [ ] Database path is in app data folder.
* [ ] Migrations are versioned.
* [ ] Migration failure is safe.
* [ ] Backup created before risky migration.

### BYOK

* [ ] API key is not in localStorage.
* [ ] API key is not logged.
* [ ] API key is not backed up.
* [ ] API key can be deleted.
* [ ] Invalid key error is clear.
* [ ] Missing key state is clear.
* [ ] OpenRouter usage responsibility is explained.

### Editor

* [ ] Writing surface is primary.
* [ ] Autosave status visible.
* [ ] Last saved time visible.
* [ ] Snapshot restore exists.
* [ ] Failed save does not discard text.
* [ ] Focus mode exists.
* [ ] Scene switching is safe.
* [ ] AI does not dominate the editor.

### Project hub

* [ ] Shows word count.
* [ ] Shows last saved/updated.
* [ ] Shows backup status.
* [ ] Shows export readiness.
* [ ] Shows next useful action.
* [ ] Can navigate to writing quickly.

### Export

* [ ] Markdown export works.
* [ ] DOCX export works.
* [ ] EPUB export works.
* [ ] Author metadata supported.
* [ ] Chapter order correct.
* [ ] Scene order correct.
* [ ] HTML is escaped.
* [ ] Export preview or validation exists.
* [ ] Backup is not confused with manuscript export.

### Backup/restore

* [ ] Backup is built from SQLite.
* [ ] Backup includes all project-owned tables.
* [ ] Backup excludes credentials.
* [ ] Restore preview exists.
* [ ] Restore-as-copy exists.
* [ ] Restore-over-existing warns clearly.
* [ ] Corrupt backup fails safely.
* [ ] Version mismatch is handled.
* [ ] Backup/restore tests pass.

### Settings

* [ ] AI settings.
* [ ] Storage settings.
* [ ] Backup/restore settings.
* [ ] Export defaults.
* [ ] Privacy.
* [ ] Updates.
* [ ] About/license.

### Docs

* [ ] User install guide.
* [ ] Quick start.
* [ ] BYOK guide.
* [ ] Backup guide.
* [ ] Restore guide.
* [ ] Export guide.
* [ ] Privacy guide.
* [ ] Troubleshooting.
* [ ] Developer setup separated.

### Release

* [ ] CI exists.
* [ ] Type check passes.
* [ ] Lint passes.
* [ ] Tests pass.
* [ ] Build passes.
* [ ] Export tests pass.
* [ ] Backup tests pass.
* [ ] Migration tests pass.
* [ ] Release artifacts generated.
* [ ] Checksums generated.
* [ ] Release notes written.

### Legal/commercial

* [ ] License chosen.
* [ ] EULA or terms written.
* [ ] Privacy statement written.
* [ ] Third-party notices included.
* [ ] Payment flow selected.
* [ ] Refund policy written.
* [ ] Update policy written.

---

## 41. Recommended V1 Implementation Roadmap

### Stage 1: Product safety

Do before UI polish.

```text
1. Remove credential logging.
2. Add CI.
3. Add coverage/ to .gitignore.
4. Freeze Dexie.
5. Build SQLite backup.
6. Build SQLite restore.
7. Add migration runner.
8. Add save status.
9. Add snapshot restore.
10. Add Settings trust sections.
```

### Stage 2: Desktop app

```text
1. Choose Tauri/Electron.
2. Add desktop scaffold.
3. Resolve app data path.
4. Package app.
5. Create installer.
6. Add About/version.
7. Test install/reopen.
```

### Stage 3: Export quality

```text
1. Add manuscript metadata.
2. Add export profiles.
3. Improve assembler.
4. Improve Markdown.
5. Improve DOCX.
6. Improve EPUB.
7. Add export tests.
8. Add export preview/readiness.
```

### Stage 4: Editor V1 polish

```text
1. Split editor route.
2. Add editor modes.
3. Make writing surface primary.
4. Add focus mode.
5. Add safe scene switching.
6. Add snapshot panel.
7. Clean right panel.
```

### Stage 5: Onboarding/docs

```text
1. First-run onboarding.
2. User docs.
3. Privacy docs.
4. BYOK docs.
5. Backup docs.
6. Export docs.
7. Troubleshooting.
```

### Stage 6: Beta

```text
1. Package beta.
2. Recruit 10 to 25 testers.
3. Run install/write/export/backup/restore test.
4. Fix manuscript-loss bugs first.
5. Fix install friction second.
6. Fix export issues third.
7. Then polish UI.
```

---

## 42. Coding Agent Prompt for Part 2 Work

Use this after Part 1 foundation work is underway.

```md
You are working in the Novellum repository. Continue preparing Novellum for a sellable V1 as a local-first one-time-purchase BYOK desktop app.

Do not add new worldbuilding scope. Do not add new speculative AI features. Focus on making the existing product feel complete, trustworthy, and commercially usable.

Context:
- Part 1 focused on desktop packaging, SQLite as source of truth, Dexie migration/removal, secure BYOK handling, backup/restore, migrations, autosave, and recovery.
- Part 2 focuses on export quality, editor experience, settings, onboarding, documentation, QA, release, licensing, and V1 definition of done.

Primary goals:
1. Upgrade export from a utility into a dependable manuscript compilation feature.
2. Separate manuscript export from project backup.
3. Add manuscript metadata: author name, pen name, copyright year, front matter, export profile.
4. Improve Markdown, DOCX, and EPUB export quality.
5. Refactor the editor route into a writing-first shell.
6. Add visible save status, focus mode, and snapshot history UI.
7. Expand Settings into the trust center: AI, storage, backup, export defaults, privacy, updates, about.
8. Add first-run onboarding.
9. Create user-facing docs separate from developer docs.
10. Add CI/release workflows and QA coverage.
11. Add license/privacy/security docs before public sale.

Implementation rules:
- Keep changes staged and reviewable.
- Do not rewrite the entire app at once.
- Do not introduce new storage paths for project-owned data.
- Do not store API keys in project backup.
- Do not expose backup as just another manuscript export format.
- Do not ship visible worldbuilding surfaces unless every field persists and is included in backup.
- Prefer shared UI primitives over route-level custom UI.

Stage 1: Export separation
- Split manuscript export from project backup in UI and service naming.
- Update `src/modules/export/types.ts` with manuscript metadata and profile types.
- Update `src/modules/export/constants.ts` to separate manuscript formats from backup actions.
- Update `src/modules/export/services/assembler.ts` or replace it with `manuscript-assembler.ts`.
- Add tests for chapter order, scene order, empty scenes, and metadata.

Stage 2: Export drivers
- Update Markdown export to include real author metadata.
- Update DOCX export to use styles, page breaks, and paragraph formatting.
- Update EPUB export to escape HTML safely and include metadata.
- Add export validation tests.

Stage 3: Editor product experience
- Break `src/routes/projects/[id]/editor/+page.svelte` into smaller components:
  - EditorShell
  - EditorTopBar
  - SceneNavigator
  - SceneContextPanel
  - SceneCompassPanel
  - SaveStatus
  - SnapshotHistoryPanel
- Add writing/planning/revision modes.
- Add focus mode.
- Keep manuscript surface visually primary.

Stage 4: Settings trust center
- Replace the single settings grid with a SettingsShell.
- Add sections for AI, Storage, Backup & Restore, Export Defaults, Privacy, Updates, and About.
- Keep API key handling routed through the secure credential abstraction from Part 1.
- Add storage location display and backup actions.

Stage 5: Onboarding
- Add first-run onboarding route.
- Explain local-first storage, BYOK AI, backup responsibility, and project creation.
- Allow users to skip AI setup.

Stage 6: Documentation
- Rewrite README so it no longer reads primarily as a dev-server setup guide.
- Create user docs:
  - install
  - quick start
  - local-first
  - OpenRouter/BYOK
  - backups
  - restore
  - exporting
  - recovery
  - privacy
  - troubleshooting
- Move developer setup into developer docs.

Stage 7: QA/release
- Add GitHub Actions CI.
- Run check, lint, CSS lint, tests, build.
- Add export, backup, migration, and editor recovery tests.
- Add release checklist and beta test plan.

Stage 8: Commercial readiness
- Add LICENSE or commercial license strategy.
- Add PRIVACY.md.
- Add SECURITY.md.
- Add NOTICE.md.
- Add EULA/TERMS if selling directly.
- Add About page with version/license/update policy.

Before marking V1 complete:
- Run the full V1 definition-of-done checklist.
- Verify install, write, save, reopen, export, backup, delete, restore.
- Verify no API key appears in logs, backups, exports, or localStorage.
```

---

## 43. Final Sellable V1 Standard

Here is the blunt version.

Novellum V1 is sellable when it can survive this exact demo:

Install Novellum on a clean machine.

Open it.

Complete onboarding.

Create a novel.

Add a chapter.

Add three scenes.

Write 2,000 words.

Add two characters.

Add one location.

Ask AI for help using the user’s OpenRouter key.

Accept AI text manually.

Close the app.

Reopen it.

Everything is still there.

Export DOCX.

Open the DOCX.

Create a backup.

Delete the local project.

Restore from backup.

Everything comes back.

Remove the API key.

Create another backup.

Confirm the API key is not inside it.

That is the V1 trust test.

Once Novellum passes that, you can charge for it. Before that, the risk is not “missing features.” The risk is asking writers to trust the app before the app has earned it.
