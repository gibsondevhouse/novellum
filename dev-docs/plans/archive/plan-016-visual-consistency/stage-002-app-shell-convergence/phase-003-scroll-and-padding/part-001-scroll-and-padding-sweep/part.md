---
title: Scroll & Padding Sweep
slug: part-001-scroll-and-padding-sweep
part_number: 1
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-003-scroll-and-padding
started_at: 2026-04-24 06:35 EDT
completed_at: 2026-04-24 07:18 EDT
estimated_duration: 1d
---

## Objective

Normalize page padding, content max-width, scroll containers, and scroll-lock behavior per canonical rules.

## Scope

**In scope:**

- Page padding token usage.
- Content max-width per archetype.
- Scroll container ownership (shell-level vs surface-level).
- Scroll-lock behavior during modals/drawers.

**Out of scope:**

- Inspector / editor internal scroll behavior — those are archetype-specific and handled in Stages 004/006.

## Implementation Steps

1. Enumerate padding/scroll drift from the Stage 001 density map.
2. Migrate each drifting surface to canonical tokens and scroll contract.
3. Run visual regression on at least 5 representative routes.

## Files

**Update:**

- Surfaces flagged in the Stage 001 density map.

## Acceptance Criteria

- [x] Padding and max-width tokens used consistently.
- [x] Scroll container ownership matches canonical rules.
- [x] Visual regression evidence captured.

## Edge Cases

- Settings full-width sections must not adopt editor prose max-width.

## Notes

- Settings full-width behavior preserved (no prose-width convergence applied in this part).
