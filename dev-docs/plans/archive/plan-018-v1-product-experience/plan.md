---
title: V1 Sellable Product Experience and Release
slug: plan-018-v1-product-experience
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-28
last_updated: 2026-05-06
target_completion: 2026-09-15
stages:
  - stage-001-export-quality
  - stage-002-editor-writing-first
  - stage-003-project-hub-trust
  - stage-004-settings-trust-center
  - stage-005-ai-assistant-v1-scope
  - stage-006-onboarding
  - stage-007-worldbuilding-scope-audit
  - stage-008-navigation-and-design-system-freeze
  - stage-009-documentation-tracks
  - stage-010-cicd-and-release-pipeline
  - stage-011-licensing-privacy-legal
  - stage-012-qa-performance-beta-and-dod
dependencies:
  - plan-017-v1-trust-foundation
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - tokens
  - visual
  - coverage
---

## Objective

Take the trust foundation delivered by [plan-017-v1-trust-foundation](../plan-017-v1-trust-foundation/plan.md) and convert Novellum into a polished, commercially defensible V1 product. This plan operationalizes Part 2 of the V1 sellable readiness research at [dev-docs/plans/research/market-readiness-pt2.md](../research/market-readiness-pt2.md) and ends with the V1 Definition-of-Done acceptance demo.

The pillar guarantees this plan must deliver:

1. **Manuscript export is a first-class product surface** — separate from project backup, with author metadata, profiles, and validated Markdown/DOCX/EPUB output.
2. **The editor reads as a writing surface, not a control room.** Writing/Planning/Revision modes; manuscript visually dominant; AI panel tertiary.
3. **The Project Hub is a command center** answering "where is my book / is it saved / can I export / is it backed up / is AI configured / what next."
4. **Settings is the trust center** — AI, Storage, Backup & Restore, Export Defaults, Privacy, Updates, About.
5. **AI assistant V1 has explicit scope, context disclosure, and clean failure states.**
6. **First-run onboarding teaches local-first + BYOK before project creation.**
7. **User docs are separated from developer docs.**
8. **CI/CD, release pipeline, license, privacy, EULA, and beta program are in place** before any paid sale.
9. **The V1 Definition-of-Done acceptance demo passes end-to-end** (research §43).

## Scope

**In scope:**

- Export module rewrite: separation of manuscript export from project backup; manuscript profiles (`standard_manuscript`, `reader_copy`, `ebook_draft`, `plain_text_archive`); driver upgrades for Markdown/DOCX/EPUB; export validation and preview.
- Editor route decomposition into a writing-first shell with `EditorShell`, `EditorTopBar`, `SceneNavigator`, `SceneContextPanel`, `SceneCompassPanel`, save status, snapshot history, focus mode, and three editor modes.
- Project Hub upgrades: backup status card, export readiness card, recent activity, safety/health card, accurate live word count.
- Settings trust-center IA: tabbed `SettingsShell` with AI, Storage, Backup & Restore, Export Defaults, Privacy, Updates, About sections.
- AI assistant UX: provider/model status, context disclosure pill, missing-key empty state, clean error states, model picker, AI-session service.
- First-run onboarding flow: welcome → local-first → storage → backup → AI key (skippable) → create first project.
- Worldbuilding V1 scope audit: audit every visible surface for SQLite persistence, backup inclusion, AI context inclusion, visual consistency. Hide non-conforming surfaces from V1 navigation.
- Navigation IA simplification (Hub / Editor / Outline / Worldbuilding / AI / Export / Settings) and design-system freeze (no route-level custom primitives).
- Documentation split: user docs (`novellum-docs/user/*`) and developer docs (`novellum-docs/developer/*`); README repositioned as product intro + dev link.
- CI/CD: `ci.yml`, `release.yml`, `visual-tests.yml`, `dependabot.yml`; release scripts; release notes generator.
- Licensing & legal: `LICENSE`, `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, `NOTICE.md`, in-app About + Privacy + License surfaces.
- Error handling: `app-error.ts`, `error-map.ts`, `ErrorNotice`, `RecoveryAction`, structured AI error states, corrupt-backup guidance.
- QA matrix: e2e Playwright suites for first-launch, project creation, autosave, backup/restore, export, settings AI key, error states; fixtures (small/large novel, valid/corrupt backups).
- Performance pass: indexes, lazy loading, debounced analysis, async progress for backup/export, snapshot deduplication.
- App versioning + release policy artifacts (`src/lib/version.ts`, `CHANGELOG.md`, version-sync script).
- Beta program assets and pricing-readiness artifacts.

**Out of scope (covered by `plan-017-v1-trust-foundation`):**

- SQLite canonicalization, Dexie freeze, migration runner, `.novellum` backup format, BYOK secure-store, autosave service core, desktop packaging shell.

**Explicitly deferred past V1:**

- Cloud sync, marketplace, collaboration, plugin system, mobile, multi-provider AI billing, advanced RAG, publishing integrations, automated AI manuscript edits.

## Stages

| #   | Stage                                                                                                | Status     | Est. Duration |
| --- | ---------------------------------------------------------------------------------------------------- | ---------- | ------------- |
| 001 | [Export Quality and Manuscript Compilation](stage-001-export-quality/stage.md)                       | `complete` | 7d            |
| 002 | [Editor Writing-First Refactor](stage-002-editor-writing-first/stage.md)                             | `complete` | 7d            |
| 003 | [Project Hub Trust Cards](stage-003-project-hub-trust/stage.md)                                      | `complete` | 3d            |
| 004 | [Settings Trust Center](stage-004-settings-trust-center/stage.md)                                    | `complete` | 5d            |
| 005 | [AI Assistant V1 Scope and UX](stage-005-ai-assistant-v1-scope/stage.md)                             | `draft`    | 5d            |
| 006 | [First-Run Onboarding](stage-006-onboarding/stage.md)                                                | `draft`    | 4d            |
| 007 | [Worldbuilding V1 Scope Audit](stage-007-worldbuilding-scope-audit/stage.md)                         | `draft`    | 5d            |
| 008 | [Navigation and Design-System Freeze](stage-008-navigation-and-design-system-freeze/stage.md)        | `draft`    | 4d            |
| 009 | [Documentation Tracks](stage-009-documentation-tracks/stage.md)                                      | `draft`    | 4d            |
| 010 | [CI/CD and Release Pipeline](stage-010-cicd-and-release-pipeline/stage.md)                           | `draft`    | 4d            |
| 011 | [Licensing, Privacy, and Legal](stage-011-licensing-privacy-legal/stage.md)                          | `draft`    | 3d            |
| 012 | [QA, Performance, Beta, and V1 Definition-of-Done](stage-012-qa-performance-beta-and-dod/stage.md)   | `draft`    | 8d            |

Stage order follows research §41 (V1 Implementation Roadmap): Export quality → Editor polish → Onboarding/docs → Beta → Release.

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` zero errors; `eslint-plugin-boundaries` clean.
- [ ] **typecheck** — `pnpm run check` zero errors.
- [ ] **tests** — `pnpm run test` passes; service/AI-logic coverage ≥ 80% lines on touched code.
- [ ] **tokens** — `pnpm run check:tokens` zero violations.
- [ ] **visual** — `pnpm run test:visual` and Storybook coverage for Settings, ExportModal, Backup/Restore, SaveStatus, Hub cards, empty/error states.
- [ ] **boundaries** — no route-level custom primitives outside `src/lib/components/ui/*`.
- [ ] **e2e** — Playwright suites in §34 (`tests/e2e/*`) all green on CI.
- [ ] **docs_sync** — `README.md`, `novellum-docs/user/*`, `novellum-docs/developer/*`, `dev-docs/design-system.md`, `CHANGELOG.md` updated.
- [ ] **dod** — V1 Definition-of-Done checklist (research §40) signed off by Reviewer.

## Risks & Mitigations

| Risk                                                                                          | Likelihood | Mitigation                                                                                                                                |
| --------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Editor decomposition regresses autosave/recovery delivered by plan-017 stage-007.             | medium     | Stage 002 entry criteria require all plan-017 stage-007 tests still pass; refactor parts move components, do not rewrite save semantics.  |
| Export driver rewrites break existing user expectations during beta.                          | medium     | Stage 001 keeps the legacy export path behind a feature flag until export-validation tests cover all profiles and at least one external reader (Word, Apple Books) verifies output. |
| Worldbuilding audit hides surfaces users were already relying on.                             | medium     | Stage 007 produces an evidence audit per surface and only hides those failing the persistence/backup/AI-context checks; hidden surfaces can be re-enabled in plan-018.x. |
| Settings tabbed shell drifts visually from Hub/Editor.                                        | low        | Stage 004 reuses primitives from `plan-016-visual-consistency`; Stage 008 design-system freeze enforces no route-level custom UI.         |
| Beta program reveals manuscript-loss bugs after release pipeline is locked.                   | medium     | Stage 012 gates the V1 tag on the full DoD demo and beta success criteria (zero manuscript-loss reports, zero credential leaks).          |
| Licensing/EULA decisions delay release.                                                       | medium     | Stage 011 begins early (parallelizable with Stage 002 onward) so legal text is reviewed before Stage 012 freezes the release candidate.   |
| Performance work surfaces architectural problems too late.                                    | medium     | Stage 012's performance phase runs against the large-novel fixture (100 chapters / 500 scenes / 100k–150k words) before beta tagging.     |

## Notes

- **Source.** [dev-docs/plans/research/market-readiness-pt2.md](../research/market-readiness-pt2.md) is authoritative for stage intent and file-level guidance.
- **Sequencing.** Stages 001–005 deliver the user-visible product surface. Stages 006–009 close UX/IA/docs gaps. Stages 010–011 prepare release. Stage 012 is the gate to V1 tag.
- **Parallelism.** After Stage 001 lands, Stages 002, 003, 004, and 005 may run in parallel (different surface owners). Stage 008 (design-system freeze) must follow Stages 002–005 to avoid re-freezing components mid-flight.
- **Svelte 5 runes** are mandatory for all new components and `.svelte.ts` stores.
- **Boundaries.** Per `eslint-plugin-boundaries`: `src/modules/<domain>/components/*` may not import from another module's components; cross-module communication goes through services and shared `src/lib/*` primitives.
- **Founder-license demo** (research §43) is the literal acceptance test: install → onboard → write → AI → close → reopen → export DOCX → backup → delete → restore → confirm credential exclusion.
