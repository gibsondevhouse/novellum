---
title: Arc Workspace and Hierarchy Flow
slug: plan-013-workspace-hierarchy-flow
version: 2.0.0
status: complete
owner: Planner Agent
created: 2026-04-16
last_updated: 2026-04-28
target_completion: 2026-06-30
stages:
  - stage-001-hierarchy-data-services
  - stage-002-arcs-index-workspace
  - stage-003-arc-detail-workspace
  - stage-004-act-chapter-scene-drilldown
  - stage-005-hierarchy-qa-and-tests
dependencies:
  - plan-017-v1-trust-foundation
quality_gates:
  - lint
  - typecheck
  - tests
  - tokens
  - boundaries
---

## Objective

Surface the Arc → Act → Chapter → Scene hierarchy in real product UI. The data layer for the hierarchy already exists in SQLite — `arcs`, `acts` (with `arcId`), `chapters` (with `actId`), and `scenes` (with `chapterId`) all have tables, REST endpoints, and reorder support, and `Act.arcId` is already type-safe. What is missing is the writer-facing UI: `/projects/[id]/arcs` is a "coming soon" placeholder, there is no client repository for acts, no scoped hierarchy store, and no navigable Arc → Act → Chapter → Scene flow outside the outliner. This plan builds that flow.

## Scope

**In scope:**

- Client repository for `acts` (parity with existing `arc-repository`, `chapter-repository`, `scene-repository`).
- Scoped query helpers: `getActsByArcId`, `getChaptersByActId`, `getScenesByChapterId` (where missing).
- Svelte 5 hierarchy store (`$state` + `$derived` in a `.svelte.ts`) tracking selected Arc / Act / Chapter context with persistence across mode/route changes.
- Real `/projects/[id]/arcs` workspace: list, create, edit, reorder, delete arcs.
- New `/projects/[id]/arcs/[arcId]` route: arc detail surface that lists scoped acts and surfaces unassigned acts.
- Drilldown to act detail (chapters scoped to act) and chapter detail (scenes scoped to chapter) with links into the editor.
- Unassigned grouping for legacy data (acts without `arcId`, chapters without `actId`).
- Vitest coverage for new repositories + store; one Playwright e2e covering full Arc → Act → Chapter → Scene creation.

**Out of scope:**

- Schema changes — the SQLite schema is already in place; no migrations are needed by this plan.
- Editor mode system, focus mode, or `SceneNavigator` redesign — those belong to [plan-018 stage-002](../plan-018-v1-product-experience/stage-002-editor-writing-first/stage.md) and are explicitly outside this plan to avoid duplication.
- Outliner refactor — the outliner already wires hierarchy via `outline-data-service.ts`; this plan does not change it.
- Continuity/AI integration with hierarchy — handled by other plans.
- Visual redesign of canonical primitives — this plan composes existing primitives (`WorkspaceShell`, `WorkspaceHero`, `SurfacePanel`, `EmptyStatePanel`, `GhostButton`).

## Stages

| #   | Stage                                                                             | Status     | Est. Duration |
| --- | --------------------------------------------------------------------------------- | ---------- | ------------- |
| 001 | [Hierarchy Data Services](stage-001-hierarchy-data-services/stage.md)             | `complete` | 2d            |
| 002 | [Arcs Index Workspace](stage-002-arcs-index-workspace/stage.md)                   | `complete` | 2d            |
| 003 | [Arc Detail Workspace](stage-003-arc-detail-workspace/stage.md)                   | `complete` | 2d            |
| 004 | [Act / Chapter / Scene Drilldown](stage-004-act-chapter-scene-drilldown/stage.md) | `complete` | 3d            |
| 005 | [Hierarchy QA & Tests](stage-005-hierarchy-qa-and-tests/stage.md)                 | `complete` | 1d            |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` passes (includes `eslint-plugin-boundaries`).
- [ ] **typecheck** — `pnpm run check` passes with zero type errors in touched files.
- [ ] **tests** — `pnpm run test` passes; new repositories and the hierarchy store reach ≥ 80% line coverage.
- [ ] **tokens** — `node scripts/check-visual-tokens.mjs` reports zero violations on touched files.
- [ ] **boundaries** — no FSD/VSA module leakage introduced. Hierarchy store lives in `src/modules/project/stores/`. Acts repository lives in `src/modules/project/services/`.
- [ ] **e2e** — Playwright spec `tests/e2e/arc-hierarchy-flow.spec.ts` runs green: create Arc → create Act under it → create Chapter under that Act → create Scene under that Chapter → reload → verify hierarchy persists.
- [ ] **docs_sync** — `dev-docs/data-model.md` and `dev-docs/routing-context.md` updated to reflect the new arcs detail route and hierarchy navigation contract.

## Dependencies

- **plan-017-v1-trust-foundation** (soft). Stage 002 of plan-017 ratifies SQLite as the source of truth for hierarchy data and locks down migration discipline. plan-013 can begin in parallel because the hierarchy tables and endpoints already exist on `master`, but any write paths added here must be revisited if plan-017 stage-002 changes the canonical schema invariants. No code dependency that would block stage-001 from starting.

## Risks & Mitigations

| Risk                                                                                              | Likelihood | Mitigation                                                                                                                         |
| ------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Overlap with plan-018 stage-002 (Editor Writing-First Planning mode)                              | medium     | Out-of-scope contract above. plan-013 owns the standalone `/projects/[id]/arcs` family; plan-018 owns the editor-embedded planner. |
| Legacy data without `arcId` / `actId` becomes invisible                                           | medium     | Stage 003/004 surface explicit "Unassigned" groups; the store never silently filters orphaned records.                             |
| Hierarchy store state leaks across projects                                                       | low        | Store keys all selection state by `projectId`; route guards reset state on project change.                                         |
| New Acts repository drifts from `chapter-repository` / `scene-repository` patterns                | medium     | Stage 001 mirrors existing repository module shape exactly; lint + type-check enforce parity.                                      |
| `/projects/[id]/arcs` placeholder page links to "coming soon" today; replacement may break a11y   | low        | Stage 002 reuses `WorkspaceShell` + `WorkspaceHero` primitives, which are already a11y-verified.                                   |

## Notes

- **Owners.** Stage 001 is Backend-led (services + store). Stages 002–004 are Architect-led (route shells + composition) with Stylist consultation on hero/empty-state copy. Stage 005 is Reviewer-led.
- **Svelte 5 only.** All new components must use `$state`, `$derived`, `.svelte.ts`. Legacy Svelte 4 patterns are not acceptable.
- **No new tokens.** All visual treatment uses existing tokens from `src/styles/tokens.css`. If a new token is genuinely required, raise it as a separate plan; do not add tokens inside plan-013.
- **No `window.location.href`.** Navigation uses `goto()` only.
- **Plan history.** v1.0.0 of this plan was authored 2026-04-16 against the pre-SQLite stack and assumed a unified `workspace-mode` store + `ActsWorkspace`/`ChaptersWorkspace`/`ScenesWorkspace` components that were never implemented. v2.0.0 (this revision) targets the actual current architecture: SQLite-backed APIs in place, arcs route is a placeholder, build the missing UI on top.
