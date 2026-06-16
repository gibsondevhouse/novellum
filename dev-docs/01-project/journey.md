# Journey: How Novellum got to where it is

> Last verified: 2026-06-16
> Audience: a collaborator joining now who wants to trace the workflow from inception to today.

This is the chronological narrative built from [plans/MASTER-PLAN.md](../plans/MASTER-PLAN.md), [plans/archive/](../plans/archive/), and [../../CHANGELOG.md](../../CHANGELOG.md). Read it top-down to see the order in which the codebase was built.

## How to read this

Each entry: **Plan ID** — Outcome — Surface(s) affected — Status. Click the plan to see the full breakdown (stages → phases → parts).

When you encounter a feature in code and want to understand *why* it was built that way, find the plan that introduced it here and read its `plan.md`.

---

## Era 1 — Foundations (early plans, completed)

UI scaffolding, state hardening, and the first generation of editor + structural surfaces.

- [plan-001-ui-and-interaction-model](../plans/archive/plan-001-ui-and-interaction-model/plan.md) — UI and interaction model foundations. **Surface:** layout shells, sidebar, base components.
- [plan-002-service-layer-and-state-hardening](../plans/archive/plan-002-service-layer-and-state-hardening/plan.md) — Service layer + state discipline. **Surface:** stores, services, repositories.
- [plan-003-advanced-editing-and-feature-completion](../plans/archive/plan-003-advanced-editing-and-feature-completion/plan.md) — Advanced editing + feature completion. **Surface:** editor module, TipTap integration.
- [plan-004-documentation](../plans/archive/plan-004-documentation/plan.md) — Initial documentation pass. **Surface:** dev-docs.
- [plan-005-context-docs](../plans/archive/plan-005-context-docs/plan.md) — Context documentation. **Surface:** AI context layer documentation.

## Era 2 — Refactors (linearization, identity, navigation)

Big systems-level refactors to set the visual and structural identity.

- [plan-linearization-overhaul](../plans/archive/plan-linearization-overhaul/plan-linearization-overhaul.md) — Systems-level UI/UX refactor for "Linear" aesthetic and Svelte 5 standardization.
- [plan-feature-realization](../plans/archive/plan-feature-realization/plan-feature-realization.md) — Implementation of remaining stubbed features (AI Engine, Continuity, Outline, Nova, Images).
- [refactor-001-ui_ux-polish](../plans/archive/refactor-001-ui_ux-polish/plan.md) — UI/UX polish.
- [refactor-002-story-planning-workspace](../plans/archive/refactor-002-story-planning-workspace/plan.md) — Story planning workspace refactor.
- [refactor-003-hub-story-identity](../plans/archive/refactor-003-hub-story-identity/plan.md) — Hub + story identity refactor.
- [refactor-004-navigation-and-structure](../plans/archive/refactor-004-navigation-and-structure/plan.md) — Navigation + structural refactor.
- [refactor-005-workspace-surface](../plans/archive/refactor-005-workspace-surface/plan.md) — Workspace surface refactor.
- [refactor-006-frontend-production-readiness](../plans/archive/refactor-006-frontend-production-readiness/refactor-006-frontend-production-readiness.md) — Production-grade frontend hardening: error boundaries, a11y, design-system enforcement. Completed 2026-04-14.
- [refactor-007-ui-surface-consistency](../plans/archive/refactor-007-ui-surface-consistency/plan.md) — Route reachability + cross-surface visual consistency. Completed 2026-07-16 (per archive note).
- [refactor-008-frontend-agent-spec-refactor](../plans/archive/refactor-008-frontend-agent-spec-refactor/plan.md) — Consolidated rewrite of frontend agent spec. Completed 2026-04-14.
- [refactor-009-app-page-surface-refactor](../plans/archive/refactor-009-app-page-surface-refactor/plan.md) — Unified app-page surface contracts. Completed 2026-04-14.
- [refactor-010-visual-consistency-enforcement](../plans/archive/refactor-010-visual-consistency-enforcement/plan.md) — Visual consistency enforcement. Completed 2026-04-14.

## Era 3 — Product surfaces (homepage, library, projects sidebar, images, styles)

Concrete features the user sees.

- [plan-006-portability-backup-and-restore](../plans/archive/plan-006-portability-backup-and-restore/plan.md) — `.novellum.zip` export/import on Dexie. **Surface:** backup/restore endpoints + UI.
- [plan-006-project-context](../plans/archive/plan-006-project-context/plan.md) — Project context + active-project wiring. **Surface:** [src/lib/stores/active-project.svelte.ts](../../src/lib/stores/active-project.svelte.ts).
- [plan-007-homepage](../plans/archive/plan-007-homepage/plan.md) — Editorial projects library homepage. **Surface:** root route.
- [plan-010-writing-styles](../plans/archive/plan-010-writing-styles/) — Writing styles + AI prompt customization. **Surface:** AI style presets, settings.
- [plan-011-images-gallery-refactor](../plans/archive/plan-011-images-gallery-refactor/plan.md) — Images gallery refactor.
- [plan-011-restore-projects-sidebar-nav](../plans/archive/plan-011-restore-projects-sidebar-nav/plan.md) — Restored "Projects" as a top-level sidebar nav item; swapped projects page column order. Completed 2026-04-16.
- [plan-012-codebase-extraction-refactor](../plans/archive/plan-012-codebase-extraction-refactor/plan.md) — Codebase-wide extraction of duplicated repository patterns, store CRUD boilerplate, API route helpers, module constants/types, barrel cleanup. ~840 net line reduction across ~66 files. Completed 2025-07-17.

## Era 4 — Local SQLite era

The single largest architectural shift: from Dexie-only to server-side SQLite as the source of truth.

- [plan-008-local-sqlite](../plans/archive/plan-008-local-sqlite/plan.md) — Server-side SQLite via `better-sqlite3` + `/api/db/*`. **Outcome:** [src/lib/server/db/](../../src/lib/server/db/) became the source of truth; Dexie retained only for portability bundles.

## Era 5 — Documentation and visual cohesion

Bringing docs and visual surfaces into alignment with the now-shipped system.

- [plan-014-documentation-refresh](../plans/archive/plan-014-documentation-refresh/plan.md) — Refreshed dev-docs and novellum-docs to match the shipped system (SvelteKit 2, Svelte 5 Runes, SQLite + Dexie v11 portability, unified world-building shell, 4 shipped agents + 4 planned). Completed 2026-04-20.
- [plan-015-cinematic-media](../plans/archive/plan-015-cinematic-media/plan-015-cinematic-media.md) — Cinematic media gallery + novel production suite polish across shell, tokens, world-building, workflows. 8 stages; gates pass (tokens 0, lint 0, check 0, tests 241/241, visual 6/6). Completed 2026-04-21.
- [plan-016-visual-consistency](../plans/plan-016-visual-consistency/plan.md) — Frontend-wide visual consistency. Closed 2026-04-28 via hybrid path; remaining scope absorbed into plan-018.

## Era 6 — Workspace hierarchy

The first plan to ship the full Arc → Act → Chapter → Scene UI on top of the SQLite hierarchy.

- [plan-013-workspace-hierarchy-flow](../plans/plan-013-workspace-hierarchy-flow/plan.md) — Build the Arc → Act → Chapter → Scene navigable UI on top of the already-shipped SQLite hierarchy. Adds `act-repository`, a Svelte 5 hierarchy store, replaces the `/projects/[id]/arcs` placeholder with a real workspace, and ships drilldown routes into the editor. **Status:** complete, v2.0.0, rewritten 2026-04-28.

## Era 7 — Internal V1 trust foundation

The "stop the bleeding" foundation for the internal V1 desktop milestone.

- [plan-system-refactoring](../plans/archive/plan-system-refactoring/plan-system-refactoring.md) — Strategic anchor for system refactoring. **Superseded** 2026-04-28 by plan-017.
- [plan-017-v1-trust-foundation](../plans/archive/plan-017-v1-trust-foundation/plan.md) — Internal V1 trust, storage, credential, backup, packaging foundation. 8 stages: stop-the-bleeding, SQLite source-of-truth, versioned migrations, backup/restore, BYOK security, app-data path, autosave/recovery, desktop packaging. **Status:** complete (closed 2026-04-30).

## Era 8 — Internal V1 product experience (closed 2026-05-06)

Bringing the app to an internal V1 product milestone on top of the trust foundation.

- [plan-018-v1-product-experience](../plans/archive/plan-018-v1-product-experience/plan.md) — Internal V1 product experience and release. 12 stages: export quality, editor writing-first refactor, hub trust cards, settings trust center, AI assistant V1 scope, onboarding, worldbuilding audit, design-system freeze, doc tracks, CI/release, licensing, QA + beta + V1 DoD. **Status:** complete.
- [plan-020-fixes-and-nova-identity](../plans/archive/plan-020-fixes-and-nova-identity/plan.md) — Three trust-restoring bug fixes (Nova identity prompt, OpenRouter key persistence, hub word count). **Status:** complete.
- [plan-022-settings-ia](../plans/archive/plan-022-settings-ia/plan.md) — Categorized PillNav settings shell (Appearance, Defaults, Shortcuts, AI, Data) and typed `/api/db/preferences` foundation. **Status:** complete.
- [plan-023-editor-redesign-and-nova-copilot](../plans/archive/plan-023-editor-redesign-and-nova-copilot/plan.md) — Word-processor-style editor + right-panel Nova copilot (chat + RAG, agentic stubs, view-in-reader handoff). **Status:** complete.

## Era 9 — V1.1 fiction pipeline & cleanup (closed 2026-05-27)

Closed out the leftover narrowly-scoped plans and shipped the staged fiction pipeline.

- [plan-019-naming-consistency](../plans/archive/plan-019-naming-consistency/plan.md) — Codebase-wide naming alignment. **Status:** retired (2026-05-27 via plan-029) — superseded by organic evolution through plans 020–028.
- [plan-021-reader-pagination](../plans/archive/plan-021-reader-pagination/plan.md) — Reader empty state + pagination engine. **Status:** retired (2026-05-27 via plan-029) — fully shipped via plans 027/028.
- [plan-024-v1-final-mile](../plans/archive/plan-024-v1-final-mile/plan.md) — Internal V1 Definition-of-Done closure. **Status:** complete (47/47 DoD, closed 2026-05-26).
- [plan-027-v1.1-scoping](../plans/archive/plan-027-v1.1-scoping/plan.md) — Internal V1.1 staged fiction pipeline (foundation, Vibe-Worldbuild, Vibe-Author). **Status:** complete (closed 2026-05-27).
- [plan-028-v1.1-hierarchical-pipeline-ui](../plans/archive/plan-028/plan.md) — Outline-first hierarchical pipeline UI. **Status:** complete (closed 2026-05-26).
- [plan-029-v1.1-unfinished-work-closeout](../plans/archive/plan-029-v1.1-unfinished-work-closeout/plan.md) — Closeout umbrella that retired plans 019/021 and deferred release engineering to a dedicated track. **Status:** complete (closed 2026-05-27).

## Era 10 — Nova production & worldbuild generation (closed 2026-06-01)

Nova production refactor, VS Code Copilot parity, worldbuilding generation pipeline, and the novel engine v1 draft loop.

- [plan-030-nova-production-refactor](../plans/archive/plan-030-nova-production-refactor/plan.md), [plan-031-nova-vscode-copilot-parity](../plans/archive/plan-031-nova-vscode-copilot-parity/plan.md), [plan-032-worldbuilding-generation-engine](../plans/archive/plan-032-worldbuilding-generation-engine/plan.md), [plan-034](../plans/archive/plan-034/plan.md), [plan-035-fix-json-double-encoding](../plans/archive/plan-035-fix-json-double-encoding/plan.md), [plan-036-context-priority-generation](../plans/archive/plan-036-context-priority-generation/plan.md), [plan-037-agentic-worldbuild-scan](../plans/archive/plan-037-agentic-worldbuild-scan/plan.md), [plan-038-novel-engine-v1](../plans/plan-038/plan.md), [plan-041-docs-rebaseline-internal-version](../plans/plan-041-docs-rebaseline-internal-version/plan.md). All complete. See [../01-project/roadmap.md](./roadmap.md) for the per-plan summary.

## Era 11 — AI integration milestones (closed 2026-06-04)

Manuscript export UI, outline generation, and quality gate restoration.

- [plan-039-manuscript-export-ui](../plans/plan-039-manuscript-export-ui/plan.md) — Manuscript export UI (subset selector, delivery helper).
- [plan-040-outline-generation](../plans/plan-040-outline-generation/plan.md) — Worldbuilding-to-Outline review-gated proposal flow.
- [plan-042-quality-gates-closure](../plans/plan-042-quality-gates-closure/plan.md) — Restored clean check/lint/test baselines.

## Era 12 — Infrastructure hardening (closed 2026-06-15)

Active context routing, mutation boundaries, pipeline reconciliation, and agent runtime hardening.

- [plan-044-nova-active-context-routing](../plans/plan-044-nova-active-context-routing/plan.md) — Resolved Nova context from routes.
- [plan-045-agent-tool-mutation-boundary](../plans/plan-045-agent-tool-mutation-boundary/plan.md) — Separated AI reading from manuscript mutation.
- [plan-043-outline-pipeline-consolidation](../plans/plan-043-outline-pipeline-consolidation/plan.md) — Checkpoints as the sole outline materialization path.
- [plan-046-pipeline-checkpoint-contract-reconciliation](../plans/plan-046-pipeline-checkpoint-contract-reconciliation/plan.md) — Aligned pipeline schemas and routes.
- [plan-047-worldbuilding-canon-merge-diff](../plans/plan-047-worldbuilding-canon-merge-diff/plan.md) — Reviewable worldbuilding canon diff/merge.
- [plan-049-agent-runtime-stack-hardening](../plans/plan-049-agent-runtime-stack-hardening/plan.md) — Durable agent runs, job execution, and traces.

## Era 13 — Governed runtime & trust closure (active review)

Centralized AI control, frontend coherence, and trust-closing product polish.

- [plan-051-governed-ai-controller-runtime](../plans/plan-051-governed-ai-controller-runtime/plan.md) — Server-side governed AI controller. **Status:** Review.
- [plan-048-frontend-experience-coherence](../plans/plan-048-frontend-experience-coherence/plan.md) — Unified navigation, review gates, and visual state. **Status:** Review.
- [plan-052-pipeline-nova-editor-trust-closure](../plans/plan-052-pipeline-nova-editor-trust-closure/plan.md) — Durable review-gated Nova artifacts and revision acks. **Status:** Review.
- [plan-053-worldbuilding-outline-review-flow-closure](../plans/plan-053-worldbuilding-outline-review-flow-closure/plan.md) — Persisted worldbuilding proposals and generation status polish. **Status:** Review.

---

## Cross-references

- **CHANGELOG:** [../../CHANGELOG.md](../../CHANGELOG.md) — generated via `pnpm changelog`.
- **QA / user problems ledger:** [../qa-docs/](../qa-docs/) — source of truth for plans 020–023.
- **Audits:** [../audits/](../audits/) — component inventory, world-building audit, etc.
- **Implementation logs:** [../implementation-logs/](../implementation-logs/) — free-form session notes.
- **Planning conventions:** [../05-workflow/planning-conventions.md](../05-workflow/planning-conventions.md) — how the 4-tier system works.

If a plan you see in [../plans/MASTER-PLAN.md](../plans/MASTER-PLAN.md) is missing from this page, the page is out of date — please add it.

