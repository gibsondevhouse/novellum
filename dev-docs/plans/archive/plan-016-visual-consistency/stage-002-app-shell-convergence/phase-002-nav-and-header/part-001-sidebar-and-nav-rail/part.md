---
title: Sidebar & Nav Rail
slug: part-001-sidebar-and-nav-rail
part_number: 1
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-nav-and-header
started_at: 2026-04-24 04:38 EDT
completed_at: 2026-04-24 06:25 EDT
estimated_duration: 0.75d
---

## Objective

Unify sidebar and navigation-rail behavior, active-state treatment, hover, and focus across every route.

## Scope

**In scope:**

- Canonical sidebar primitive and active-nav pattern.
- Keyboard focus order and ARIA labelling.
- Removal of route-local sidebar re-implementations.

**Out of scope:**

- Page header (in `part-002-page-header`).

## Implementation Steps

1. Confirm the canonical sidebar component from Stage 001 rules.
2. Replace route-local sidebars with the canonical one.
3. Verify active/hover/focus treatments per canonical rules.
4. Run a11y sweep using the `accessibility-a11y` skill.

## Files

**Create:**

- None (unless the canonical primitive needs promotion, documented in `impl.log.md`).

**Update:**

- Sidebar consumers identified in the Stage 001 inventory.

## Acceptance Criteria

- [x] One sidebar primitive in use across all routes.
- [x] Active/hover/focus treatments identical everywhere.
- [x] A11y sweep passes.

## Edge Cases

- Narrow layout: sidebar collapse behavior stays intentional and documented.

## Notes

- `goto()` only for navigation. No `window.location.href`.
