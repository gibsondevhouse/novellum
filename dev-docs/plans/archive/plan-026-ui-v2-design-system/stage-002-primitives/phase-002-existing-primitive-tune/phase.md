---
title: Existing Primitive Tune
slug: phase-002-existing-primitive-tune
phase_number: 2
status: complete
owner: Stylist Agent
stage: stage-002-primitives
parts:
  - part-001-implicit-token-alias-cascade
estimated_duration: 0.5d
---

## Goal

Audit each existing primitive against the v2 `preview/*.html` reference cards
and apply targeted anatomy fixes. The token shift from Stage 001 already
propagates warm-umber visuals automatically — this phase is about catching
micro-anatomy gaps (eyebrow size / letter-spacing, focus-ring offsets,
hover states) that tokens alone don't fix.

## Parts

| #   | Part                                                                                                          | Status     |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| 001 | [Implicit token-alias cascade](part-001-implicit-token-alias-cascade/part.md)                                 | `complete` |

## Exit Criteria

- Every primitive under `src/lib/components/ui/` reviewed against its
  reference card.
- Focus rings consistent and visible on every primitive on every surface
  tier.
- `/styles` showcase visually matches `preview/*.html`.

## Notes

- `PageHeader.svelte` eyebrow already tuned to v2 (9px / 0.18em / semibold)
  as part of phase-001's drive-by.
- Visual regression baselines NOT regenerated in this stage.
- 2026-05-26 closeout: the originally-scoped three-part sweep
  (headers / inputs+focus / buttons+surfaces+nav) landed
  implicitly via stage-002 phase-001 (new editorial primitives,
  v2-anatomy from the start) and stage-006 phase-001 (token
  alias cascade). Folded into a single rollup part and
  promoted to `complete`.
