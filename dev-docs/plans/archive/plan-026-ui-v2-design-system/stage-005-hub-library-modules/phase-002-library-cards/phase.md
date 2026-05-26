---
title: Library Cards (BookCoverCard + CollectionRow)
slug: phase-002-library-cards
phase_number: 2
status: complete
owner: Stylist Agent
stage: stage-005-hub-library-modules
parts:
  - part-001-cover-foil-and-row-eyebrow
estimated_duration: 0.5d
---

## Goal

Bring library cards in line with the v2 surface:

- `BookCoverCard.svelte`: add a candle-tinted foil highlight, candle
  hover glow with brass-tinted border, warmer placeholder gradient,
  candle-accented "Drafting" badge, and a brass eyebrow treatment on
  the meta line.
- `CollectionRow.svelte`: add a brass "Shelf" eyebrow above the row
  title.

## Parts

| #   | Part                                                                          | Status     |
| --- | ----------------------------------------------------------------------------- | ---------- |
| 001 | [Cover foil + row eyebrow](part-001-cover-foil-and-row-eyebrow/part.md)       | `complete` |

## Exit Criteria

- Hover state on `BookCoverCard` shows candle glow and brass-tinted
  border without per-card overrides.
- Placeholder cover renders with a warm brass-tinted gradient.
- "Drafting" badge reads in candle, not teal.
- `CollectionRow` shows a brass uppercase eyebrow above the row title.
- All gates clean.

## Follow-ups (out of scope for this phase)

- Vertical "shelf book" treatment with spine type (`sb-book` from v2
  kit).
- Cover initial / mood-coloured fallback per project mood.
