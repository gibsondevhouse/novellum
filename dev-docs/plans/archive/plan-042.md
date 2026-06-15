---
title: Quality Gates Closure
slug: plan-042-quality-gates-closure
version: 0.1.0
status: candidate
owner: Planner Agent
created: 2026-06-04
last_updated: 2026-06-04
target_completion: TBD
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

| #   | Stage                                    | Est. Duration |
| --- | ---------------------------------------- | ------------- |
| 001 | TypeScript warning resolution            | 1d            |
| 002 | CSS lint fix + visual baseline stabilize | 1d            |
| 003 | Routing / sidebar path-detection fix     | 0.5d          |
| 004 | Dexie boundary audit                     | 0.5d          |

## Quality Gates

- [ ] `pnpm check` — zero errors **and** zero warnings
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm lint:css` — zero errors (no waivers)
- [ ] `pnpm test` — all tests pass
- [ ] `pnpm check:tokens` — zero violations
- [ ] Playwright visual suite — no unexplained drift

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| Some TS warnings require deeper type-model changes | medium | Address with `unknown` casts as a last resort; document each |
| Visual snapshot updates trigger false-positive regressions | low | Update snapshots per-surface; peer-review screenshots |

## Notes

This plan has no user-visible output. Its value is measured by the absence of waiver
language in every subsequent plan's closure evidence.
