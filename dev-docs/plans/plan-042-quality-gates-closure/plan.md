---
title: Quality Gates Closure
slug: plan-042-quality-gates-closure
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-06-04
last_updated: 2026-06-04
target_completion: 2026-06-04
stages:
  - stage-001-typescript-warnings
  - stage-002-css-visual
  - stage-003-routing-sidebar
  - stage-004-dexie-boundary
dependencies: []
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - check:tokens
---

## Objective

Eliminate every accumulated pre-existing exception that has been waived across plans 030–040.
This plan produces a clean quality-gate baseline so that future plans can treat failing gates
as genuine blockers rather than "known noise."

## Scope

**In scope:**

- Resolve the ~11 pre-existing `pnpm check` TypeScript warnings to zero.
- Fix the `lint:css` error in `IndividualsWorkspaceShell.svelte:183` (waived on every plan since plan-030).
- Stabilize the Playwright visual snapshot baseline — either update all snapshots to current state
  or formally document and quarantine surfaces that are not yet ready for visual regression.
- Fix the brittle sidebar / active-project detection path-parsing for routes outside
  `/projects/<id>/...` (flagged in `dev-docs/02-architecture/routing.md`).
- Remove any remaining Dexie live-read/write paths outside the portability/migration boundary.

**Out of scope:**

- New user-facing features.
- Full Playwright visual-test coverage expansion (fixing drift is enough; new coverage comes later).
- Dexie removal from portability snapshot code (it is intentionally retained there).

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [TypeScript Warning Resolution](stage-001-typescript-warnings/stage.md) | `complete` | 1d |
| 002 | [CSS Lint Fix & Visual Baseline](stage-002-css-visual/stage.md) | `complete` | 1d |
| 003 | [Routing & Sidebar Path Detection](stage-003-routing-sidebar/stage.md) | `complete` | 0.5d |
| 004 | [Dexie Boundary Audit](stage-004-dexie-boundary/stage.md) | `complete` | 0.5d |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [x] **lint** — zero lint errors
- [x] **lint:css** — zero CSS lint errors
- [x] **typecheck** — zero type errors (0 errors, 0 warnings, 1833 files)
- [x] **tests** — all tests pass (237 files / 1728 tests)
- [x] **check:tokens** — zero token violations (347 files)
- [x] **docs_sync** — this plan document updated with completion date (2026-06-04)

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Visual snapshots are stale across surface | high | Take targeted approach: update only surfaces confirmed to be visually correct |
| TypeScript warnings have deep dependencies | low | Investigate root causes first; may require structural changes |
| Routing path logic is complex | medium | Add comprehensive unit tests for sidebar active-state detection |

## Notes

This plan is a quality-gate closure effort focused on eliminating accumulated technical debt from
previous iterations. It creates a clean baseline for stricter gate enforcement in future plans.

No user-facing features are delivered; all work is infrastructure and code quality focused.
