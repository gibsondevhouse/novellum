---
title: Rebaseline Sweep
slug: stage-001-rebaseline
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-041-docs-rebaseline-internal-version
phases:
  - phase-001-version-framing
  - phase-002-date-stamps
estimated_duration: 0.5d
risk_level: low
---

## Goal

Execute the docs re-baseline in two passes:

1. **Version framing:** Update files that contain misleading "V1 sellable / shipped"
   language and add plans 030-038 to the roadmap.
2. **Date stamps:** Roll `Last verified` headers across content-accurate docs.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Version Framing](phase-001-version-framing/phase.md) | `complete` | 0.25d |
| 002 | [Date Stamps](phase-002-date-stamps/phase.md) | `complete` | 0.25d |

## Acceptance Criteria

- [ ] Roadmap reflects plans 030-038 in Shipped.
- [ ] Roadmap clarifies that V1/V2 are internal milestones, not public releases.
- [ ] `novellum-docs/user/nova.md` no longer claims four more agents are planned.
- [ ] `novellum-docs/user/faq.md` no longer points licensing answers at plan-018.
- [ ] `Last verified` rolled to 2026-06-01 on content-accurate docs.
- [ ] `pnpm lint` clean. `pnpm check:tokens` clean.
