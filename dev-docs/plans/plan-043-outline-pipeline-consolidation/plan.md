---
title: Outline Pipeline Consolidation
slug: plan-043-outline-pipeline-consolidation
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-06-09
last_updated: 2026-06-09
target_completion: ~
stages:
  - stage-001-surface-audit
  - stage-002-canonical-checkpoint-flow
  - stage-003-legacy-retirement
  - stage-004-regression-and-docs
dependencies:
  - plan-040-outline-generation
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - e2e
  - check:tokens
---

## Objective

Make the review-gated outline checkpoint pipeline the only outline generation and materialization path in Novellum.

This plan retires the older Nova outline artifact apply path that can replace the project outline hierarchy outside the newer conflict-aware checkpoint materialization service.

## Scope

**In scope:**

- Audit every caller, UI card, route, and test that references `/api/nova/outline/apply`, `NovaOutlineCard`, `applyAuthorOutlineArtifact`, or `author-outline` artifacts.
- Route outline generation UX through `/api/ai/outline/generate` and `NovaOutlineDraftCheckpointCard`.
- Remove or hard-disable destructive outline materialization outside `acceptOutlineCheckpointMaterialization`.
- Preserve the existing safe review, reject, stale-check, conflict-check, and rollback behavior.
- Update tests and docs so the checkpoint route is the canonical outline flow.

**Out of scope:**

- New outline model schema features.
- Reworking the seven-layer outline data model.
- Changing worldbuilding context sufficiency rules beyond what is needed for route consolidation.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Surface Audit](stage-001-surface-audit/stage.md) | `draft` | TBD |
| 002 | [Canonical Checkpoint Flow](stage-002-canonical-checkpoint-flow/stage.md) | `draft` | TBD |
| 003 | [Legacy Retirement](stage-003-legacy-retirement/stage.md) | `draft` | TBD |
| 004 | [Regression & Docs](stage-004-regression-and-docs/stage.md) | `draft` | TBD |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors
- [ ] **lint:css** — zero CSS lint errors
- [ ] **typecheck** — zero type errors and zero warnings
- [ ] **tests** — Vitest suite passes
- [ ] **e2e** — outline generation review gate passes
- [ ] **check:tokens** — zero token violations
- [ ] **docs_sync** — Nova, outline, and AI pipeline docs identify the canonical outline path

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Removing the old artifact card breaks Write mode prompts | medium | Redirect Write mode outline intent to the checkpoint generation state instead of deleting behavior blindly |
| Tests still encode legacy materialization assumptions | high | Update tests around the intended checkpoint contract; delete only tests for explicitly retired behavior |
| Existing projects have legacy pending outline artifacts | low | Leave read-only display or migration note if persisted artifacts are discovered |

## Notes

The full draft plan tree has been scaffolded through stages, phases, parts, checklists, implementation logs, and evidence README files. Status remains `draft`; no implementation work has started and tracker files have not been changed.

