---
title: Project Production Suite
slug: stage-005-production-suite
stage_number: 5
status: in-progress
owner: Architect / Stylist
plan: plan-015-cinematic-media
phases:
  - phase-001-hub-hero
estimated_duration: 4d
risk_level: medium
---

# Stage-005: Project Production Suite

## Goal

Refactor the project hub into a production control room for a novel: story identity, current progress, structural health, and next actions must be visible in one coherent cinematic dashboard.

## Entry Criteria

- Stage 004 gallery treatment is complete.
- Project fixture includes cover/no-cover, synopsis/no-synopsis, several structural states, and progress data.
- `SpotlightHero`, `StatusRing`, `CommandDock`, `GlassBar`, and `SideDrawer` are available.

## Phases

| # | Phase | Status | Owner | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Project Hub Hero and Metrics](phase-001-hub-hero/phase-001-hub-hero.md) | `in-progress` | Architect / Stylist | 4d |

## Required Deliverables

- `/projects/[id]/hub` opens with a cover-led story identity hero.
- Word count, target progress, structural metrics, and next step signals use compact visual instrumentation.
- Export/delete/settings actions are placed in a clear command surface without dominating the creative dashboard.
- Project metadata editing remains discoverable and keyboard-accessible.

## Exit Criteria

- Hub is legible and polished with and without cover art.
- Progress instrumentation is understandable by text, not only by color or motion.
- All hub cards and panels use shared primitives or documented domain wrappers.
- Seeded hub screenshots pass visual regression review.

## Notes

The hub sets expectations for project routes. Avoid local styling that cannot be reused by world-building or workflow surfaces.
