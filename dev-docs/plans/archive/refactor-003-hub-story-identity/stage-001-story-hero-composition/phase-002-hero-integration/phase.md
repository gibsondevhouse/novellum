---
title: Hero Integration
slug: phase-002-hero-integration
phase_number: 2
status: complete
owner: Frontend Agent
stage: stage-001-story-hero-composition
parts:
  - part-001-wire-hero-into-hub-page
  - part-002-responsive-hero-layout
estimated_duration: 1d
---

## Goal

Replace the current `.story-block` section in `+page.svelte` with `ProjectHubHero`. Wire the `openEdit` context call through the hero tree. Apply responsive breakpoints so the hero degrades gracefully from desktop two-column to mobile single-column with cover stacked above content.

## Parts

| #   | Part                                                                             | Status  | Assigned To      | Est. Duration |
| --- | -------------------------------------------------------------------------------- | ------- | ---------------- | ------------- |
| 001 | [Wire Hero into Hub Page](part-001-wire-hero-into-hub-page/part.md)             | `draft` | Frontend Agent   | 0.5d          |
| 002 | [Responsive Hero Layout](part-002-responsive-hero-layout/part.md)               | `draft` | Frontend Agent   | 0.5d          |

## Acceptance Criteria

- [ ] `+page.svelte` imports and renders `ProjectHubHero`; old `.story-block` markup is removed
- [ ] `openEdit` prop forwarded correctly — clicking the edit affordance in the hero opens the edit modal
- [ ] Hero fills the content frame width on desktop with two columns
- [ ] On mobile (≤640px) cover stacks above the text content
- [ ] `pnpm run check` exits clean; `+page.svelte` remains ≤150 lines

## Notes

- The `project` and `openEdit` are already available from `$props()` and `getContext` in `+page.svelte`; no new data loading required
