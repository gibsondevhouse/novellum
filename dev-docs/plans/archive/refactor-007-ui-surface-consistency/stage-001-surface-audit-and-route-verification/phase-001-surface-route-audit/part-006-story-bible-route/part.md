---
title: Story Bible route
slug: part-006-story-bible-route
part_number: 6
status: draft
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-surface-route-audit
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Validate /projects/[id]/bible route access and Story Bible render behavior.

## Scope

**In scope:**

- Story Bible route presence, navigation entry, and render health

**Out of scope:**

- Entity-level visual refinements beyond render blockers

## Implementation Steps

1. Navigate to /projects/[id]/bible and linked Bible sub-surfaces
2. Repair missing route/layout/import issues blocking Bible surface
3. Capture route-load evidence (screenshot or test log) in evidence directory

## Files

**Create:**

- dev-docs/plans/refactor-007-ui-surface-consistency/stage-001-surface-audit-and-route-verification/phase-001-surface-route-audit/part-006-story-bible-route/evidence/

**Update:**

- src/routes/projects/[id]/bible/**; src/modules/bible/**

## Acceptance Criteria

- [ ] Story Bible route resolves and mounts without blocking errors.
- [ ] Bible entry navigation remains discoverable from project surfaces.

## Edge Cases

- If Bible redirects to World Building aliases, the redirect must be explicit and error-free.

## Notes

This part is styling and navigation scoped only and must not absorb refactor-006 resilience or security work.
