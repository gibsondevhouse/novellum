---
title: Interaction and Motion
slug: phase-002-interaction-and-motion
phase_number: 2
status: draft
owner: Frontend Agent
stage: stage-002-project-card-visual-system
parts:
  - part-001-hover-lift
  - part-002-staggered-enter-animation
estimated_duration: 1d
---

## Goal

Add the two motion signatures that elevate the card grid from static to responsive: a hover lift (border escalation + shadow step-up) that makes each card feel physical, and a staggered enter animation that introduces the grid with editorial settle rather than an abrupt render.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Hover Lift](part-001-hover-lift/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [Staggered Enter Animation](part-002-staggered-enter-animation/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] Hovering a card escalates border from `--color-border-default` to `--color-border-strong` and shadow from `--shadow-xs` to `--shadow-md` at `--duration-fast` with `--ease-standard`
- [ ] Cards appearing in the grid animate in via `novellum-enter` (fade + 4px vertical settle) at `--duration-enter` (200ms)
- [ ] Cards are staggered — each card's enter animation is delayed by `40ms × index`
- [ ] No animation when `prefers-reduced-motion: reduce` — cards appear instantly
- [ ] All transitions and animations use only design-system tokens

## Notes

- Hover uses `--ease-standard` (not `--ease-editorial`) — `--ease-editorial` is reserved for panel/drawer entries, not micro-interactions
- Stagger delay cap: `min(index * 40ms, 280ms)` — so a library of 10 projects doesn't feel sluggish (max 280ms start delay for the last visible card)
- `animation-fill-mode: both` ensures cards begin in the `from` state (invisible, offset) and hold the `to` state after completion
