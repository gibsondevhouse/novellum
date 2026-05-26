---
title: Card Structure and Book Identity
slug: phase-001-card-structure-and-book-identity
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-002-project-card-visual-system
parts:
  - part-001-cover-placeholder
  - part-002-card-text-hierarchy
estimated_duration: 1d
---

## Goal

Reshape `ProjectCard` into a vertical book-object composition: a 2:3 cover area on top, followed by a text block (display-font title, teal genre badge, clamped logline, muted meta) — communicating each project as a distinct literary object rather than a data row.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Cover Placeholder](part-001-cover-placeholder/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [Card Text Hierarchy](part-002-card-text-hierarchy/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] Each `ProjectCard` renders a 2:3 aspect-ratio cover block at the top of the card
- [ ] Cover block uses `--color-surface-elevated` fill and `--color-border-subtle` inset border
- [ ] Card title uses `--font-display`, `--text-xl`, `--color-text-primary`
- [ ] Genre tag (when present) renders as an uppercase badge in `--color-teal`, `--text-xs`, `--tracking-widest`
- [ ] Logline is clamped to 2 lines; `--color-text-secondary`, `--text-sm`
- [ ] Last-updated meta: `--color-text-muted`, `--text-xs`
- [ ] `ProjectCreateCard` border, padding, and radius tokens align with the new `ProjectCard` shell

## Notes

- The card layout switches from a pure text block to a vertical stack: cover block (flex-shrink: 0) → content block (flex: 1)
- Card width is determined by the grid (`minmax(280px, 1fr)`); card height is driven by the 2:3 cover ratio plus content block
- `ProjectCreateCard` uses a dashed border style — keep the dashed variant but align border-radius and padding to match `ProjectCard`
