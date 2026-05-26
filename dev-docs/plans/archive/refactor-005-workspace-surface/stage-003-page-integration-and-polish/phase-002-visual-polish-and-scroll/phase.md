---
title: Visual Polish & Scroll
slug: phase-002-visual-polish-and-scroll
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-003-page-integration-and-polish
parts:
  - part-001-layout-scroll-and-visual-alignment
estimated_duration: 0.5d
---

## Goal

> Establish the fixed-hero / independently-scrolling-collection layout, hide the collection zone scrollbar, and ensure the entire Workspace surface visually aligns with the Hub's cinematic aesthetic — matching card chrome, spacing, typography, color tokens, and overall polish level.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Layout, Scroll & Visual Alignment](part-001-layout-scroll-and-visual-alignment/part.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] Hero zone remains fixed/sticky while the page scrolls
- [ ] Collection zone scrolls independently beneath the hero
- [ ] No visible scrollbar on the collection zone
- [ ] Card surfaces use `var(--color-surface-overlay)`, `var(--color-border-default)`, `var(--radius-lg)`
- [ ] Typography uses Hub-consistent tokens: `--font-display`, `--font-sans`, `--text-*` scale
- [ ] Spacing uses design system tokens: `--space-*`
- [ ] Empty states don't produce giant blank panels
- [ ] Overall result feels premium, structured, and consistent with the Hub

## Notes

> The fixed-hero layout uses CSS `position: sticky` on the hero shell with appropriate `top` offset. The main workspace container uses `height: 100%` or `calc(100vh - header)` with `overflow: hidden`, while the collection zone uses `overflow-y: auto` with hidden scrollbar.
>
> Scrollbar hiding approach: `-webkit-scrollbar { display: none }` + `scrollbar-width: none` (Firefox).
