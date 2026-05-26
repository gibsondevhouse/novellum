---
title: Docs Sync and Showcase Rebuild
slug: phase-003-docs-and-showcase
phase_number: 3
status: complete
owner: Reviewer Agent
stage: stage-006-regression-cleanup-docs
parts:
  - part-001-docs-showcase
estimated_duration: 0.25d
---

## Goal

Align architecture/module docs and the `/styles` route with the v2 design-system contract, then clear final closeout gates.

## Parts

| #   | Part                                                    | Status        |
| --- | ------------------------------------------------------- | ------------- |
| 001 | [Docs + showcase refresh](part-001-docs-showcase/part.md) | `complete` |

## Acceptance Criteria

- [x] `dev-docs/02-architecture/frontend.md` reflects v2 token/font/chrome/surface contracts
- [x] `dev-docs/04-modules/*` updated to v2 surface vocabulary
- [x] `CLAUDE.md` and `AGENTS.md` rechecked for contradictions
- [x] `/styles` rebuilt as v2 design-system showcase
- [x] Browser + Computer Use plugin verification recorded
- [x] Full final gate command passes (`pnpm check:tokens && pnpm check && pnpm lint && pnpm lint:css && pnpm test && pnpm exec playwright test`)

## Notes

Blocker cleared on 2026-05-25 by stabilizing the E2E selectors/state flow and cleaning per-test project artifacts before the visual suite run.
