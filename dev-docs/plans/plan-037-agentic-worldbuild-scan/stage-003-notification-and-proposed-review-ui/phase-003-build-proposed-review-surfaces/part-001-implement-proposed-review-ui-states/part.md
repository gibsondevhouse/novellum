---
title: Implement Proposed Review UI States
slug: part-001-implement-proposed-review-ui-states
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Claude Code
phase: phase-003-build-proposed-review-surfaces
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 1d
---

## Objective

Implement explicit review surfaces and state variants for pending/proposed suggestions.

## Scope

**In scope:**

- UI states, copy, and visual differentiation for proposal review lifecycle

**Out of scope:**

- Backend contract redesign

## Implementation Steps

1. Define proposed tile/card variant distinct from canon presentation
2. Render empty/loading/failed/review-ready/accepted/rejected states explicitly
3. Apply author-agency copy patterns across review actions

## Files

**Create:**

- src/modules/world-building/components/WorldbuildingProposedTile.svelte

**Update:**

- src/modules/world-building/components/WorldbuildingProposalCard.svelte; src/modules/world-building/components/WorldbuildingGenerationStatus.svelte

## Acceptance Criteria

- [x] Pending/proposed UI is clearly non-canonical until accept
- [x] All required review states are explicit and testable

## Edge Cases

- UI language implies auto-canon behavior

## Notes

Use suggest/review/accept/reject language consistently.
