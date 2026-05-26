---
title: Responsive Polish and Cleanup
slug: part-002-responsive-polish-and-cleanup
part_number: 2
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-section-reorder-and-cleanup
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Apply final responsive CSS to the full Hub page composite, remove all remaining legacy CSS from the old layout, take viewport screenshots for evidence, and update `dev-docs/modules/project-hub.md` to document the new component architecture.

## Context

At this point:

- `ProjectHubHero` and its responsive CSS are in place (stage-001)
- `StructuralMetricsCarousel` is in place with mobile scroll (stage-002)
- Hub section order and `.hub-lower` frame are in place (part-001 of this phase)

This part consolidates final responsive touch-ups, removes any remaining dead style rules, and documents the resulting architecture.

## Scope

**In scope:**

- Final responsive audit at desktop (1280px), tablet (768px), mobile (375px)
- Remove any remaining unused CSS class selectors in `+page.svelte` `<style>` block
- `dev-docs/modules/project-hub.md` update — add new component map table and update architecture description
- Three browser screenshots added to `evidence/`

**Out of scope:**

- Changes to design-system tokens or global CSS
- Any component internals already correct from prior parts

## Responsive Target State

| Breakpoint | Hero | Metrics | Lower sections |
| --- | --- | --- | --- |
| ≥1024px | Two-column (240px cover) | 4 cards, 1 row | Single column, max 680px |
| 768px | Two-column (180px cover) | 4 cards, 1 row (may compress) | Single column |
| ≤640px | Single column, cover centred | Horizontal scroll, snap | Single column |

## Implementation Steps

1. Audit Hub page at each three breakpoints in browser DevTools

1. Fix any overflow, cramped spacing, or misaligned elements found

1. Remove orphaned CSS selectors from `+page.svelte` `<style>` block (use browser DevTools "Coverage" tab to identify unused rules)

1. Take and save screenshots (PNG) to:
   - `evidence/hub-desktop-1280px-YYYY-MM-DD.png`
   - `evidence/hub-tablet-768px-YYYY-MM-DD.png`
   - `evidence/hub-mobile-375px-YYYY-MM-DD.png`

1. Update `dev-docs/modules/project-hub.md`:
   - Add a "Component Architecture" section listing the 7 new components and their roles
   - Update the "Sections" list to reflect the new 5-layer hierarchy
   - Note that `StructuralMetricCard` is exported for use in other modules

## Files

**Update:**

- `src/routes/projects/[id]/+page.svelte` — final CSS cleanup
- `dev-docs/modules/project-hub.md`

**Evidence:**

- `evidence/hub-desktop-1280px-2026-04-13.png`
- `evidence/hub-tablet-768px-2026-04-13.png`
- `evidence/hub-mobile-375px-2026-04-13.png`

## Acceptance Criteria

- [ ] No horizontal overflow at any breakpoint
- [ ] Hero, metrics, and lower sections all readable at 375px
- [ ] No unused CSS rules remain in `+page.svelte` `<style>` block
- [ ] Three screenshots in evidence folder
- [ ] `dev-docs/modules/project-hub.md` updated with new component map and section hierarchy
- [ ] `pnpm run lint` — zero errors
- [ ] `pnpm run check` — zero errors
- [ ] Plan marked `review` and reviewer agent notified

## Notes

- The "Coverage" tab in Chrome DevTools (F12 → More Tools → Coverage) can flag unused CSS; this is recommended for the cleanup step
- After this part is complete, all acceptance criteria in `plan.md` quality gates should be satisfied — trigger reviewer agent sign-off
