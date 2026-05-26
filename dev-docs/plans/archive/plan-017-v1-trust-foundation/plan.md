---
title: V1 Sellable Trust Foundation
slug: plan-017-v1-trust-foundation
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-28
last_updated: 2026-04-30
target_completion: 2026-07-15
stages:
  - stage-001-stop-the-bleeding
  - stage-002-sqlite-source-of-truth
  - stage-003-versioned-migrations
  - stage-004-backup-and-restore
  - stage-005-byok-security
  - stage-006-app-data-path
  - stage-007-autosave-and-recovery
  - stage-008-desktop-packaging
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - coverage
---

## Objective

Establish the trust, storage, credential, backup, and packaging foundation required before Novellum can be sold as a one-time-purchase, BYOK, local-first desktop app. This plan operationalizes Part 1 of the V1 sellable readiness research at [dev-docs/plans/research/market-readiness-pt1.md](../research/market-readiness-pt1.md).

The pillar guarantees this plan must deliver:

1. **SQLite is the only source of truth** for project-owned data. Dexie is frozen as legacy-only.
2. **Backup/restore is canonical, transactional, and SQLite-backed.** A `.novellum` archive made on Machine A restores completely on Machine B.
3. **BYOK credentials are secure.** No API key in `localStorage`, logs, backups, or exports.
4. **Migrations are versioned and idempotent.** Migration failure does not destroy a user database.
5. **Autosave failures never silently lose text.** Save state is visible; snapshots are restorable.
6. **The app is packaged as a real desktop product.** No terminal, Node, pnpm, or `localhost` exposure for end users.

## Scope

**In scope:**

- Credential logging removal and BYOK security refactor (`OpenRouterClient`, `ApiSettings`, `/api/ai/*`).
- Provider abstraction (`AiProvider` interface, OpenRouter implementation, secure credential service).
- SQLite canonicalization: project-owned data audit, Dexie freeze under `src/lib/legacy/dexie/*`, IndexedDB → SQLite migration path.
- Versioned migration runner with `schema_migrations` table and explicit `0001_*` migration files.
- `.novellum` backup format: manifest, checksums, table registry, transactional restore, restore-as-copy, corrupt-archive handling.
- App data directory resolver for dev/test/desktop modes.
- Autosave/recovery UX backbone: `SaveStatus`, snapshot history, snapshot restore, crash-recovery prompt, retry on failure.
- Desktop packaging scaffold (Tauri preferred; Electron acceptable fallback) with installer, signing posture, and About/version surface.
- Repo hygiene: `.gitignore` cleanup (`coverage/`, narrow `.github/` ignore), basic CI workflow.
- Test coverage for credential redaction, backup completeness, restore integrity, migrations from older states, and autosave failure paths.

**Out of scope (covered by `plan-018-v1-product-experience`):**

- Manuscript export quality, profiles, drivers (Markdown/DOCX/EPUB polish).
- Editor route decomposition and writing/planning/revision modes.
- Project hub trust cards, Settings trust-center IA, AI assistant UX scope.
- First-run onboarding, user/developer documentation split.
- Licensing, EULA, privacy copy, sales page, beta program, pricing.
- Worldbuilding scope audit, navigation IA, design-system freeze.

**Explicitly deferred past V1:**

- Cloud sync, marketplace, collaboration, mobile, plugin system, multi-provider billing, app-owned API keys.

## Stages

| #   | Stage                                                                                | Status        | Est. Duration |
| --- | ------------------------------------------------------------------------------------ | ------------- | ------------- |
| 001 | [Stop the Bleeding](stage-001-stop-the-bleeding/stage.md)                            | `complete`    | 2d            |
| 002 | [SQLite Source of Truth](stage-002-sqlite-source-of-truth/stage.md)                  | `complete`    | 6d            |
| 003 | [Versioned Migrations](stage-003-versioned-migrations/stage.md)                      | `complete`    | 4d            |
| 004 | [Backup and Restore](stage-004-backup-and-restore/stage.md)                          | `complete`    | 6d            |
| 005 | [BYOK Security](stage-005-byok-security/stage.md)                                    | `complete`    | 5d            |
| 006 | [App Data Path](stage-006-app-data-path/stage.md)                                    | `complete`    | 2d            |
| 007 | [Autosave and Recovery](stage-007-autosave-and-recovery/stage.md)                    | `complete`    | 4d            |
| 008 | [Desktop Packaging](stage-008-desktop-packaging/stage.md)                            | `complete`    | 8d            |

Stage order matches the research's "Suggested Implementation Order" (Part 1 §14): stop the bleeding → storage truth → backup trust → BYOK trust → desktop app → recovery polish.

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` passes; `eslint-plugin-boundaries` reports no module leakage.
- [ ] **typecheck** — `pnpm run check` passes with zero type errors.
- [ ] **tests** — `pnpm run test` passes; coverage on `src/lib/server/db/*`, `src/lib/server/backup/*`, `src/lib/server/restore/*`, `src/lib/ai/providers/*`, and `src/modules/editor/services/*` ≥ 80% lines.
- [ ] **boundaries** — no V1 runtime feature imports `$lib/db/index` (Dexie) for active project data.
- [ ] **credential redaction** — automated tests assert API keys are absent from logs, console output, exports, and backups.
- [ ] **backup integrity** — backup made from a fully-populated project restores all canonical tables on a fresh DB.
- [ ] **migration safety** — migrations run idempotently and create a safety snapshot before applying.
- [ ] **docs_sync** — `dev-docs/data-model.md`, `dev-docs/architecture.md`, `dev-docs/portability-recovery-runbook.md`, and `novellum-docs/docs/setup-guide.md` updated to reflect canonical truth.

## Risks & Mitigations

| Risk                                                                                                           | Likelihood | Mitigation                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tauri refactor blocks server-route assumptions (`better-sqlite3`, SvelteKit endpoints).                        | medium     | Stage 008 begins with a packaging-decision part comparing Tauri+sidecar vs. Electron+embedded Node; lock the decision before scaffold work.                 |
| Dexie freeze breaks existing portability features users may have relied on in beta.                            | medium     | Stage 002 ships an IndexedDB→SQLite one-shot migration UI before Dexie is removed from runtime imports.                                                     |
| Backup format drift between manifest, table registry, and SQLite schema.                                       | medium     | Stage 004 introduces `table-registry.ts` as the single canonical list; all backup/restore tests reference the registry.                                     |
| Credential logging regresses through library updates or new provider work.                                     | low        | Stage 001 adds a permanent `tests/ai/credential-redaction.test.ts` that scans logs and outputs; CI enforces it.                                             |
| Migration runner corrupts user databases when applied to a "future" schema (downgrade attempt).                | medium     | Stage 003 refuses to open a DB whose `schema_migrations.version` exceeds the bundled max and surfaces a clear error.                                        |
| Snapshot churn inflates DB size during continuous writing.                                                     | low        | Stage 007 caps snapshots per scene (existing 20-snapshot limit) and adds debounced near-duplicate suppression.                                              |

## Notes

- **Source of truth.** Implementation must defer to the research brief for rationale and file-level guidance. Each stage's `Notes` section anchors back to specific Part 1 sections.
- **Sequencing.** Stages 001–004 are non-negotiable prerequisites for sale. Stages 005–007 close the trust gap. Stage 008 (desktop packaging) is permitted to run in parallel with Stages 005–007 once Stage 004 is complete, **provided** the packaging branch does not depend on backup/restore changes still in flight.
- **Boundaries.** All work respects `eslint-plugin-boundaries`. Server-only code (`src/lib/server/**`) must not be imported from client modules; provider/credential abstractions live in `src/lib/ai/providers/*` with the secure-store implementation isolated under `src/lib/server/credentials/*`.
- **Svelte 5.** All new UI components (`SaveStatus`, `SnapshotHistoryPanel`, settings shells) use Svelte 5 Runes (`$state`, `$derived`, `.svelte.ts`).
- **No new product features.** This plan must not add worldbuilding surfaces, AI agents, or new export formats. Polish work belongs to `plan-018-v1-product-experience`.
- **Research anchor.** [dev-docs/plans/research/market-readiness-pt1.md](../research/market-readiness-pt1.md).
