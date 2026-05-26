---
title: Structural Metrics Carousel
slug: stage-002-structural-metrics-carousel
stage_number: 2
status: complete
owner: Frontend Agent
plan: refactor-003-hub-story-identity
phases:
  - phase-001-metrics-data-layer
  - phase-002-metrics-ui-components
estimated_duration: 2d
risk_level: medium
---

## Goal

Add a horizontal structural metrics strip beneath the hero showing arc, act, chapter, and scene counts per project. The metric cards are reusable, design-system-native dashboard primitives — not admin stat boxes. The data layer returns graceful zeroes for entity types whose Dexie tables do not yet exist (`arcs`, `acts`).

## Phases

| #   | Phase                                                                  | Status  | Est. Duration |
| --- | ---------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Metrics Data Layer](phase-001-metrics-data-layer/phase.md)            | `draft` | 0.5d          |
| 002 | [Metrics UI Components](phase-002-metrics-ui-components/phase.md)      | `draft` | 1.5d          |

## Entry Criteria

- Stage 001 complete: `ProjectHubHero` renders correctly
- Dexie `chapters` and `scenes` tables exist and are queryable

## Exit Criteria

- All phases complete
- `StructuralMetricsCarousel` renders in Hub beneath hero with accurate chapter and scene counts
- Arc and act metrics display "–" or 0 gracefully when those tables are absent
- Cards link-ready (href prop wired even if target routes do not exist yet)
- `pnpm run check` passes clean

## Notes

- `arcs` and `acts` are future tables; `HubMetricsService` must import-guard against `db.arcs` and `db.acts` being undefined
- `StructuralMetricCard` must be exported from `src/modules/project/index.ts` for use in other modules
