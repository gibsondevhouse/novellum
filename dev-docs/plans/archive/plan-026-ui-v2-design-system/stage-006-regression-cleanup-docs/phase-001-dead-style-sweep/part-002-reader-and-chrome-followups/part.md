---
title: Reader, sidebar, and Muse follow-ups
slug: part-002-reader-and-chrome-followups
part_number: 2
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-dead-style-sweep
started_at: 2026-05-13
completed_at: 2026-05-13
estimated_duration: 0.15d
---

## Objective

Land the deferred v2 polish items across the reader spread,
the global sidebar dual-band divider, and the Muse / Nova
resize handle so every plan-026 immersive surface and chrome
component reaches its v2 target.

## Scope

**In scope:**

- `BookPage`: candle/candle-deep radial vignette, ember
  bookmark ribbon on chapter-title pages, brass italic display
  folio numbers.
- `BookSpread`: gutter recoloured to a parchment-deep / brass
  mix instead of the cool border-default hairline.
- `AppSidebar` + `ActiveProjectSection`: dual-band divider
  carries a brass-tinted hairline.
- `NovaPanel` (Muse surface): border-left mixes 30 % brass into
  the panel border; resize handle reads candle on hover /
  focus / active.

**Out of scope:**

- Reader BookSpread page-turn animation (deferred — no v2
  source-of-truth yet).
- Sidebar Lucide icon extraction (deferred — separate
  refactor).
- NovaPanel header eyebrow (already shipped in an earlier
  phase).

## Implementation Steps

1. Add `.book-page__vignette` `::before` overlay with
   candle/candle-deep radial gradients.
2. Add `.book-page__ribbon` (clip-path ember chevron) for
   `page.type === 'chapter-title'`.
3. Restyle `.book-page__footer` to italic display, brass.
4. Recolour `.book-gutter` linear-gradient to
   `parchment-deep` / `brass` mix.
5. Update both sidebar `.sidebar-divider` rules to use
   `color-mix(in srgb, var(--color-brass) 35%, var(--color-border-default))`.
6. Restyle NovaPanel `.nova-panel` border-left and
   `.nova-resize-handle::after` background to candle.
7. Run gates.

## Files

**Update:**

- `src/modules/reader/components/BookPage.svelte`
- `src/modules/reader/components/BookSpread.svelte`
- `src/lib/components/AppSidebar.svelte`
- `src/lib/components/ActiveProjectSection.svelte`
- `src/modules/nova/components/NovaPanel.svelte`

## Acceptance Criteria

- [x] Reader chapter-title pages render the red ember ribbon.
- [x] Reader page footers render italic brass folio numbers.
- [x] Reader gutter reads warm (parchment-deep / brass) instead
  of cool border-default.
- [x] Sidebar dividers read warm.
- [x] NovaPanel border-left + resize handle read warm.
- [x] All gates green (tokens 322/0, check 0/0, lint clean,
  lint:css clean, tests 1059/1059).

## Notes

`.book-page` now sets `overflow: hidden` so the absolute-
positioned vignette and ribbon clip to the rounded parchment
border.
