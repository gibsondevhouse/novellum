---
title: Pipeline Checkpoint Contract Reconciliation
slug: plan-046-pipeline-checkpoint-contract-reconciliation
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-06-09
last_updated: 2026-06-14
target_completion: ~
stages:
  - stage-001-contract-and-test-audit
  - stage-002-canonical-api-map
  - stage-003-legacy-adapter-or-retirement
  - stage-004-full-e2e-closure
dependencies:
  - plan-027-v1.1-scoping
  - plan-028-v1.1-hierarchical-pipeline-ui
  - plan-037-agentic-worldbuild-scan
  - plan-038-novel-engine-v1
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

Bring pipeline checkpoint routes, schemas, tests, and docs back to one coherent contract.

The full e2e suite currently contains stale checkpoint fixtures and endpoint assumptions. This plan decides which generic metadata lifecycle routes remain supported, which newer task-specific routes are canonical, and which legacy contracts are retired.

## Scope

**In scope:**

- Audit all pipeline checkpoint owners, schemas, route handlers, client helpers, and Playwright specs.
- Document the canonical route map for worldbuild checkpoints, worldbuilding proposals, author draft checkpoints, and outline checkpoints.
- Update stale tests to current artifact envelope shapes or formally retire the legacy behavior they cover.
- Decide whether generic `PUT /api/db/project-metadata/...` lifecycle operations are a supported compatibility layer.
- Restore full `pnpm test:e2e --project=chromium` to a clean baseline.

**Out of scope:**

- New AI generation capabilities.
- New worldbuilding entity types.
- Refactoring unrelated project metadata storage outside pipeline scope.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Contract & Test Audit](stage-001-contract-and-test-audit/stage.md) | `complete` | TBD |
| 002 | [Canonical API Map](stage-002-canonical-api-map/stage.md) | `complete` | TBD |
| 003 | [Legacy Adapter or Retirement](stage-003-legacy-adapter-or-retirement/stage.md) | `complete` | TBD |
| 004 | [Full E2E Closure](stage-004-full-e2e-closure/stage.md) | `complete` | TBD |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [x] **lint** — zero lint errors
- [x] **lint:css** — zero CSS lint errors
- [x] **typecheck** — zero type errors and zero warnings
- [x] **tests** — Vitest suite passes
- [x] **e2e** — full e2e suite passes under Chromium
- [x] **check:tokens** — zero token violations
- [x] **docs_sync** — AI pipeline docs and tests agree on route ownership and schema versions

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Stale tests are mistaken for product regressions | high | Start with contract audit and classify each failing spec before changing code |
| Retiring generic lifecycle routes breaks hidden callers | medium | Use `rg` plus runtime route tests to prove caller inventory before removal |
| Compatibility adapters preserve too much legacy complexity | medium | Set explicit retirement criteria and sunset notes per route |

## Notes

Activated 2026-06-12 after Plan-043 closeout. Implementation closed out 2026-06-12 with all stages complete and all quality gates passing. Plan-level Reviewer evaluation finished 2026-06-14 and the plan is closed.
