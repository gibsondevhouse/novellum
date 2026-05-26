---
title: Project Card Visual System
slug: stage-002-project-card-visual-system
stage_number: 2
status: draft
owner: Frontend Agent
plan: plan-007-homepage
phases:
  - phase-001-card-structure-and-book-identity
  - phase-002-interaction-and-motion
estimated_duration: 2d
risk_level: medium
---

## Goal

Transform `ProjectCard` from a plain text list item into a book-object-centric card — a 2:3 cover area backed by a typographically precise content block — and layer in hover lift and staggered entry animation.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Card Structure and Book Identity](phase-001-card-structure-and-book-identity/phase.md) | `draft` | 1d |
| 002 | [Interaction and Motion](phase-002-interaction-and-motion/phase.md) | `draft` | 1d |

## Entry Criteria

- Stage 001 (`editorial-page-shell`) is `complete`
- `ProjectCardSkeleton` dimensions are known so final card dimensions match
- `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--ease-standard`, `--duration-fast`, `--duration-enter` tokens confirmed in `tokens.css`
- `@keyframes novellum-enter` confirmed in `tokens.css` / `app.css`

## Exit Criteria

- `ProjectCard` displays a 2:3 cover placeholder, display-font title, teal genre badge, clamped logline, and muted meta
- Hover elevates the card (border + shadow step-up) at `--duration-fast`
- Cards enter the viewport with staggered `novellum-enter` animation
- `ProjectCreateCard` updated to visually align with new card shell
- `pnpm run lint` and `pnpm run check` pass

## Notes

- Cover image upload is out of scope; the 2:3 block is a styled placeholder using `--color-surface-elevated` with a subtle inner border
- `--font-display` is applied to the card title (`--text-xl` or `--text-2xl`) — not the full `--text-5xl` used in the page header
- Genre badge uses `--color-teal`, `--text-xs`, `text-transform: uppercase`, `--tracking-widest`
