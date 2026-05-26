---
title: Documentation Tracks
slug: stage-009-documentation-tracks
stage_number: 9
status: complete
owner: Planner Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-user-docs
  - phase-002-developer-docs
  - phase-003-readme
estimated_duration: 4d
risk_level: low
---

## Goal

Split documentation into two clearly separated tracks: **user docs** for the paid product (`novellum-docs/user/`) and **developer docs** for contributors (`novellum-docs/developer/`). Reposition `README.md` as a product-focused intro that links to both tracks and strips development-setup detail out of the root.

## Context (already in tree — do not duplicate)

- `novellum-docs/README.md` — exists; minimal content; references the `docs/` subdirectory.
- `novellum-docs/docs/` — subdirectory exists; treat its current content as legacy; do not delete, but do not link from the new index.
- `README.md` — currently leads with `pnpm run dev` and a project-structure dump; no product-focused intro. Full content is the source to be replaced in phase-003.
- `dev-docs/architecture.md` — authoritative source for the architecture summary.
- `dev-docs/modular-boundaries.md` — FSD/VSA boundary rules; must be summarised in `developer/architecture.md`.
- `dev-docs/data-model.md` — SQLite schema; referenced in `developer/architecture.md`.
- `dev-docs/dev-workflow.md` — PR process; absorbed into `developer/contributing.md`.
- `package.json` `scripts` section — full list of commands; tabulated in `developer/contributing.md`.

## Entry Criteria

- plan-018 stages 001–006 complete (all user-facing flows are stable and their UX is finalised).
- All referenced UI routes (`/onboarding`, `/settings/ai`, project editor, export modal) exist and are navigable.
- `pnpm run check` and `pnpm run lint` pass on the current tree (verify before starting).

## Exit Criteria

- User docs exist at `novellum-docs/user/` — each file contains real content (≥ 300 words, no placeholder text):
  - `novellum-docs/user/install.md`
  - `novellum-docs/user/quick-start.md`
  - `novellum-docs/user/local-first.md`
  - `novellum-docs/user/ai-setup.md`
  - `novellum-docs/user/export.md`
  - `novellum-docs/user/keyboard-shortcuts.md`
  - `novellum-docs/user/faq.md`
- Developer docs exist at `novellum-docs/developer/`:
  - `novellum-docs/developer/architecture.md`
  - `novellum-docs/developer/contributing.md`
  - `novellum-docs/developer/testing.md`
  - `novellum-docs/developer/deployment.md`
- `README.md` is rewritten: product tagline, feature highlights, "Get Started" link to user docs, "Contributing" link to developer docs, license badge, ≤ 60 lines, no `pnpm run dev`.
- `novellum-docs/README.md` serves as an index linking all 11 doc files (7 user + 4 developer).
- No file contains placeholder text (`TODO`, `[[`, `Lorem ipsum`, or equivalent).

## Phases

### Phase-001 — User doc set

**Goal:** Create all seven user-facing documentation files with real, actionable content written for a non-technical author who has never touched a terminal.

**Files:**
- `novellum-docs/user/install.md` — new file.
- `novellum-docs/user/quick-start.md` — new file.
- `novellum-docs/user/local-first.md` — new file.
- `novellum-docs/user/ai-setup.md` — new file.
- `novellum-docs/user/export.md` — new file.
- `novellum-docs/user/keyboard-shortcuts.md` — new file.
- `novellum-docs/user/faq.md` — new file.

**Implementation:**

Each file opens with an H1 title matching the filename concept and a one-sentence summary paragraph. No placeholder text. Minimum 300 words per file.

`install.md` — covers: downloading the macOS `.dmg` installer (drag Novellum.app to Applications folder), macOS Gatekeeper prompt (right-click → Open if blocked, or System Settings → Privacy & Security → Open Anyway), Windows `.msi` installer (run installer, accept SmartScreen prompt), where Novellum stores data after first launch (local SQLite database in the OS application-support folder — no cloud), verifying the app opens to the onboarding screen.

`quick-start.md` — covers: launching Novellum for the first time and completing the onboarding flow, creating a first project (title, genre, synopsis fields), navigating to the editor from the Project Hub, typing a first scene, understanding the word count badge in the toolbar, saving (autosave is always-on), navigating back to the hub.

`local-first.md` — covers: what "local-first" means (all project data lives on your device, no account required, no cloud sync), where the database file lives (`~/Library/Application Support/Novellum/` on macOS, `%APPDATA%\Novellum\` on Windows), the automatic backup system and how to trigger a manual backup from Settings → Backup, the difference between a **backup** (`.novellum.zip` portability archive) and an **export** (manuscript file for publishing), moving projects to a new computer by copying the backup archive.

`ai-setup.md` — covers: obtaining an OpenRouter API key step by step (openrouter.ai → sign up → API keys → Create key), navigating to Settings → AI in Novellum, entering and saving the key, how the key is stored (local OS config — never sent to Novellum servers), which models are available by default, how to interpret the Context disclosure in the Nova sidebar (shows exactly what data was sent to the AI), how to test that the AI is working (open Nova panel, type a prompt), how to remove or rotate the key.

`export.md` — covers: the four export profiles — **Standard Manuscript** (double-spaced, title page, formatted for agent submission), **Reader Copy** (clean reading copy with front and back matter), **Ebook Draft** (EPUB-optimised with metadata and TOC), **Plain Text Archive** (minimal Markdown, no formatting) — choosing a format (Markdown for editing flexibility, Word `.docx` for agents and editors, EPUB for ebook distribution), filling in manuscript metadata (title, author, subtitle, synopsis), optionally selecting a subset of chapters, clicking Export and finding the downloaded file, re-exporting after edits (each export creates a new file; Novellum does not overwrite).

`keyboard-shortcuts.md` — covers all registered editor and navigation shortcuts as a two-column table (Action | Shortcut). Minimum entries: Bold, Italic, Undo, Redo, Find in scene, Save (note: autosave, but manual trigger), New scene, Toggle Nova sidebar, Navigate to Project Hub, Open Settings, Open Export dialog. Include a section noting that shortcuts may differ on Windows (Ctrl instead of Cmd).

`faq.md` — at minimum 10 Q&A entries in a question-heading / answer-paragraph format:
1. Is my data safe if I lose my computer?
2. Can I use Novellum without the internet?
3. What happens if I uninstall the app — will I lose my work?
4. Does Novellum read my manuscript?
5. How do I move my project to a new computer?
6. Can I import from Scrivener or Microsoft Word?
7. What AI models does Novellum support?
8. How do I turn off the AI features entirely?
9. Where are my backups saved?
10. What export formats are supported and which should I choose?

**Acceptance checklist:**
- [ ] All seven files exist under `novellum-docs/user/`.
- [ ] Each file contains ≥ 300 words of real, non-placeholder content.
- [ ] No file contains `TODO`, `[[`, or `Lorem ipsum`.
- [ ] `install.md` covers both macOS and Windows install paths including Gatekeeper/SmartScreen.
- [ ] `faq.md` has at least 10 Q&A entries.
- [ ] `keyboard-shortcuts.md` contains a two-column table.
- [ ] `export.md` names and describes all four export profiles.

---

### Phase-002 — Developer doc set

**Goal:** Create four developer-facing documentation files that synthesise the authoritative sources in `dev-docs/` for new contributors and meta-agents.

**Files:**
- `novellum-docs/developer/architecture.md` — new file.
- `novellum-docs/developer/contributing.md` — new file.
- `novellum-docs/developer/testing.md` — new file.
- `novellum-docs/developer/deployment.md` — new file.

**Implementation:**

`architecture.md` — synthesise from `dev-docs/architecture.md`, `dev-docs/modular-boundaries.md`, `dev-docs/repo-structure.md`, and `dev-docs/data-model.md`. Sections:

- **Stack**: SvelteKit 2 + Svelte 5 Runes (UI), SQLite via `better-sqlite3` (primary data layer), Dexie (portability/import-export only), Tauri v2 (desktop shell), Vite (build), TypeScript strict.
- **Module boundaries**: The codebase enforces vertical domain isolation via `eslint-plugin-boundaries`. The six boundary layers are `app`, `modules`, `lib`, `routes`, `stores`, `styles`. Modules may not import across domain boundaries except via their public `index.ts`. Run `pnpm run lint` to verify.
- **Data layer discipline**: SQLite via `/api/db/*` SvelteKit API routes is the single source of truth for all project data. Dexie (IndexedDB) is restricted to portability operations (`.novellum.zip` import/export). Never access Dexie from module services.
- **State management**: Svelte 5 `$state` and `$derived` runes in `.svelte.ts` store files. No Svelte 4 `writable`/`readable` stores. Cross-cutting state lives in `src/stores/`.
- **Links to authoritative sources**: Each section ends with a `→ See: dev-docs/<file>.md` link.

`contributing.md` — full contributor setup. Sections:

- **Prerequisites**: Node.js ≥ 20 (`node --version`), pnpm ≥ 9 (`pnpm --version`), Rust stable (only needed for Tauri builds; `rustup update stable`).
- **Setup**: `git clone <repo>`, `cd novellum`, `pnpm install`, `pnpm run dev` → open `http://localhost:5173`.
- **Commands**: full table of all `package.json` scripts (dev, build, preview, check, lint, lint:css, format, test, test:watch, test:coverage, test:visual, storybook, desktop:dev, desktop:build, version:sync, changelog) with one-sentence descriptions.
- **Workflow**: branch from `master` with naming convention `feat/<slug>`, `fix/<slug>`, `chore/<slug>`; open a PR; CI must pass (type check, lint, tests, build); Reviewer Agent sign-off required before merge.
- **Boundaries rule**: `pnpm run lint` runs `eslint-plugin-boundaries`. If a boundary violation is flagged, do not suppress it — restructure the import. Violations are blocking.
- **Test requirements**: services and AI logic targeting `src/lib/services/**` and `src/lib/ai/**` require ≥ 80% line coverage. Every new feature or bug fix must ship with a test. See `testing.md`.

Absorb the current `README.md` development-setup content here; after phase-003 the README will no longer contain `pnpm run dev`.

`testing.md` — Vitest setup, patterns, and commands. Sections:

- **Running tests**: `pnpm run test` (all), `pnpm run test:coverage` (with v8 coverage), single file: `pnpm vitest run tests/export/assembler.test.ts`.
- **Environment**: `jsdom` for component/DOM tests; `node` environment for pure-logic tests. Set via Vitest `environmentMatchGlobs` in `vitest.config.ts`.
- **Vitest patterns**: `vi.mock('$modules/project/services/project-repository.js')` to mock SQLite repositories; `fake-indexeddb` for Dexie-touching tests (`import 'fake-indexeddb/auto'` in test setup); always call `vi.clearAllMocks()` in `afterEach`.
- **Coverage**: 80% line coverage threshold enforced for `src/lib/services/**` and `src/lib/ai/**`. HTML report in `coverage/index.html`. Run `pnpm run test:coverage` and open report to find gaps.
- **Visual regression**: `pnpm run test:visual` runs Playwright tests in `tests/visual/`. Requires the dev server running first: `pnpm run dev` in a separate terminal (or `pnpm run preview` + `BASE_URL=http://localhost:4173`). Snapshots stored in `tests/visual/__screenshots__/`.
- **Writing a new test**: file at `tests/<module>/<name>.test.ts`; `describe` → `it` structure; always mock the DB layer; use `expect.assertions(n)` in async error tests.

`deployment.md` — Tauri build guide. Sections:

- **Prerequisites**: Rust toolchain (`rustup update stable`), OS-specific Tauri deps (macOS: Xcode Command Line Tools; Ubuntu: `libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev`; Windows: Visual Studio Build Tools + WebView2).
- **Version sync**: Always run `pnpm run version:sync` before a desktop build. This syncs `package.json` `"version"` into `src-tauri/tauri.conf.json`. Mismatched versions cause the updater to behave incorrectly.
- **Web build**: `pnpm run build` must succeed before any Tauri build.
- **Desktop build**: `pnpm run desktop:build` (wraps `pnpm run version:sync && pnpm run fetch:node && pnpm tauri build`). Cross-compile with `pnpm tauri build --target <triple>`.
- **Supported targets**: `aarch64-apple-darwin` (macOS Apple Silicon), `x86_64-pc-windows-msvc` (Windows x64), `x86_64-unknown-linux-gnu` (Linux x64, CI only).
- **Signing**: Code-signing requires `TAURI_PRIVATE_KEY` and `TAURI_KEY_PASSWORD` env vars (base64 private key + passphrase). Generate keys with `pnpm tauri signer generate`. Provisioned as repository secrets; see stage-010.
- **CI builds**: Unsigned builds are triggered by the `desktop-v*` tag via `.github/workflows/desktop-build.yml`. Signed release builds use `.github/workflows/release.yml` (stage-010).

**Acceptance checklist:**
- [ ] All four files exist under `novellum-docs/developer/`.
- [ ] `contributing.md` contains `pnpm install`, `pnpm run dev`, the full scripts table, and the PR process.
- [ ] `testing.md` explains how to run a single Vitest test file.
- [ ] `deployment.md` mentions `pnpm run version:sync` and both primary targets.
- [ ] `architecture.md` names `eslint-plugin-boundaries` and the Dexie restriction.
- [ ] No file contains `TODO`, `[[`, or placeholder text.

---

### Phase-003 — README reposition and cross-links

**Goal:** Rewrite `README.md` as a product-facing document (≤ 60 lines, license badge, no `pnpm run dev`). Update `novellum-docs/README.md` as the doc index.

**Files:**
- `README.md` — full rewrite.
- `novellum-docs/README.md` — replace with doc index.

**Implementation:**

`README.md` new content:

```markdown
# Novellum

> Local-first, AI-assisted novel production workspace for serious fiction writers.

![License](https://img.shields.io/badge/license-Proprietary-red)

## Features

- **Distraction-free editor** — full-screen prose editor with autosave and word count.
- **Story structure** — hierarchical Acts → Chapters → Scenes outline with drag-and-drop reorder.
- **AI writing assistant** — Nova sidebar powered by your own OpenRouter API key; no subscription required.
- **Manuscript export** — four compile profiles (Standard Manuscript, Reader Copy, Ebook Draft, Plain Text Archive); Markdown, Word, and EPUB output.
- **Worldbuilding suite** — Personae, Atlas, Archive, Threads, and Chronicles modules with cross-linking.
- **Local-first and private** — data lives on your device; no cloud sync, no telemetry, no account required.
- **Automatic backups** — scheduled `.novellum.zip` archives; one-click restore.

## Get Started

→ [Install Guide](novellum-docs/user/install.md)
→ [Quick Start](novellum-docs/user/quick-start.md)

## Documentation

→ [User Docs](novellum-docs/user/)
→ [Developer Docs](novellum-docs/developer/)

## Contributing

See [novellum-docs/developer/contributing.md](novellum-docs/developer/contributing.md).

## License

Proprietary. All Rights Reserved. © 2026 Gibson Dev House.
```

`novellum-docs/README.md` new content — replace the existing minimal content with a structured index:

```markdown
# Novellum Documentation

## User Docs

For authors installing and using Novellum:

- [Install Guide](user/install.md) — download and install on macOS and Windows.
- [Quick Start](user/quick-start.md) — create your first project and write your first scene.
- [Local-First & Your Data](user/local-first.md) — where your data lives and how to back it up.
- [AI Setup](user/ai-setup.md) — configure your OpenRouter API key.
- [Export](user/export.md) — compile your manuscript and choose an export format.
- [Keyboard Shortcuts](user/keyboard-shortcuts.md) — editor and navigation shortcuts.
- [FAQ](user/faq.md) — common questions answered.

## Developer Docs

For contributors and agents working on the Novellum codebase:

- [Architecture](developer/architecture.md) — stack, module boundaries, and data-layer rules.
- [Contributing](developer/contributing.md) — setup, commands, workflow, and test requirements.
- [Testing](developer/testing.md) — Vitest and Playwright patterns, coverage thresholds.
- [Deployment](developer/deployment.md) — Tauri build steps, version sync, and signing.
```

**Acceptance checklist:**
- [ ] `README.md` contains the `![License]` badge.
- [ ] `README.md` links to `novellum-docs/user/install.md` and `novellum-docs/developer/contributing.md`.
- [ ] `README.md` does not contain `pnpm run dev` or a project-structure dump.
- [ ] `README.md` is ≤ 60 lines.
- [ ] `novellum-docs/README.md` lists all 11 doc files (7 user + 4 developer) with links and one-sentence descriptions.

## Out of Scope

- Translations or localisation of any documentation.
- API reference documentation (not applicable at V1).
- Changelog authoring (stage-010 phase-004).
- Any Svelte or TypeScript source file changes.
- Creating `troubleshooting.md`, `recovery.md`, `backups.md`, `restore.md`, `privacy.md`, or `license.md` in `novellum-docs/user/` (deferred to a later stage or covered by stage-011).
- `dev-docs/README.md` retains internal architecture docs and links out to the new tracks.
- Acceptance: a non-developer can install and use Novellum from user docs alone; a developer can clone and run from developer docs alone.

## Notes

- Source: [market-readiness-pt2.md §26](../../research/market-readiness-pt2.md).
- Privacy and license pages must match the artifacts produced in stage-011.
- Coordinate with the Reviewer agent for tone consistency on user-facing copy.
