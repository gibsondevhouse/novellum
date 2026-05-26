---
title: Implement Feedback and Overlay Primitives
slug: part-002-implement-feedback-primitives
part_number: 2
status: draft
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-002-primitive-standardization
estimated_duration: 1d
---

# Part-002: Implement Feedback and Overlay Primitives

## Objective

Create shared chrome for command surfaces, glass overlays, drawers, and empty/error states.

## Scope

In scope:

- `GlassBar`
- `CommandDock`
- `CinematicEmptyState`
- `SideDrawer`
- Shared focus, reduced-motion, and responsive behavior

Out of scope:

- Migrating every existing modal/drawer.

## Implementation Steps

1. Implement the primitives in `src/lib/components/ui/`.
2. Support mobile fallbacks for floating bars and command docks.
3. Ensure drawers have accessible titles, close actions, focus restore guidance, and scroll containment.
4. Implement empty/error visual anchors without relying on external imagery.
5. Export primitives and document usage.

## Files

Create:

- `src/lib/components/ui/GlassBar.svelte`
- `src/lib/components/ui/CommandDock.svelte`
- `src/lib/components/ui/CinematicEmptyState.svelte`
- `src/lib/components/ui/SideDrawer.svelte`

Update:

- `src/lib/components/ui/index.ts`
- `dev-docs/design-system.md`

## Acceptance Criteria

- [ ] Floating controls do not overlap primary content on mobile.
- [ ] Drawers and empty states are keyboard-accessible.
- [ ] Reduced-motion mode removes decorative animation.
- [ ] Primitives pass token checks and compile cleanly.

## Edge Cases

- Command docks must have an inline/sticky fallback for small screens and long action labels.
