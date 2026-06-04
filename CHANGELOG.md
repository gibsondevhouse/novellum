# Changelog

All notable changes to Novellum are documented here.

## [Unreleased]

### Added

- **Review-gated outline generation** — Nova can generate a structured Arc -> Act -> Chapter -> Scene outline proposal from project/worldbuilding context, store it as an `outlineDraftCheckpoints.v1` review checkpoint, and keep hierarchy tables untouched until explicit accept.
- **Atomic outline materialization** — accepted outline checkpoints materialize through `/api/outline/checkpoints/{checkpointId}/accept` with stale guards, conflict preflight, rollback-safe error handling, accepted audit metadata, default milestone buckets, and scene intent metadata for draft-context compatibility.
- **Outline generation verification** — added deterministic route and Playwright coverage for generation, review, reject, accept, no silent hierarchy writes, and conflict-blocked accept. Closeout gates: `pnpm check` 0 errors / 11 pre-existing warnings, `pnpm lint` clean, `pnpm test` 237 files / 1722 tests, `pnpm check:tokens` 347 files / 0 violations, targeted e2e 2 tests. Known unrelated `pnpm lint:css` duplicate `text-align` failure remains in `IndividualsWorkspaceShell.svelte`.
- **Agentic worldbuild scan execution** — `POST /api/worldbuilding/scan` now generates review-gated `pending_review` proposals, dedupes them against canon and pending suggestions, persists them under `vibe-worldbuild-scan`, and keeps all scan output non-canonical until explicit accept.
- **Atomic scan proposal decisions** — scan proposal accept/reject routes now use transaction-backed mutation helpers; accepted proposals project to canon only inside the accept transaction, and failed projection leaves proposals pending.
- **Context-priority generation** — Before generating characters, factions, or lineages, a pre-generation dialog surfaces candidate names extracted from the project title and synopsis. Authors can classify each as `target` (prioritize), `avoid` (deprioritize), or `neutral`. The selection is threaded as a typed `GenerationContextPayload` into the generation prompt. Manual name entry is also available.
- **Expanded character draft fields** — AI-generated character drafts now populate `coreDesire`, `fear`, `contradiction`, `strength`, `flaw`, `storyRole`, `externalGoal`, `internalNeed`, `stakes`, `voiceSummary`, and `speechPattern` when saving to `/api/db/characters`, filling fields that were previously always empty.
- **Draft validation layer** — `POST /api/worldbuilding/generate` now validates and normalizes each AI-generated draft through `validateGeneratedDrafts` before returning it to the UI. Drafts missing required identity fields are dropped; valid drafts in mixed arrays are retained. Returns `validation_failed` when all drafts are invalid.
- `extractNameCandidates(title, synopsis)` — a deterministic pure-function utility for proper-noun extraction from project prose, exported from the world-building module.

### Fixed

- Prevented double-encoded JSON array fields created through `GeneratedEntityModal.saveDraft` across characters, locations/realms/landmarks, lore entries, plot threads, and timeline events.
- Hardened array-consumer paths that previously called `.join()` on unexpected string payloads (`joinCommaSeparated`, Individuals Dossier aliases, Lore Entry header tags, and prompt-builder character traits).

### Added (continued — JSON hardening, plan-035)

- Defensive server behavior in `createPostHandler` to accept pre-stringified JSON values for `json: true` fields without re-encoding them.
- One-time repair utility: `scripts/repair-json-fields.mjs` for existing double-encoded SQLite rows.
- Regression coverage in `tests/db/json-encoding.test.ts` for route round-trips, pre-stringified input handling, and guard behavior.

## [1.0.0-beta.1] — 2026-Q2

### Added

- **Export pipeline** — four manuscript profiles (Standard Manuscript, Reader Copy, Ebook Draft, Plain Text Archive) with Markdown, DOCX, and EPUB drivers. Real manuscript metadata (title, author, subtitle, synopsis, copyright, dedication). Per-profile front matter and back matter flags.
- **Writing-first editor** — TipTap-based prose surface with autosave, scene word count, and keyboard shortcuts. No lag on 5,000-word scenes.
- **Project Hub** — trust-first project list with word count, last-modified date, and quick-access backup link.
- **Settings Trust Center** — AI key management (OpenRouter BYOK), privacy disclosure panel, backup schedule controls, About + Legal routes.
- **Nova AI Assistant** — context-scoped AI sidebar powered by your OpenRouter key. Context policy: scene + adjacent scenes. No auto-apply; all suggestions are explicit.
- **Onboarding flow** — first-launch guide with persistent completion flag.
- **Worldbuilding suite** — Personae, Atlas, Archive, Threads, and Chronicles modules with vertical-domain module boundaries.
- **Navigation and design system** — frozen token set, dark theme, accessibility-reviewed components.
- **Documentation** — user docs (`novellum-docs/user/`) and developer docs (`novellum-docs/developer/`).
- **CI/CD pipeline** — PR gate (`ci.yml`), release workflow with macOS/Windows/Linux Tauri builds (`release.yml`), scheduled visual regression workflow, Dependabot.
- **Legal** — `LICENSE` (Proprietary), `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, `NOTICE.md`.
- **Error primitives** — `AppError` class and `error-map` with six named error codes replacing raw `Error` throws in Nova and export services.
- **AppVersion** — `APP_VERSION` injected at build time; shown in Settings → About.

### Known Issues (Beta)

- Linux `.AppImage` build is CI-produced and not officially supported.
- No Scrivener / Word import.
- AI context window limited to scene + adjacent scenes.
