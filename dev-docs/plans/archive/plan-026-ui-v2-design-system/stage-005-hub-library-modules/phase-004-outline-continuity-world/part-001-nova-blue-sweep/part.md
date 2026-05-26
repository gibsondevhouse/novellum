---
title: Nova-blue Sweep (Outline + World-Building)
slug: part-001-nova-blue-sweep
part_number: 1
status: complete
owner: Stylist Agent
phase: phase-004-outline-continuity-world
---

## Scope

Replace `--color-nova-blue` references inside Outline and
World-Building module components with semantic v2 tokens:

- `OutlineDetailCard`: scene accent (`accentColor` + `.type-badge--scene`)
  → `--color-candle`; `.btn-editor:hover` → brass-blended border with
  candle text + candle wash.
- `AddChapterForm`: input focus border → `--color-border-focus`.
- `ArcTagHint`: pill background + border re-tokened to candle /
  brass; text colour set to candle for contrast.
- `NarrativeStatePanel`: input focus border tinted from
  `--color-border-focus` instead of nova-blue.
- `CharacterForm`: input focus border → `--color-border-focus`.

See [`checklist.md`](checklist.md) and [`impl.log.md`](impl.log.md).
