# MASTER PLAN: Novellum Development

> Last reconciled: 2026-05-30 (plan-035 initiation)

## Active Plans

- [plan-035-fix-json-double-encoding](./plan-035-fix-json-double-encoding/plan.md): Fix GeneratedEntityModal Double-Encoding + JSON Hardening. Critical bug fix (UI freeze on Realms page). 1 stage, 3 phases. Status: `in-progress` (started 2026-05-30). Targets completion 2026-05-31.

## Deferred (not yet scheduled)

- **plan-034-world-building-workflow-refactor** — Stage 001 complete; stages 002–004 pending. Deferred to resume after plan-035 completion.
- **Release engineering** — code signing, notarization, brand icons, formal smoke/keyring verification. Infrastructure exists; requires external procurement. Originally plan-024 stage-002.

## Completed Plans (Archived)

- [plan-032-worldbuilding-generation-engine](./plan-032-worldbuilding-generation-engine/plan.md): Worldbuilding Generation Engine + Help Disclosure — one-click AI entity generation (7 entity kinds), review modal, help-disclosure toggles, AppShell fix. Status: `complete` (closed 2026-05-29). Quality gates: check (0 errors), lint (clean), lint:css (clean), test (194 files / 1359 tests), check:tokens (0 violations).
- [plan-031-nova-vscode-copilot-parity](./plan-031-nova-vscode-copilot-parity/plan.md): Nova VS Code Copilot Parity — compact sidepanel, Ask/Write/Agent modes, real attachments, bounded agentic tool loop. 5 stages. Status: `complete` (closed 2026-05-28). Quality gates: check (0 errors), lint (clean), test (194 files / 1358 tests), check:tokens (0 violations). Visual test waived (same basis as plan-030).
- [plan-030-nova-production-refactor](./plan-030-nova-production-refactor/plan.md): Nova production refactor focused on trust repair. 4 stages. Status: `complete` (closed 2026-05-28). Quality gates: `check`, `lint`, `lint:css`, and full `test` passed (190 files / 1299 tests). Full visual suite reported pre-existing cross-surface snapshot drift; targeted Nova visual specs were executed as documented substitute (2 passed, 3 skipped).
- [plan-029-v1.1-unfinished-work-closeout](./plan-029-v1.1-unfinished-work-closeout/plan.md): V1.1 Unfinished Work Closeout umbrella. 4 stages. Status: `complete` (closed 2026-05-27). Retired plan-019, plan-021, plan-024 stage-003 as shipped. Executed plan-024 stage-006 docs rebaseline. Deferred plan-024 stage-002 (release engineering) to dedicated plan. Quality gates: 187 files / 1270 tests; 325 files / 0 token violations.
- [plan-028-v1.1-hierarchical-pipeline-ui](./plan-028/plan.md): Outline-first hierarchical pipeline UI — Arc → Stage traversal, worldbuild run flow, checkpoint review console, verification/doc sync. 4 stages, 10 parts. Status: `complete` (closed 2026-05-26; 187 files / 1268 vitest tests; token guard 0 violations; 7 Playwright e2e specs covering traversal, run, review, accept/reject, failure flows; docs reconciled with shipped behavior).
- [plan-027-v1.1-scoping](./plan-027-v1.1-scoping/plan.md): V1.1 staged fiction pipeline delivery — pipeline foundation, Vibe-Worldbuild, Vibe-Author. 3 stages. Status: `complete` (closed 2026-05-27; 177 files / 1156 vitest tests; token guard 0 violations; Playwright review-gate coverage for both worldbuild and author surfaces).
- [plan-024-v1-final-mile](./archive/plan-024-v1-final-mile/plan.md): V1 Definition-of-Done closure & release engineering. 6 stages. Status: `complete` (closed 2026-05-26, 47/47 DoD). Deferred stages resolved by plan-029 (2026-05-27): stage-003 retired (shipped), stage-006 executed (reduced scope), stage-002 deferred to dedicated release plan.
- [plan-021-reader-pagination](./archive/plan-021-reader-pagination/plan.md): Reader empty state + pagination engine. 4 stages. Status: `retired` (2026-05-27, plan-029) — fully shipped via plans 027/028. See [CLOSEOUT.md](./archive/plan-021-reader-pagination/CLOSEOUT.md).
- [plan-019-naming-consistency](./archive/plan-019-naming-consistency/plan.md): Codebase-wide naming alignment. 6 stages. Status: `retired` (2026-05-27, plan-029) — superseded by organic evolution through plans 020-028. See [CLOSEOUT.md](./archive/plan-019-naming-consistency/CLOSEOUT.md).
- [plan-026-ui-v2-design-system](./archive/plan-026-ui-v2-design-system/plan.md): UI refactor adopting the Novellum v2 "author-first" design system as the source of visual truth. 6 stages. Status: `complete` (closed 2026-05-26).
- [plan-025-functional-after-build](./archive/plan-025-functional-after-build/plan.md): V1 functional-after-build hardening. App-data path correctness inside the Tauri sidecar, cut 4 unimplemented agents from V1 surface, smoke harness extended 4 → 7 probes, `smoke:built` wired into CI. Status: `complete` (closed 2026-05-13).
- [plan-023-editor-redesign-and-nova-copilot](./archive/plan-023-editor-redesign-and-nova-copilot/plan.md): Word-processor-style editor refactor and right-panel Nova copilot. 8 stages. Status: `complete` (last updated 2026-05-04).
- [plan-022-settings-ia](./archive/plan-022-settings-ia/plan.md): Settings information architecture rebuild — categorized PillNav shell with Appearance, Defaults, Shortcuts, AI, Data. 7 stages. Status: `complete` (last updated 2026-05-06).
- [plan-020-fixes-and-nova-identity](./archive/plan-020-fixes-and-nova-identity/plan.md): Three trust-restoring bug fixes — Nova identity prompt, OpenRouter key save persistence, hub word count accuracy. 4 stages. Status: `complete` (last updated 2026-05-06).
- [plan-018-v1-product-experience](./archive/plan-018-v1-product-experience/plan.md): V1 sellable product experience and release. 12 stages. Status: `complete` (last updated 2026-05-06).
- [plan-017-v1-trust-foundation](./archive/plan-017-v1-trust-foundation/plan.md): V1 sellable trust, storage, credential, backup, and packaging foundation. 8 stages. Status: `complete` (closed 2026-04-30).
- [plan-013-workspace-hierarchy-flow](./archive/plan-013-workspace-hierarchy-flow/plan.md): Arc → Act → Chapter → Scene navigable UI on top of the SQLite hierarchy. 5 stages. Status: `complete`.

- [plan-016-visual-consistency](./archive/plan-016-visual-consistency/plan.md): Frontend-wide visual consistency refactor. 9 stages, 23 phases, 27 parts. Closed 2026-04-28 via hybrid path: stages 001–005, 007 phase-002 (Consistency Engine cosmetic refit), 008, and 009 phase-002 executed in-place; stage 006, stage 007 phases 001/003, and stage 009 phase-001 (screenshot matrix) transferred to plan-018 (stages 002, 005, 001, 012 respectively) to avoid duplicating work that the V1 product rebuilds will redo.
- [plan-system-refactoring](./archive/plan-system-refactoring/plan-system-refactoring.md): Strategic anchor for system refactoring & stabilization. Superseded 2026-04-28 by plan-017-v1-trust-foundation, which operationalizes the same trust/storage/credential concerns against the market-readiness research.
- [plan-015-cinematic-media](./archive/plan-015-cinematic-media/plan-015-cinematic-media.md): Transform every visible Novellum surface into a polished cinematic media gallery and novel production suite. 8 stages across shell, tokens, world-building, workflows, and verification. All automated gates pass (tokens: 0 violations, lint: 0 errors, check: 0 errors, tests: 241/241, visual: 6/6). Completed 2026-04-21.

- [plan-014-documentation-refresh](./archive/plan-014-documentation-refresh/plan.md): Refreshed every authoritative documentation artifact under `dev-docs/` and `novellum-docs/` to match the shipped system (SvelteKit 2, Svelte 5 Runes, SQLite + Dexie v11 portability, unified world-building shell, 4 shipped agents + 4 planned). 5 stages, 7 phases, 13 parts. Completed 2026-04-20.
- [plan-012-codebase-extraction-refactor](./archive/plan-012-codebase-extraction-refactor/plan.md): Codebase-wide extraction of duplicated repository patterns, store CRUD boilerplate, API route helpers, module constants/types, and barrel cleanup. ~840 net line reduction across ~66 files. Completed 2025-07-17.
- [plan-011-restore-projects-sidebar-nav](./archive/plan-011-restore-projects-sidebar-nav/plan.md): Restored "Projects" as a top-level sidebar nav item; swapped projects page column order (Stories left, Books right). Completed 2026-04-16.
- [plan-011-images-gallery-refactor](./archive/plan-011-images-gallery-refactor/plan.md): Images gallery refactor. Completed.
- [plan-010-writing-styles](./archive/plan-010-writing-styles/): Writing styles and AI prompt customization. Completed.
- [plan-008-local-sqlite](./archive/plan-008-local-sqlite/plan.md): Server-side SQLite data layer via `better-sqlite3` + `/api/db/*`. Completed (shipped).
- [plan-007-homepage](./archive/plan-007-homepage/plan.md): Editorial projects library homepage. Completed (shipped).
- [plan-006-portability-backup-and-restore](./archive/plan-006-portability-backup-and-restore/plan.md): `.novellum.zip` export/import workflow on Dexie. Completed (shipped).
- [plan-006-project-context](./archive/plan-006-project-context/plan.md): Project context / active-project wiring. Completed.
- [plan-005-context-docs](./archive/plan-005-context-docs/plan.md): Context documentation. Completed.
- [plan-004-documentation](./archive/plan-004-documentation/plan.md): Initial documentation pass. Completed.
- [plan-003-advanced-editing-and-feature-completion](./archive/plan-003-advanced-editing-and-feature-completion/plan.md): Advanced editing and feature completion. Completed.
- [plan-002-service-layer-and-state-hardening](./archive/plan-002-service-layer-and-state-hardening/plan.md): Service layer and state hardening. Completed.
- [plan-001-ui-and-interaction-model](./archive/plan-001-ui-and-interaction-model/plan.md): UI and interaction model foundations. Completed.
- [plan-feature-realization](./archive/plan-feature-realization/plan-feature-realization.md): Implementation of remaining stubbed features (AI Engine, Continuity, Outline, Nova, Images). Completed.
- [plan-linearization-overhaul](./archive/plan-linearization-overhaul/plan-linearization-overhaul.md): Systems-level UI/UX refactor for "Linear" aesthetic and Svelte 5 standardization. Completed.
- [refactor-010-visual-consistency-enforcement](./archive/refactor-010-visual-consistency-enforcement/plan.md): Visual consistency enforcement across route families. Completed 2026-04-14.
- [refactor-009-app-page-surface-refactor](./archive/refactor-009-app-page-surface-refactor/plan.md): App page family refactor to unified surface contracts. Completed 2026-04-14.
- [refactor-008-frontend-agent-spec-refactor](./archive/refactor-008-frontend-agent-spec-refactor/plan.md): Consolidated rewrite of frontend agent spec. Completed 2026-04-14.
- [refactor-007-ui-surface-consistency](./archive/refactor-007-ui-surface-consistency/plan.md): Route reachability and cross-surface visual consistency refactor. Completed 2026-07-16.
- [refactor-006-frontend-production-readiness](./archive/refactor-006-frontend-production-readiness/refactor-006-frontend-production-readiness.md): Production-grade frontend hardening — error boundaries, a11y, UX consistency, design system enforcement. Completed 2026-04-14.
- [refactor-005-workspace-surface](./archive/refactor-005-workspace-surface/plan.md): Workspace surface refactor. Completed (shipped).
- [refactor-004-navigation-and-structure](./archive/refactor-004-navigation-and-structure/plan.md): Navigation and structural refactor. Completed.
- [refactor-003-hub-story-identity](./archive/refactor-003-hub-story-identity/plan.md): Hub + story identity refactor. Completed.
- [refactor-002-story-planning-workspace](./archive/refactor-002-story-planning-workspace/plan.md): Story planning workspace refactor. Completed.
- [refactor-001-ui_ux-polish](./archive/refactor-001-ui_ux-polish/plan.md): UI/UX polish refactor. Completed.

## Quality Gates

- All components must use Svelte 5 Runes.
- No hardcoded pixel values (must use `--space-*` tokens).
- 100% test coverage for new UI primitives.
- Accessibility (A11y) audit pass.
