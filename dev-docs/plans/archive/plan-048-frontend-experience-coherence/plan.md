---
title: Frontend Experience Coherence
slug: plan-048-frontend-experience-coherence
version: 1.0.0
status: review
owner: Planner Agent
created: 2026-06-09
last_updated: 2026-06-15
target_completion: ~
stages:
  - stage-001-experience-inventory-and-principles
  - stage-002-navigation-and-context-contract
  - stage-003-author-workflow-unification
  - stage-004-design-system-and-release-evidence
dependencies:
  - plan-043-outline-pipeline-consolidation
  - plan-044-nova-active-context-routing
  - plan-045-agent-tool-mutation-boundary
  - plan-046-pipeline-checkpoint-contract-reconciliation
  - plan-047-worldbuilding-canon-merge-diff
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - e2e
  - check:tokens
---

## Objective

Make Novellum's frontend read as one coherent agentic novel and world-building workspace instead of a collection of separately evolved surfaces.

This plan defines the final user-facing experience pass after the core engine contracts are stabilized by plans 043-047. It should clarify navigation, active context, workspace layout, review gates, empty states, loading states, and visual consistency without weakening the review-gated AI mutation boundary.

## Scope

**In scope:**

- Audit the current route, shell, sidebar, project workspace, Nova panel, editor, outline, world-building, export, settings, and onboarding surfaces.
- Define a route and context model that lets authors understand where they are, what project/scene/chapter is active, and what Nova can safely act on.
- Standardize frontend review surfaces for outline checkpoints, author drafts, worldbuilding proposals, and future diff/merge cards.
- Align empty states, loading states, error states, toasts, progress indicators, and review-gate affordances across author workflows.
- Consolidate duplicated visual patterns into existing design primitives where possible.
- Add browser, responsive, accessibility, and docs evidence for the final production readiness pass.

**Out of scope:**

- Rebuilding the underlying AI pipeline contracts before plans 043-047 are complete.
- Changing model behavior, prompt schemas, or mutation tools except where frontend affordances need to reflect canonical contracts.
- Adding new product modules unrelated to authoring, world-building, drafting, review, or export.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Experience Inventory & Principles](stage-001-experience-inventory-and-principles/stage.md) | `complete` | 4h |
| 002 | [Navigation & Context Contract](stage-002-navigation-and-context-contract/stage.md) | `complete` | 2h |
| 003 | [Author Workflow Unification](stage-003-author-workflow-unification/stage.md) | `complete` | 2h |
| 004 | [Design System & Release Evidence](stage-004-design-system-and-release-evidence/stage.md) | `review` | 1h |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [x] **lint** - zero lint errors
- [x] **lint:css** - zero CSS lint errors
- [x] **typecheck** - zero type errors and zero warnings
- [x] **tests** - Vitest suite passes
- [x] **e2e** - targeted project, editor, outline, Nova, worldbuilding, and export flows pass
- [x] **check:tokens** - zero token violations
- [x] **browser_evidence** - desktop and mobile screenshots prove the primary author workflows render coherently
- [x] **docs_sync** - user and developer docs describe the final workspace model

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| UI cleanup starts before engine contracts are stable | high | Keep this plan deferred until the dependent contract plans are implemented or explicitly pulled forward |
| Refactor changes visual surfaces without improving author workflows | medium | Begin with workflow inventory and acceptance criteria tied to real author tasks |
| Review-gated AI flows become visually inconsistent across modules | high | Standardize accept/reject/diff/status components after mutation-boundary plans settle |
| Broad frontend refactor creates regressions in route state | medium | Require targeted unit tests and Playwright coverage for navigation and context-sensitive surfaces |

## Notes

This is the final frontend coherence plan for the current agentic novel engine roadmap. It should be used as a north-star contract while plans 043-047 execute, but it should not become the active implementation plan until those underlying contracts are stable enough to design against.

Implementation closeout evidence is attached under Stage 004. Plan status remains
`review` until a real Reviewer Agent evaluation signs off the implementation.
