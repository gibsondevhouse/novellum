---
title: Metrics UI Components
slug: phase-002-metrics-ui-components
phase_number: 2
status: complete
owner: Frontend Agent
stage: stage-002-structural-metrics-carousel
parts:
  - part-001-structural-metric-card
  - part-002-structural-metrics-carousel
estimated_duration: 1.5d
---

## Goal

Build `StructuralMetricCard` as a reusable design-system-native dashboard primitive, then compose `StructuralMetricsCarousel` with four instances (Arcs, Acts, Chapters, Scenes). Wire the carousel into `+page.svelte` below the hero, consuming `HubMetricsService` data.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [StructuralMetricCard](part-001-structural-metric-card/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [StructuralMetricsCarousel](part-002-structural-metrics-carousel/part.md) | `draft` | Frontend Agent | 1d |

## Acceptance Criteria

- [ ] `StructuralMetricCard` supports: `label`, `count`, `statusLine`, `href`, `ready` props
- [ ] Card renders "–" when `ready === false`
- [ ] Cards are equal height, substantial, and use design-system surface tokens
- [ ] `StructuralMetricsCarousel` renders all 4 cards in a horizontal scroll region
- [ ] Desktop shows all 4 cards without scrolling; mobile scrolls horizontally
- [ ] Each card's `href` prop is wired (even to `#` placeholders) for future routing
- [ ] `pnpm run check` exits clean

## Notes

- `StructuralMetricCard` must be exported from `src/modules/project/index.ts` so other modules can import it
- Do not use a CSS scroll-snap approach that hides part of a card on desktop — cards must be fully visible at ≥1024px
