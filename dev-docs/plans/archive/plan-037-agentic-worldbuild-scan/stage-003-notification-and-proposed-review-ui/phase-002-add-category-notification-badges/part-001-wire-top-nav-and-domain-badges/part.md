---
title: Wire Top-Nav & Domain Badges
slug: part-001-wire-top-nav-and-domain-badges
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Claude Code
phase: phase-002-add-category-notification-badges
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.75d
---

## Objective

Add category notification dots/badges to worldbuilding top nav and domain tiles using derived pending state.

## Scope

**In scope:**

- Badge rendering and category routing on existing worldbuilding surfaces

**Out of scope:**

- Proposal acceptance semantics

## Implementation Steps

1. Integrate pending-state selectors into navigation and tile components
2. Implement badge visibility/count logic per category
3. Apply token-based visual treatment and accessibility labels

## Files

**Create:**

- src/modules/world-building/components/WorldbuildingNotificationBadge.svelte

**Update:**

- src/lib/components/AppHeader.svelte; src/routes/projects/[id]/world-building/+page.svelte; src/routes/projects/[id]/world-building/help/+page.svelte

## Acceptance Criteria

- [x] Badges accurately reflect pending proposals by category
- [x] Visual implementation uses existing tokens and remains accessible

## Edge Cases

- Badge state becomes stale on route transitions

## Notes

No hardcoded styling values or implicit canon messaging.
