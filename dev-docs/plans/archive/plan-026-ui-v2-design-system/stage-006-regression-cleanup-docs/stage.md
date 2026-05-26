---
title: Visual Regression, Cleanup & Docs
slug: stage-006-regression-cleanup-docs
stage_number: 6
status: complete
owner: Reviewer Agent
plan: plan-026-ui-v2-design-system
phases:
  - phase-001-dead-style-sweep
  - phase-002-baseline-regen
  - phase-003-docs-and-showcase
estimated_duration: 1d
risk_level: low
---

## Goal

Land the v2 refactor cleanly: sweep dead styles, regenerate the Playwright
visual-regression suite against the new chrome, update architecture / module
docs, and rebuild the `/styles` showcase so it mirrors `preview/*.html`.

## Phases

| #   | Phase                                                             | Status         | Est. Duration |
| --- | ----------------------------------------------------------------- | -------------- | ------------- |
| 001 | [Dead Style Sweep](phase-001-dead-style-sweep/phase.md)           | `complete`     | 0.25d         |
| 002 | [Baseline Regen](phase-002-baseline-regen/phase.md)               | `complete`     | 0.5d          |
| 003 | [Docs & Showcase](phase-003-docs-and-showcase/phase.md)           | `complete`  | 0.25d         |

## Entry Criteria

- Stages 003, 004, 005 all complete.

## Exit Criteria

- No leftover hex literals outside `tokens.css`.
- v1-only CSS classes in `src/styles/components.css` removed (or deletion
  scheduled in next release with a tracked TODO).
- `NovaPanel` backwards-compat alias removed if no consumer still imports it
  (else removal scheduled).
- `tests/visual/__screenshots__/` regenerated via
  `pnpm exec playwright test tests/visual/ --update-snapshots`; every diff
  manually reviewed.
- `dev-docs/02-architecture/frontend.md`,
  `dev-docs/04-modules/{editor,nova,reader}.md`, `CLAUDE.md`, `AGENTS.md`
  describe new chrome, Page/Muse/Room vocabulary, font stack.
- `/styles` showcase rebuilt to render every v2 primitive + surface preview.
- Final gate: `pnpm check && pnpm lint && pnpm lint:css && pnpm test &&
  pnpm check:tokens && pnpm exec playwright test` — all green.
- `MASTER-PLAN.md` and `ACTIVE-PLAN.md` updated per plan conventions when
  marked complete.

## Notes

- Manual smoke at the end: end-to-end author flow (onboarding → create project
  → draft scene in Page → invoke Muse → preview in Room).
