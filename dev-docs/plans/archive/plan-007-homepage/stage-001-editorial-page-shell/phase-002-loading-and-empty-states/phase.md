---
title: Loading and Empty States
slug: phase-002-loading-and-empty-states
phase_number: 2
status: draft
owner: Frontend Agent
stage: stage-001-editorial-page-shell
parts:
  - part-001-skeleton-loading
  - part-002-editorial-empty-state
estimated_duration: 1d
---

## Goal

Replace the bare loading text with skeleton cards that prevent CLS and establish spatial continuity, and replace the minimal empty state with an editorial composition that invites the writer to begin.

## Parts

| #   | Part                                                                   | Status  | Assigned To    | Est. Duration |
| --- | ---------------------------------------------------------------------- | ------- | -------------- | ------------- |
| 001 | [Skeleton Loading State](part-001-skeleton-loading/part.md)            | `draft` | Frontend Agent | 0.5d          |
| 002 | [Editorial Empty State](part-002-editorial-empty-state/part.md)        | `draft` | Frontend Agent | 0.5d          |

## Acceptance Criteria

- [ ] Loading state shows ≥2 skeleton cards at the same dimensions as real project cards (no CLS from layout shift)
- [ ] Skeleton uses a subtle shimmer or pulse animation respecting `prefers-reduced-motion`
- [ ] Empty state headline renders in `--font-display` at `--text-4xl`
- [ ] Empty state sub-copy renders in `--font-sans`, `--text-base`, `--color-text-muted`
- [ ] Empty state CTA is a single `.btn-primary` "Create Your First Project" button
- [ ] Empty state is vertically centred in the viewport area below the header

## Notes

- Skeleton card dimensions must be finalised before or in coordination with Stage 002 Part 001 (cover placeholder), so the skeleton matches the final card height exactly.
- Skeleton shimmer: use a `@keyframes` shimmer with `background: linear-gradient(90deg, ...)` on a pseudo-element, or a simple `opacity` pulse — whichever is simpler to maintain.
