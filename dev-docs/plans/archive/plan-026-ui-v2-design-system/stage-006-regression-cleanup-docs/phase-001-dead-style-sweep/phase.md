---
title: Dead Style Sweep & Token Alias
slug: phase-001-dead-style-sweep
phase_number: 1
status: complete
owner: Stylist Agent
stage: stage-006-regression-cleanup-docs
parts:
  - part-001-nova-blue-token-alias
  - part-002-reader-and-chrome-followups
estimated_duration: 0.25d
---

## Goal

Close out the residual `--color-nova-blue` surface across the
codebase by aliasing the legacy token to the v2 candle accent
at the token layer, then land the deferred reader / sidebar /
Muse polish items so every stage in plan-026 reaches its v2
target without per-file sweeps.

## Parts

| #   | Part                                                                                  | Status     |
| --- | ------------------------------------------------------------------------------------- | ---------- |
| 001 | [Nova-blue token alias](part-001-nova-blue-token-alias/part.md)                       | `complete` |
| 002 | [Reader + sidebar + Muse follow-ups](part-002-reader-and-chrome-followups/part.md)    | `complete` |

## Acceptance Criteria

- [x] `--color-nova-blue` resolves to `var(--color-candle)` in
  both dark and light scopes.
- [x] `--color-border-focus` carries a candle rgba tint in both
  scopes.
- [x] Reader page renders the candle/ember ribbon + folio
  micro-anatomy.
- [x] Sidebar dual-band divider uses brass tint.
- [x] Nova / Muse resize handle reads candle on hover.
- [x] All gates green (`pnpm check:tokens`, `pnpm check`,
  `pnpm lint`, `pnpm lint:css`, `pnpm test`).

## Notes

The token alias is the highest-leverage change in this phase —
60+ files that still referenced `--color-nova-blue` (focus
rings, AI accents, scene rows, hub progress, settings
selectors, world-building panels, chat surfaces) inherit the
warm palette without per-file edits.

`--color-info: #3b82f6` is intentionally retained as a genuine
semantic info colour (used by settings / data-migration
banners).
