---
title: Section Reorder and Cleanup
slug: phase-001-section-reorder-and-cleanup
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-003-hub-hierarchy-and-polish
parts:
  - part-001-hub-section-reorder
  - part-002-responsive-polish-and-cleanup
estimated_duration: 1d
---

## Goal

Reorder `+page.svelte` sections into the 5-layer Hub hierarchy. Remove all legacy CSS from the old story-block and hub-grid layout. Apply responsive CSS across the whole page. Update `dev-docs/modules/project-hub.md` to reflect the new architecture.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Hub Section Reorder](part-001-hub-section-reorder/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [Responsive Polish and Cleanup](part-002-responsive-polish-and-cleanup/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] Hub DOM order: hero → metrics → progress → next-action → metadata
- [ ] Old `.hub-grid`, `.hub-primary`, `.hub-secondary`, `.story-block` CSS classes removed
- [ ] No visual regressions on progress bar, action card, or metadata panel
- [ ] Responsive: desktop two-column hero, mobile stacked hero, horizontally scrollable metrics
- [ ] `dev-docs/modules/project-hub.md` updated
- [ ] `pnpm run lint` and `pnpm run check` clean

## Notes

- Removing `.hub-grid` and the two-column layout means progress, action-card, and metadata must be re-wrapped in a sensible lower-section container — propose a centered max-width frame matching the hero
