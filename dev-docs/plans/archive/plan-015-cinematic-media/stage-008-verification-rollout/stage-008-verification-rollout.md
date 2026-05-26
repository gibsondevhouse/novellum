---
title: Verification and Rollout
slug: stage-008-verification-rollout
stage_number: 8
status: complete
owner: Reviewer
plan: plan-015-cinematic-media
phases:
  - phase-001-release-readiness
estimated_duration: 3d
risk_level: high
---

# Stage-008: Verification and Rollout

## Goal

Prove the cinematic UI refactor is production-release ready. This stage is not a design polish pass; it is the final quality gate and release evidence package.

## Entry Criteria

- Stages 001 through 007 are complete or in reviewer handoff.
- All changed route families have approved screenshots or reviewed visual baselines.
- No implementation part has unresolved known blocker notes.

## Phases

| # | Phase | Status | Owner | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Release Readiness](phase-001-release-readiness/phase-001-release-readiness.md) | `complete` | Reviewer | 3d |

## Required Deliverables

- Final automated gate output for `pnpm run check:tokens`, `pnpm run lint`, `pnpm run check`, `pnpm run test`, and `pnpm run test:visual`.
- Visual regression baselines for app-level routes and seeded project-level routes.
- Manual route crawl evidence covering app routes, project routes, world-building routes, redirects, and future-state pages.
- Manual accessibility evidence covering keyboard navigation, focus order, reduced motion, screen reader labels, and color-independent state communication.
- Manual responsive evidence covering mobile, tablet, desktop, and wide desktop.
- Image/rendering evidence covering lazy loading, deterministic placeholders, uploaded covers, asset modals, and nonblank previews.
- Final release note summarizing changed surfaces, known limitations, and follow-up work.

## Verification Matrix

| Gate | Command / Method | Required result |
| --- | --- | --- |
| Token compliance | `pnpm run check:tokens` | Zero violations. |
| Lint | `pnpm run lint` | Zero lint errors. |
| Svelte/TypeScript | `pnpm run check` | Zero type/check errors. |
| Unit/integration | `pnpm run test` | All tests pass. |
| Visual regression | `pnpm run test:visual` | All baselines pass or are intentionally updated with review. |
| Keyboard QA | Manual route crawl | No keyboard trap, focus loss, or hidden focus state. |
| Responsive QA | Manual viewport crawl | No clipping, overlap, hidden primary actions, or horizontal overflow. |
| Reduced motion | Manual/browser setting | Nonessential animation disabled or simplified. |
| Image QA | Manual seeded fixture | Covers/assets/fallbacks load, reserve dimensions, and remain readable. |

## Exit Criteria

- All verification matrix rows pass.
- Evidence files are stored under the plan directory.
- `MASTER-PLAN.md` is updated if the plan status changes.
- Reviewer signs off or records blocking findings with file/route references.

## Notes

Do not mark this stage complete with "visual review pending." A release-ready UI requires the manual evidence, not only automated command output.
