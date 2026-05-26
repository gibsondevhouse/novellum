---
title: Hub Hierarchy and Polish
slug: stage-003-hub-hierarchy-and-polish
stage_number: 3
status: complete
owner: Frontend Agent
plan: refactor-003-hub-story-identity
phases:
  - phase-001-section-reorder-and-cleanup
estimated_duration: 1d
risk_level: low
---

## Goal

Reorder the Hub's remaining sections into the 5-layer hierarchy (hero → metrics → progress → next action → metadata), remove legacy CSS from the old story-block layout, apply responsive breakpoints across all new components, and validate the full composition in the browser.

## Phases

| #   | Phase                                                                           | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Section Reorder & Cleanup](phase-001-section-reorder-and-cleanup/phase.md)     | `draft` | 1d            |

## Entry Criteria

- Stages 001 and 002 complete
- Hero and metrics carousel both render in Hub page

## Exit Criteria

- All phases complete
- Hub sections read in correct order: hero → metrics → progress → next action → metadata
- No visual regressions on existing progress, action-card, and metadata panels
- Desktop, tablet (768px), and mobile (375px) screenshots in evidence
- `dev-docs/modules/project-hub.md` updated
- `pnpm run lint` and `pnpm run check` pass clean

## Notes

- Responsive layout must be achieved with CSS grid/flex media queries — no JavaScript breakpoint logic
- The progress, action-card, and metadata sections stay structurally intact — this stage only repositions them in the DOM and adjusts their visual weight
