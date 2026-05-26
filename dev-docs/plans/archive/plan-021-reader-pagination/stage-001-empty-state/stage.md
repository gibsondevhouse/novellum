---
title: Reader Empty State
slug: stage-001-empty-state
stage_number: 1
status: draft
owner: Stylist Agent
plan: plan-021-reader-pagination
phases:
  - phase-001-design
  - phase-002-implementation
  - phase-003-tests
estimated_duration: 0.5d
risk_level: low
---

## Goal

When the reader route loads with no book/story selected, the user
sees a branded empty state with a clear next action (pick a story
or create one), not a blank canvas.

## Entry Criteria

- Reader shell exists at `src/modules/reader/components/ReaderFullscreenShell.svelte`.
- `EmptyStatePanel` primitive exists in `src/lib/components/ui/`.

## Exit Criteria

- Loading the reader without a target story shows the empty state.
- The empty state offers a CTA that routes to `/projects` (pick) or
  triggers project creation flow.
- One unit test asserts the empty branch renders without throwing
  when no story is bound.
