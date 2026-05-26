Below is **Part 1 of 2**. I’m making this the “foundation and trust layer” half because that is what determines whether Novellum can be sold at all.

I cannot live-verify official external documentation in this session because web access is disabled, so I am not going to fake fresh official-doc citations. I included stable official documentation links as references to verify during implementation, and I cited your repo directly where I inspected actual files.

# Novellum V1 Sellable Readiness Plan

## Part 1: Product Foundation, Packaging, Storage, BYOK, Backup, Recovery, and Release Spine

## 0. Current Reality Check

Novellum is not yet a sellable one-time BYOK app. It is currently a SvelteKit local development app with promising product surfaces.

The repo currently presents itself as a local-first AI-assisted novel workspace built with SvelteKit and Svelte 5, with SQLite via `/api/db/*` listed as the primary data layer and Dexie still listed for portability/import-export. The README’s setup flow is `pnpm install`, `pnpm run dev`, then opening `localhost:5173` in a browser.  The user setup guide also tells people to install Node, install pnpm, clone the repo, run dependencies, run the dev server, and open `localhost:5173`. 

That cannot be the V1 commercial experience.

A sellable V1 means a normal author can:

Download Novellum.

Install it.

Open it without a terminal.

Create a project.

Write.

Use their own OpenRouter key.

Close the app.

Reopen the app.

See their work intact.

Export their manuscript.

Back up the whole project.

Restore it on another machine.

Understand where their data lives.

Trust that Novellum will not quietly lose their book.

That is the bar.

---

## 1. V1 Product Definition

### V1 sellable promise

Novellum V1 should be sold as:

**A local-first novel production workspace with BYOK AI assistance, structured story planning, manuscript drafting, backup/restore, and dependable export.**

Do not sell it as “AI writes your novel.”

Sell it as:

**Your novel stays local. Your AI key stays yours. Your story structure, manuscript, and worldbuilding live in one workspace.**

### V1 should include

The V1 feature set should be intentionally boring and trustworthy:

1. Desktop installable app.
2. Local SQLite project storage.
3. Secure BYOK key handling.
4. Project hub.
5. Editor with autosave and recovery.
6. Structured planning: arcs, acts, chapters, scenes, beats.
7. Worldbuilding surfaces already present, but only if they save cleanly.
8. AI assistant using user-owned OpenRouter key.
9. Export to Markdown, DOCX, EPUB.
10. Full project backup and restore.
11. First-run onboarding.
12. User-facing docs.
13. Basic settings.
14. Release pipeline.
15. Error states that do not scare normal users.

### V1 should not include yet

Push these out of V1 unless they already work cleanly:

1. Cloud sync.
2. Marketplace/templates store.
3. Collaboration.
4. Publishing integrations.
5. Wattpad direct publishing.
6. Advanced RAG.
7. Multi-provider billing.
8. Mobile app.
9. Plugin system.
10. Full AI agent workflows that alter files automatically.

The product needs trust before breadth.

---

## 2. Official Documentation References to Verify During Implementation

I cannot confirm these pages live in this session, but these are the official/stable docs you should use while implementing.

### Desktop packaging

Tauri official docs:
[https://v2.tauri.app/](https://v2.tauri.app/)

Tauri security docs:
[https://v2.tauri.app/security/](https://v2.tauri.app/security/)

Tauri updater docs:
[https://v2.tauri.app/plugin/updater/](https://v2.tauri.app/plugin/updater/)

Tauri filesystem/plugin docs:
[https://v2.tauri.app/plugin/file-system/](https://v2.tauri.app/plugin/file-system/)

Electron official docs, if choosing Electron instead:
[https://www.electronjs.org/docs/latest/](https://www.electronjs.org/docs/latest/)

Electron security checklist:
[https://www.electronjs.org/docs/latest/tutorial/security](https://www.electronjs.org/docs/latest/tutorial/security)

### SvelteKit

SvelteKit adapters:
[https://svelte.dev/docs/kit/adapters](https://svelte.dev/docs/kit/adapters)

SvelteKit adapter-node:
[https://svelte.dev/docs/kit/adapter-node](https://svelte.dev/docs/kit/adapter-node)

SvelteKit environment variables:
[https://svelte.dev/docs/kit/$env-static-private](https://svelte.dev/docs/kit/$env-static-private)
[https://svelte.dev/docs/kit/$env-dynamic-private](https://svelte.dev/docs/kit/$env-dynamic-private)
[https://svelte.dev/docs/kit/$env-static-public](https://svelte.dev/docs/kit/$env-static-public)

SvelteKit form/actions and load docs:
[https://svelte.dev/docs/kit/load](https://svelte.dev/docs/kit/load)
[https://svelte.dev/docs/kit/form-actions](https://svelte.dev/docs/kit/form-actions)

### SQLite

SQLite official WAL documentation:
[https://sqlite.org/wal.html](https://sqlite.org/wal.html)

SQLite foreign keys:
[https://sqlite.org/foreignkeys.html](https://sqlite.org/foreignkeys.html)

SQLite backup API reference:
[https://sqlite.org/backup.html](https://sqlite.org/backup.html)

SQLite transactions:
[https://sqlite.org/lang_transaction.html](https://sqlite.org/lang_transaction.html)

### OpenRouter

OpenRouter API docs:
[https://openrouter.ai/docs](https://openrouter.ai/docs)

OpenRouter chat completions docs:
[https://openrouter.ai/docs/api-reference/chat-completion](https://openrouter.ai/docs/api-reference/chat-completion)

OpenRouter authentication docs:
[https://openrouter.ai/docs/api-reference/authentication](https://openrouter.ai/docs/api-reference/authentication)

### Testing and release

GitHub Actions official docs:
[https://docs.github.com/en/actions](https://docs.github.com/en/actions)

GitHub Actions Node.js guide:
[https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs](https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs)

Playwright official docs:
[https://playwright.dev/docs/intro](https://playwright.dev/docs/intro)

Vitest official docs:
[https://vitest.dev/guide/](https://vitest.dev/guide/)

---

## 3. Decision 1: Make Novellum a Real Desktop App

### Problem

Right now, Novellum is not packaged as an app. It is a SvelteKit project. The `package.json` has development/build/test/storybook scripts, but no desktop packaging script, no installer script, no signing flow, and no release script.  The Svelte config uses `@sveltejs/adapter-node`, which makes sense for a server runtime, but not by itself for a polished desktop app. 

There is also no Tauri/Electron packaging evidence in the repo search. I found no `src-tauri`, no `tauri.conf`, and no Electron builder/forge setup.

### Recommendation

Use **Tauri** unless you hit a hard blocker.

Why Tauri fits Novellum:

It supports a desktop app wrapper.

It has a smaller app footprint than Electron in many cases.

It can give you controlled filesystem access.

It can use OS-level APIs through plugins.

It fits the “local-first private writing app” brand.

Where this may break down:

Your current app uses SvelteKit server routes and `better-sqlite3`. Tauri works best when you move privileged/backend behavior into Rust commands or carefully run a local sidecar/backend. If you want to keep a Node server embedded, Electron may be easier.

### V1 decision rule

If your priority is **faster packaging with current Node/SvelteKit server behavior**, choose Electron.

If your priority is **lean local-first desktop app with better long-term posture**, choose Tauri and refactor the backend boundary.

My recommendation:

**Use Tauri, but accept that this forces a cleaner architecture.**

That is good pain.

### Files to change

| File                                | Action                                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `package.json`                      | Add desktop scripts: `desktop:dev`, `desktop:build`, `desktop:preview`, `release:local`.                    |
| `svelte.config.js`                  | Revisit adapter strategy. For Tauri, likely move toward static output or a controlled local backend design. |
| `vite.config.ts`                    | Add desktop-safe build settings after packaging decision.                                                   |
| `.gitignore`                        | Stop ignoring all `.github/*` once CI/release workflows exist. Keep generated Tauri targets ignored.        |
| `README.md`                         | Replace dev-only setup as the primary flow with install/use docs. Keep dev setup separate.                  |
| `novellum-docs/docs/setup-guide.md` | Split into “User Setup” and “Developer Setup.”                                                              |

### Files to create if choosing Tauri

| New file/path                         | Purpose                                 |
| ------------------------------------- | --------------------------------------- |
| `src-tauri/tauri.conf.json`           | Tauri app configuration.                |
| `src-tauri/Cargo.toml`                | Rust package definition.                |
| `src-tauri/src/main.rs`               | Tauri app bootstrap.                    |
| `src-tauri/capabilities/default.json` | Least-privilege app permissions.        |
| `src-tauri/icons/*`                   | App icons.                              |
| `src-tauri/build.rs`                  | Tauri build hook.                       |
| `src/lib/desktop/*`                   | Frontend abstraction over desktop APIs. |
| `src/lib/platform/platform.ts`        | Detect web/dev/desktop mode.            |

### V1 acceptance criteria

Novellum must:

Launch by double-clicking.

Not expose `localhost` to the user.

Not require Node or pnpm for normal users.

Persist data between launches.

Have a predictable app data location.

Export files using native save dialogs or a clean browser-compatible fallback.

Display app version in Settings → About.

---

## 4. Decision 2: SQLite Must Become the Only Project Source of Truth

### Problem

The repo has two storage worlds.

There is a Dexie database in `src/lib/db/index.ts`. It defines browser IndexedDB tables for projects, chapters, scenes, beats, characters, locations, arcs, assets, milestones, and more.  The Dexie schema is versioned up to V12. 

There is also a SQLite database in `src/lib/server/db/client.ts`, using `better-sqlite3`, `NOVELLUM_DB_PATH`, WAL mode, foreign keys, and migrations.  The SQLite schema is much broader and includes projects, chapters, scenes, beats, characters, relationships, locations, lore, plot threads, timelines, consistency issues, export settings, snapshots, story frames, acts, arcs, writing styles, templates, system prompts, chat instructions, stages, and milestones. 

The README says SQLite is primary and Dexie is for portability/import-export.  But the backup/export portability system still reads from Dexie, not SQLite. 

That is the most dangerous V1 blocker.

### Why this matters

A novelist does not care which database is “primary.” They care whether their manuscript survives.

If Novellum stores live project data in SQLite but exports backup data from Dexie, then backup can be incomplete or stale. That is an app-killing trust problem.

### Required V1 architecture

Use this rule:

**All project-owned data lives in SQLite.**

That includes:

Projects.

Chapters.

Scenes.

Scene content.

Scene planning metadata.

Beats.

Stages.

Acts.

Arcs.

Milestones.

Characters.

Relationships.

Locations.

Lore.

Plot threads.

Timeline events.

Writing styles.

Templates.

System prompts.

Chat instructions.

Export settings.

Scene snapshots.

Assets or asset references.

### What can stay outside SQLite

Only these things should stay outside SQLite:

1. User API keys, stored in OS secure storage.
2. Window size/layout preference if truly app-level.
3. Recently opened project ID if not project-critical.
4. Non-critical UI preferences.

Even then, store preferences deliberately, not scattered through localStorage.

### Files to change

| File                                      | Current issue                                                                                          | Required change                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `src/lib/db/index.ts`                     | Dexie database still exists as active data layer.                                                      | Deprecate for V1 desktop, or isolate behind `legacyIndexedDb.ts` migration-only module. |
| `src/lib/db/schema.ts`                    | Dexie schema continues to grow.                                                                        | Stop adding new product tables here. Mark frozen.                                       |
| `src/lib/db/types.ts`                     | Comment says “Dexie schema version 2,” but the same types are now used across SQLite and app modules.  | Rename/comment as canonical domain types, not Dexie types.                              |
| `src/lib/server/db/client.ts`             | Uses `./novellum.db` fallback.                                                                         | In desktop mode, resolve DB path to app data directory, not project root.               |
| `src/lib/server/db/schema.ts`             | Main SQLite schema exists.                                                                             | Treat as canonical V1 schema. Add missing fields for metadata/backup/export.            |
| `src/lib/server/db/migrations.ts`         | Migration file has many ad hoc `ensureColumn` functions.                                               | Move to explicit versioned migrations.                                                  |
| `src/lib/factories/repository-factory.ts` | Generic API repository layer is fine, but hides schema guarantees.                                     | Keep, but add validation schemas per entity.                                            |
| `src/lib/api-client.ts`                   | Client fetch wrapper accepts schemas but most calls do not use them.                                   | Require Zod validation for all critical API responses.                                  |

### Files to create

| New file                                                   | Purpose                                                           |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| `src/lib/db/domain-types.ts`                               | Canonical app entity types independent of storage implementation. |
| `src/lib/server/db/migration-runner.ts`                    | Ordered migration runner using schema version table.              |
| `src/lib/server/db/migrations/0001_initial.ts`             | Initial SQLite schema migration.                                  |
| `src/lib/server/db/migrations/0002_worldbuilding.ts`       | Characters/locations/lore/worldbuilding migrations.               |
| `src/lib/server/db/migrations/0003_story-structure.ts`     | Arcs/acts/stages/milestones migrations.                           |
| `src/lib/server/db/migrations/0004_ai-settings.ts`         | Writing styles, templates, prompts, chat instructions.            |
| `src/lib/server/db/migrations/0005_export-and-recovery.ts` | Export profiles, snapshots, backup metadata.                      |
| `src/lib/server/db/schema-version.ts`                      | Reads/writes current DB schema version.                           |
| `src/lib/server/db/backup-snapshot.ts`                     | SQLite snapshot builder.                                          |
| `src/lib/server/db/restore-snapshot.ts`                    | SQLite restore engine.                                            |
| `src/lib/server/db/integrity.ts`                           | PRAGMA checks, orphan checks, project integrity checks.           |
| `src/lib/server/db/path.ts`                                | Resolves DB path by environment: dev/test/desktop.                |

### V1 acceptance criteria

Run this scenario:

Create project.

Add arc.

Add act.

Add chapter.

Add scene.

Write 1,000 words.

Add character.

Add location.

Add lore.

Add custom writing style.

Add system prompt.

Close app.

Reopen app.

All data remains.

Export backup.

Delete local database.

Restore backup.

All data returns.

If any project-owned data is missing, V1 is not sellable.

---

## 5. Decision 3: Migrate or Remove Dexie

### Problem

Dexie is currently not just a historical artifact. It is still imported by backup/export services.

The portability snapshot builder imports `db` from `$lib/db/index.js`, meaning Dexie, and snapshots Dexie tables.  The restore service also restores into Dexie.  The JSON export modal prepares export data by calling `buildPortabilitySnapshot(projectId)`, which again means Dexie. 

That means the visible export UI is currently pointed at the wrong storage layer for V1.

### Required change

Dexie should be moved into a **legacy migration path only**.

Do not delete it immediately if users/dev builds may have data in IndexedDB. Instead:

1. Rename the active Dexie module conceptually to legacy.
2. Add an IndexedDB-to-SQLite migration screen.
3. Run migration once.
4. Mark migration complete.
5. Stop using Dexie for active app export/backup.
6. Remove Dexie from V1 runtime if possible.

### Actual files to change

| File                                                          | Action                                                                                   |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/lib/db/index.ts`                                         | Rename exports or move to `src/lib/legacy/dexie/index.ts`.                               |
| `src/lib/db/schema.ts`                                        | Move to `src/lib/legacy/dexie/schema.ts`.                                                |
| `src/modules/export/services/portability/snapshot-service.ts` | Replace Dexie snapshot logic with SQLite snapshot API call.                              |
| `src/modules/export/services/portability/restore-service.ts`  | Replace Dexie restore logic with SQLite restore API call.                                |
| `src/modules/export/components/ExportModal.svelte`            | Stop calling Dexie snapshot directly. Call `/api/backup/project/:id` or service wrapper. |
| `src/routes/settings/migrate/+page.svelte`                    | Convert into real legacy IndexedDB migration UI.                                         |
| `package.json`                                                | Remove `dexie` and `fake-indexeddb` only after migration tests are complete.             |

### New files to create

| File                                                      | Purpose                                          |
| --------------------------------------------------------- | ------------------------------------------------ |
| `src/lib/legacy/dexie/index.ts`                           | Frozen legacy Dexie database access.             |
| `src/lib/legacy/dexie/schema.ts`                          | Frozen legacy Dexie schema.                      |
| `src/lib/legacy/dexie/export.ts`                          | Reads IndexedDB for one-time migration.          |
| `src/lib/legacy/dexie/to-sqlite.ts`                       | Converts legacy records into canonical entities. |
| `src/routes/api/migration/indexeddb-to-sqlite/+server.ts` | Migration endpoint if needed.                    |
| `tests/migration/indexeddb-to-sqlite.test.ts`             | Proves old Dexie data migrates into SQLite.      |

### V1 acceptance criteria

There should be no V1 feature that depends on Dexie for current project state.

Search should pass:

`grep -R "from '$lib/db/index" src`

Allowed results should only be legacy migration files or shared types if you keep types there temporarily.

---

## 6. Decision 4: Fix Project Backup and Restore

### Problem

The current backup system is not aligned with the SQLite source of truth.

The backup zip exporter uses `buildPortabilitySnapshot(projectId)`.  That function reads from Dexie.  The restore service restores to Dexie. 

The current snapshot table list also excludes important SQLite tables:

Writing styles.

Templates.

System prompts.

Chat instructions.

Stages.

Milestones are in SQLite and types, but backup version constants suggest drift.

Assets.

Potential future export profiles.

The backup archive hardcodes `APP_VERSION = '0.1.0'` and `CURRENT_DB_SCHEMA_VERSION = 8`, while Dexie is already at schema V12 and SQLite has its own schema reality. 

That mismatch needs to be fixed.

### Required V1 backup format

Create a proper `.novellum` backup file.

Suggested format:

`project-title_2026-04-26.novellum`

Internally it can still be a ZIP.

Required ZIP contents:

```text
manifest.json
db/projects.json
db/chapters.json
db/scenes.json
db/beats.json
db/stages.json
db/characters.json
db/character_relationships.json
db/locations.json
db/lore_entries.json
db/plot_threads.json
db/timeline_events.json
db/consistency_issues.json
db/export_settings.json
db/scene_snapshots.json
db/story_frames.json
db/acts.json
db/arcs.json
db/milestones.json
db/writing_styles.json
db/templates.json
db/system_prompts.json
db/chat_instructions.json
assets/
checksums.json
```

### Manifest requirements

`manifest.json` should include:

```json
{
  "format": "novellum.project.backup",
  "formatVersion": 1,
  "appVersion": "1.0.0",
  "schemaVersion": 1,
  "exportedAt": "ISO_DATE",
  "project": {
    "id": "uuid",
    "title": "Project Title",
    "type": "novel"
  },
  "tables": {
    "projects": 1,
    "chapters": 10,
    "scenes": 48
  },
  "compatibility": {
    "minAppVersion": "1.0.0",
    "createdBy": "Novellum"
  }
}
```

### Required restore behavior

Restore should support:

1. Restore as same project.
2. Restore as copy with new project ID.
3. Detect version mismatch.
4. Show preview before import.
5. Validate checksums.
6. Validate required tables.
7. Refuse corrupted archives.
8. Rebuild indexes if needed.
9. Run inside a transaction.
10. Roll back on failure.

### Files to change

| File                                                          | Required change                                                                                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src/modules/export/services/portability/snapshot-service.ts` | Replace Dexie snapshot with SQLite-backed snapshot call.                                                                             |
| `src/modules/export/services/portability/zip-export.ts`       | Update schema version, app version source, table list, manifest format, `.novellum` file extension.                                  |
| `src/modules/export/services/portability/restore-service.ts`  | Replace Dexie transaction with SQLite restore transaction.                                                                           |
| `src/modules/export/components/ExportModal.svelte`            | Rename from “Export Project JSON” to “Backup Project.” JSON copy can remain as a developer option hidden behind advanced/debug mode. |
| `src/modules/export/services/export-service.ts`               | Keep `backup_zip`, but route it through the new SQLite backup service.                                                               |
| `src/lib/server/db/schema.ts`                                 | Add backup metadata if needed.                                                                                                       |
| `src/lib/server/db/migrations.ts`                             | Add migration for backup metadata only if required.                                                                                  |

### Files to create

| File                                             | Purpose                                        |
| ------------------------------------------------ | ---------------------------------------------- |
| `src/routes/api/backup/projects/[id]/+server.ts` | Build and download project backup from SQLite. |
| `src/routes/api/restore/preview/+server.ts`      | Upload backup and return manifest/preview.     |
| `src/routes/api/restore/project/+server.ts`      | Restore backup into SQLite.                    |
| `src/lib/server/backup/build-project-backup.ts`  | Reads all project rows from SQLite.            |
| `src/lib/server/backup/manifest.ts`              | Creates and validates manifest.                |
| `src/lib/server/backup/checksums.ts`             | SHA-256 checksums.                             |
| `src/lib/server/backup/table-registry.ts`        | Canonical list of project tables.              |
| `src/lib/server/restore/parse-backup.ts`         | Parses uploaded archive.                       |
| `src/lib/server/restore/validate-backup.ts`      | Validates manifest, schema, checksums.         |
| `src/lib/server/restore/restore-project.ts`      | Transactional restore.                         |
| `tests/backup/project-backup.test.ts`            | Backup includes all expected tables.           |
| `tests/backup/project-restore.test.ts`           | Restore fully reconstructs a project.          |
| `tests/backup/corrupt-backup.test.ts`            | Corrupt backup fails safely.                   |

### V1 acceptance criteria

The following must be true:

Backup is built from SQLite.

Restore writes to SQLite.

Every table in the canonical schema is either included or explicitly excluded with a reason.

Project restore works after deleting the local database.

Backup file does not include API keys.

Backup file does not include machine-specific paths unless deliberately included.

Backup/restore tests run in CI.

---

## 7. Decision 5: Secure BYOK API Key Handling

### Problem

The current BYOK handling is not commercially acceptable.

The settings component stores the OpenRouter API key in browser `localStorage` using `novellum_openrouter_key`.  The OpenRouter client reads from localStorage or `VITE_OPENROUTER_API_KEY`.  It also logs a preview of the key to console. 

The `/api/ai/+server.ts` route has a separate server-side OpenRouter path that imports `OPENROUTER_API_KEY` from SvelteKit private env and returns a mock response if missing. 

That means Novellum currently has two competing AI credential paths:

Client-side user key.

Server-side env key.

For BYOK, that needs to become one product story.

### Required V1 behavior

The user should enter their own key in Settings.

Novellum should validate it.

Novellum should store it securely.

Novellum should never send it to your server.

Novellum should never include it in backups.

Novellum should never log it.

Novellum should explain that OpenRouter usage is billed through the user’s OpenRouter account.

### Recommended architecture

Create a provider abstraction:

```ts
interface AiProvider {
  id: string;
  label: string;
  validateKey(key: string): Promise<AiKeyValidationResult>;
  listModels?(key: string): Promise<ModelOption[]>;
  complete(request: AiCompletionRequest): Promise<AiCompletionResponse>;
  stream(request: AiCompletionRequest): AsyncGenerator<string>;
}
```

Then implement:

`OpenRouterProvider`

Later:

`OllamaProvider`

`AnthropicProvider`

`OpenAIProvider`

But V1 can ship only OpenRouter.

### Files to change

| File                                                 | Current issue                                                       | Required change                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/modules/settings/components/ApiSettings.svelte` | Stores API key in localStorage.                                     | Replace with secure credential service calls. Do not expose stored key after saving. Show masked status only. |
| `src/lib/ai/openrouter.ts`                           | Reads key from localStorage/env and logs key preview.               | Remove localStorage read. Remove key logs. Accept key from secure provider service or backend command.        |
| `src/routes/api/ai/+server.ts`                       | Uses server env key and mock response path.                         | Remove or refactor into BYOK-only route. Do not use app-owned key.                                            |
| `src/routes/api/ai/validate-key/+server.ts`          | Accepts key and validates against OpenRouter.                       | Keep logic, but ensure this runs locally only in desktop mode.                                                |
| `.env.example`                                       | Mentions `VITE_OPENROUTER_API_KEY`.                                 | Remove Vite-exposed key for production. Keep only dev/test env notes if needed.                               |
| `src/lib/stores/model-selection.svelte.ts`           | Stores selected model in localStorage and has one hardcoded model.  | Move selected model to app preferences table or settings service. Expand model registry.                      |

### Files to create

| File                                           | Purpose                                           |
| ---------------------------------------------- | ------------------------------------------------- |
| `src/lib/ai/providers/types.ts`                | Provider interfaces.                              |
| `src/lib/ai/providers/openrouter-provider.ts`  | OpenRouter implementation.                        |
| `src/lib/ai/credential-service.ts`             | Frontend credential abstraction.                  |
| `src/lib/server/credentials/secure-store.ts`   | Secure storage adapter for desktop mode.          |
| `src/routes/api/settings/ai-key/+server.ts`    | Save/delete/test key locally.                     |
| `src/routes/api/settings/ai-status/+server.ts` | Returns masked status: configured/not configured. |
| `src/routes/api/ai/models/+server.ts`          | Returns available models from provider.           |
| `tests/ai/credential-redaction.test.ts`        | Ensures keys are not logged or returned.          |
| `tests/ai/openrouter-provider.test.ts`         | Provider behavior tests with mocked fetch.        |

### Critical rule

Delete this behavior:

```ts
console.log('[OpenRouterClient] Stream request with API key:', keyPreview);
```

A paid app should never log any part of a credential.

### V1 acceptance criteria

API key is not in localStorage.

API key is not in project backup.

API key is not in console logs.

API key is not stored in SQLite project tables.

Settings page shows “OpenRouter connected” without revealing the full key.

Deleting the key disables AI cleanly.

Invalid key returns a useful error.

Network failure returns a useful error.

Insufficient credits returns a useful error if OpenRouter exposes enough detail.

---

## 8. Decision 6: Fix App Data Location

### Problem

SQLite currently defaults to `./novellum.db` when `NOVELLUM_DB_PATH` is missing.  That is fine for development. It is not fine for a desktop app.

A packaged app needs a predictable app data directory.

Examples:

macOS:

`~/Library/Application Support/Novellum/novellum.db`

Windows:

`%APPDATA%/Novellum/novellum.db`

Linux:

`~/.local/share/Novellum/novellum.db`

### Required change

Create a database path resolver.

### Files to change

| File                                | Required change                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/lib/server/db/client.ts`       | Replace direct `process.env.NOVELLUM_DB_PATH ?? './novellum.db'` logic with path resolver. |
| `.env.example`                      | Keep `NOVELLUM_DB_PATH` for dev/testing only.                                              |
| `novellum-docs/docs/setup-guide.md` | Document where user data lives.                                                            |

### Files to create

| File                                                  | Purpose                                    |
| ----------------------------------------------------- | ------------------------------------------ |
| `src/lib/server/db/path.ts`                           | Resolves DB path for dev/test/desktop.     |
| `src/lib/server/app-data/path.ts`                     | Resolves app data directory.               |
| `src/routes/api/settings/storage-location/+server.ts` | Returns current DB path and backup folder. |
| `tests/db/db-path.test.ts`                            | Verifies dev/test path behavior.           |

### V1 acceptance criteria

Settings → Storage shows:

Database location.

Backup location.

Button to open folder.

Button to export backup.

Warning before reset/delete.

---

## 9. Decision 7: Versioned Migrations Instead of Ad Hoc Column Patches

### Problem

The current migration strategy works during active prototyping, but it is fragile for paid users.

`src/lib/server/db/migrations.ts` creates schema and then runs many `ensureXColumn` functions and backfills.  That is normal during rapid iteration. But once customers have real projects, you need versioned migrations.

### Required V1 migration model

Add a table:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  appliedAt TEXT NOT NULL
);
```

Each migration should:

Have an integer version.

Have a name.

Run once.

Run inside a transaction.

Be tested from previous states.

### Files to change

| File                              | Required change                                                                                                                                                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/server/db/migrations.ts` | Replace or wrap existing ensure functions into explicit migrations.                                                                                                                                            |
| `src/lib/server/db/schema.ts`     | Keep only current canonical schema, not every migration behavior.                                                                                                                                              |
| `tests/sqlite/*`                  | Add migration-from-old-version tests. Existing SQLite route tests already exist for projects, chapters, scenes, characters, locations, and context. Search results show SQLite test files for several routes.  |

### Files to create

| File                                                       | Purpose                                             |
| ---------------------------------------------------------- | --------------------------------------------------- |
| `src/lib/server/db/migration-runner.ts`                    | Applies ordered migrations.                         |
| `src/lib/server/db/migrations/index.ts`                    | Exports migration list.                             |
| `src/lib/server/db/migrations/0001_initial.ts`             | Initial schema.                                     |
| `src/lib/server/db/migrations/0002_add_story_structure.ts` | Acts/arcs/beats/stages/milestones.                  |
| `src/lib/server/db/migrations/0003_add_ai_tables.ts`       | Writing styles/templates/prompts/chat instructions. |
| `src/lib/server/db/migrations/0004_add_backup_metadata.ts` | Backup metadata if needed.                          |
| `tests/sqlite/migrations/from-empty.test.ts`               | Empty DB migrates to latest.                        |
| `tests/sqlite/migrations/from-v1.test.ts`                  | Old DB migrates correctly.                          |
| `tests/sqlite/migrations/idempotent.test.ts`               | Running migrations twice is safe.                   |

### V1 acceptance criteria

Every database has a schema version.

App refuses to open unsupported future schema safely.

App can migrate older V1 beta databases.

Migration failure does not destroy the DB.

Before migration, app creates automatic safety backup.

---

## 10. Decision 8: Autosave and Recovery Must Become User-Visible

### Problem

Autosave exists, but it is not yet a complete trust system.

`autosave-service.ts` debounces for two seconds, updates the scene, and creates a snapshot when text is non-empty.  Snapshot repository keeps a maximum of 20 snapshots per scene. 

That is a good start.

But a paid writing app needs visible save state, recovery state, and restore flow.

### Required V1 behavior

The editor should clearly show:

Idle.

Saving.

Saved.

Save failed.

Offline/no network does not matter for local save.

Last saved time.

Scene version history.

Restore previous version.

Snapshot preview.

### Files to change

| File                                                 | Required change                                                                                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/editor/services/autosave-service.ts`    | Return structured save results. Preserve failed pending content. Add retry behavior.                                                            |
| `src/modules/editor/services/snapshot-repository.ts` | Add snapshot labels, timestamps, word counts, diff metadata if useful.                                                                          |
| `src/routes/projects/[id]/editor/+page.svelte`       | Wire save status into UI. Currently the page imports autosave and schedules changes, but save state is not treated as a primary trust feature.  |
| `src/routes/api/db/scene_snapshots/*`                | Ensure list order is newest-first and supports restore.                                                                                         |
| `src/lib/server/db/schema.ts`                        | Add snapshot metadata if needed: `wordCount`, `label`, `source`, `reason`.                                                                      |

### Files to create

| File                                                        | Purpose                                   |
| ----------------------------------------------------------- | ----------------------------------------- |
| `src/modules/editor/components/SaveStatus.svelte`           | Displays save state.                      |
| `src/modules/editor/components/SnapshotHistoryPanel.svelte` | Scene version history UI.                 |
| `src/modules/editor/components/SnapshotPreviewModal.svelte` | Preview/restore snapshot.                 |
| `src/modules/editor/services/recovery-service.ts`           | Handles save failure and recovery drafts. |
| `tests/editor/autosave-failure.test.ts`                     | Failed save does not lose pending text.   |
| `tests/editor/snapshot-restore.test.ts`                     | Snapshot restore works.                   |

### V1 acceptance criteria

Pull the plug test:

Open app.

Write a paragraph.

Kill the app quickly.

Reopen.

User either sees the paragraph saved or gets a recovery prompt.

No silent loss.

---

## 11. Decision 9: Fix Export as a Trust Feature

This is partly Part 2 territory, but the foundation matters now because export depends on clean data.

### Current export state

`exportProject` supports Markdown, DOCX, EPUB, and backup zip.  The assembler pulls project, chapters, and scenes, then maps scenes to content strings.  Markdown export hardcodes `author: Unknown`.  DOCX export is basic but functional at a prototype level.  EPUB export builds HTML from scene strings. 

### Required V1 foundation

Before export polish, add missing project metadata:

Author name.

Pen name.

Copyright year.

Publisher/imprint optional.

Dedication optional.

Acknowledgments optional.

Front matter toggle.

Back matter toggle.

Manuscript format preset.

### Files to change

| File                                             | Required change                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| `src/lib/server/db/schema.ts`                    | Add author/export metadata table or fields.                       |
| `src/lib/db/types.ts`                            | Add metadata types.                                               |
| `src/modules/export/types.ts`                    | Add richer export options.                                        |
| `src/modules/export/services/assembler.ts`       | Assemble full manuscript metadata, not just title/genre/chapters. |
| `src/modules/export/services/markdown-driver.ts` | Remove hardcoded author.                                          |
| `src/modules/export/services/docx-driver.ts`     | Use document styles and metadata.                                 |
| `src/modules/export/services/epub-driver.ts`     | Escape/sanitize scene HTML correctly.                             |

### Files to create

| File                                                 | Purpose                                                 |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `src/modules/export/services/html-escape.ts`         | Safe HTML escaping for EPUB.                            |
| `src/modules/export/services/manuscript-profile.ts`  | Presets: standard manuscript, reader copy, ebook draft. |
| `src/modules/export/components/ExportPreview.svelte` | Preview compiled output before download.                |
| `tests/export/markdown-export.test.ts`               | Export has correct metadata and chapter order.          |
| `tests/export/docx-export.test.ts`                   | DOCX smoke test.                                        |
| `tests/export/epub-export.test.ts`                   | EPUB generation smoke test and escaping test.           |

---

## 12. Required `.gitignore` and Repo Hygiene Fixes

### Problem

The repo is public according to GitHub metadata.  I did not find a `LICENSE` file. The `.gitignore` ignores `.github/*`, which conflicts with keeping real CI/release workflows in the repo. It also ignores `dev-docs/*`, but coverage artifacts appeared in search results, suggesting root `coverage/` is not ignored. 

### Files to change

| File           | Required change                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `.gitignore`   | Add `coverage/`. Stop ignoring all `.github/*`; ignore only generated/private agent files if needed. |
| `package.json` | Confirm `private` strategy. It is currently `"private": true` and version `0.0.1`.                   |
| `README.md`    | Add commercial/product positioning only after packaging is real.                                     |
| `LICENSE`      | Add a license strategy. For commercial closed-source, do not use MIT casually.                       |

### Files to create

| File                            | Purpose                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| `LICENSE`                       | Commercial/proprietary license or source-available license. |
| `NOTICE.md`                     | Third-party license notices.                                |
| `SECURITY.md`                   | Security reporting and credential handling policy.          |
| `PRIVACY.md`                    | Plain-English local-first privacy statement.                |
| `.github/workflows/ci.yml`      | Check/lint/test/build.                                      |
| `.github/workflows/release.yml` | Release builds once packaging exists.                       |

---

## 13. V1 Foundation Task List

### Milestone A: Desktop Shell

Status: not started.

Tasks:

1. Choose Tauri or Electron.
2. Add desktop app scaffold.
3. Configure app name, icon, window size, app ID.
4. Build local dev desktop command.
5. Build production desktop artifact.
6. Confirm app launches without terminal.
7. Confirm SQLite database path resolves to app data folder.
8. Confirm export file dialog works.
9. Confirm app version appears in settings.

Primary files:

```text
package.json
svelte.config.js
vite.config.ts
src-tauri/*
src/lib/platform/platform.ts
src/lib/server/db/path.ts
src/lib/server/app-data/path.ts
README.md
novellum-docs/docs/setup-guide.md
```

Acceptance test:

A non-developer can install and open Novellum without seeing Node, pnpm, Vite, localhost, or terminal commands.

---

### Milestone B: SQLite Source of Truth

Status: partially started.

Tasks:

1. Declare SQLite as the only V1 project source of truth.
2. Freeze Dexie as legacy.
3. Move project-owned localStorage fields into SQLite.
4. Create app preferences table.
5. Create AI settings table or secure-store references.
6. Replace Dexie backup calls.
7. Add integrity check.
8. Add project export from SQLite.
9. Add SQLite restore.
10. Add database location UI.

Primary files:

```text
src/lib/db/index.ts
src/lib/db/schema.ts
src/lib/db/types.ts
src/lib/server/db/client.ts
src/lib/server/db/schema.ts
src/lib/server/db/migrations.ts
src/modules/export/services/portability/snapshot-service.ts
src/modules/export/services/portability/restore-service.ts
src/modules/export/components/ExportModal.svelte
src/routes/settings/migrate/+page.svelte
```

Acceptance test:

No current V1 feature writes project-owned state to IndexedDB or localStorage.

---

### Milestone C: Backup and Restore

Status: unsafe prototype.

Tasks:

1. Replace Dexie snapshot with SQLite snapshot.
2. Build `.novellum` project backup archive.
3. Add manifest.
4. Add checksums.
5. Add backup preview.
6. Add restore-as-copy.
7. Add restore-over-existing with warning.
8. Add corrupt file handling.
9. Add schema mismatch handling.
10. Add tests for every table.

Primary files:

```text
src/modules/export/services/portability/snapshot-service.ts
src/modules/export/services/portability/zip-export.ts
src/modules/export/services/portability/restore-service.ts
src/modules/export/components/ExportModal.svelte
src/modules/export/services/export-service.ts
src/lib/server/db/schema.ts
```

New files:

```text
src/lib/server/backup/build-project-backup.ts
src/lib/server/backup/manifest.ts
src/lib/server/backup/table-registry.ts
src/lib/server/backup/checksums.ts
src/lib/server/restore/parse-backup.ts
src/lib/server/restore/validate-backup.ts
src/lib/server/restore/restore-project.ts
src/routes/api/backup/projects/[id]/+server.ts
src/routes/api/restore/preview/+server.ts
src/routes/api/restore/project/+server.ts
tests/backup/project-backup.test.ts
tests/backup/project-restore.test.ts
tests/backup/corrupt-backup.test.ts
```

Acceptance test:

A backup made on Machine A restores completely on Machine B.

---

### Milestone D: BYOK Security

Status: not sellable.

Tasks:

1. Remove API key from localStorage.
2. Remove key preview logging.
3. Remove `VITE_OPENROUTER_API_KEY` from production path.
4. Create secure credential service.
5. Create provider abstraction.
6. Refactor OpenRouter client.
7. Add key validation.
8. Add model selection settings.
9. Add clear error states.
10. Ensure backups exclude credentials.

Primary files:

```text
src/modules/settings/components/ApiSettings.svelte
src/lib/ai/openrouter.ts
src/routes/api/ai/+server.ts
src/routes/api/ai/validate-key/+server.ts
src/lib/stores/model-selection.svelte.ts
.env.example
```

New files:

```text
src/lib/ai/providers/types.ts
src/lib/ai/providers/openrouter-provider.ts
src/lib/ai/credential-service.ts
src/lib/server/credentials/secure-store.ts
src/routes/api/settings/ai-key/+server.ts
src/routes/api/settings/ai-status/+server.ts
src/routes/api/ai/models/+server.ts
tests/ai/credential-redaction.test.ts
tests/ai/openrouter-provider.test.ts
```

Acceptance test:

Search the built app and exported backup. The API key should not appear anywhere except secure credential storage.

---

### Milestone E: Autosave and Recovery

Status: promising but incomplete.

Tasks:

1. Add visible save status.
2. Preserve pending text on failed save.
3. Add retry.
4. Add snapshot history UI.
5. Add restore snapshot.
6. Add crash recovery prompt.
7. Add last saved timestamp.
8. Add test for save failure.
9. Add test for snapshot restore.
10. Add test for quick app termination if possible.

Primary files:

```text
src/modules/editor/services/autosave-service.ts
src/modules/editor/services/snapshot-repository.ts
src/routes/projects/[id]/editor/+page.svelte
src/routes/api/db/scene_snapshots/*
src/lib/server/db/schema.ts
```

New files:

```text
src/modules/editor/components/SaveStatus.svelte
src/modules/editor/components/SnapshotHistoryPanel.svelte
src/modules/editor/components/SnapshotPreviewModal.svelte
src/modules/editor/services/recovery-service.ts
tests/editor/autosave-failure.test.ts
tests/editor/snapshot-restore.test.ts
```

Acceptance test:

A user can recover text after a failed save or accidental overwrite.

---

## 14. Suggested Implementation Order

Do this in order. Do not skip around.

### Phase 1: Stop the bleeding

1. Remove API key logging.
2. Stop export/backup from claiming completeness if it is Dexie-only.
3. Add warning labels to current export if needed.
4. Add `coverage/` to `.gitignore`.
5. Add basic CI.

### Phase 2: Storage truth

1. Make SQLite canonical.
2. Move localStorage project metadata into SQLite.
3. Freeze Dexie.
4. Add migration path.
5. Add data integrity tests.

### Phase 3: Backup trust

1. Build SQLite backup.
2. Build restore preview.
3. Build restore transaction.
4. Test all tables.
5. Add user-facing backup UI.

### Phase 4: BYOK trust

1. Secure key storage.
2. Provider abstraction.
3. Model settings.
4. Error states.
5. Credential redaction tests.

### Phase 5: Desktop app

1. Tauri/Electron shell.
2. App data path.
3. File dialogs.
4. Installer.
5. Version/about page.

### Phase 6: Recovery

1. Save status.
2. Snapshots.
3. Restore UI.
4. Crash recovery.

After these phases, Novellum becomes something you can responsibly call a V1 candidate.

---

## 15. Coding Agent Prompt for Part 1 Foundation Work

Use this as the first major agent prompt.

```md
You are working in the Novellum repository. Your goal is to prepare Novellum for a sellable V1 as a local-first one-time-purchase BYOK desktop app.

Do not add new product features. Focus on trust, storage correctness, backup/restore, credential safety, and release readiness.

Current known issues:
- The app is still documented and structured as a SvelteKit dev app, not an installable desktop product.
- SQLite is described as primary, but Dexie is still used for portability/export.
- API keys are stored in localStorage and a preview is logged in the OpenRouter client.
- Backup/restore does not use the SQLite source of truth.
- The app lacks versioned SQLite migrations.
- Autosave exists but does not yet provide a user-visible recovery system.

Primary goals:
1. Make SQLite the single source of truth for project-owned data.
2. Freeze Dexie as legacy-only.
3. Replace Dexie-backed backup/export with SQLite-backed backup/export.
4. Remove all API key logging.
5. Remove localStorage API key persistence from the V1 path.
6. Add a secure credential service abstraction.
7. Add versioned migration infrastructure.
8. Add save status and recovery infrastructure.
9. Prepare the repo for desktop packaging.
10. Add tests for backup, restore, migration, credential redaction, and autosave recovery.

Work in staged pull-request-sized changes. Do not rewrite the whole app at once.

Stage 1:
- Remove API key preview logging from `src/lib/ai/openrouter.ts`.
- Add tests that fail if key material is logged or returned.
- Update `src/modules/settings/components/ApiSettings.svelte` to stop claiming “never sent to our servers” until the architecture is cleaned up. Use precise local-only wording.
- Add `coverage/` to `.gitignore`.

Stage 2:
- Create a canonical SQLite table registry for project backup.
- Create `src/lib/server/backup/table-registry.ts`.
- Include all project-owned tables from `src/lib/server/db/schema.ts`.
- Add tests that compare the registry against expected V1 tables.

Stage 3:
- Create SQLite backup builder.
- Do not use Dexie.
- Build a manifest with app version, schema version, exportedAt, project metadata, table counts, and checksums.
- Add tests that create a project with chapters, scenes, characters, locations, arcs, acts, milestones, writing styles, templates, prompts, and snapshots, then verify all data appears in the backup.

Stage 4:
- Create restore preview and restore execution services.
- Restore must run transactionally.
- Support restore-as-copy.
- Add corrupt backup tests.

Stage 5:
- Freeze Dexie under a legacy module path.
- Update imports so no V1 runtime feature imports Dexie for active project data.
- Keep legacy migration only if needed.

Stage 6:
- Create credential service abstraction.
- Replace direct localStorage API key reads with the abstraction.
- Prepare implementation for desktop secure storage.
- Do not include credentials in backups.

Stage 7:
- Add migration runner with schema_migrations table.
- Convert existing ad hoc migration logic into explicit versioned migrations over time.
- Add idempotency tests.

Stage 8:
- Add save status and snapshot restore UI.
- Ensure failed autosave does not discard pending text.

After each stage:
- Run `pnpm run check`
- Run `pnpm run lint`
- Run `pnpm run test`
- Update docs only after behavior is implemented.
```

---

## 16. Part 2 Preview

Part 2 should cover:

Export quality and manuscript compilation.

Editor simplification and V1 writing experience.

Worldbuilding field standardization cutoff.

AI assistant V1 scope.

Onboarding.

Settings.

User documentation.

CI/CD.

Licensing/payment/activation.

Release checklist.

QA matrix.

Beta program.

Pricing readiness.

Public website copy.

A final “V1 sellable definition of done.”

Proceed when ready and I’ll generate Part 2 with the same level of detail.
