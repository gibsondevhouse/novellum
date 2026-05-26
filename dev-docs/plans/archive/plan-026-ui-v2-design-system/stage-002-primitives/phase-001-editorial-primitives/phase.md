---
title: Editorial Primitives
slug: phase-001-editorial-primitives
phase_number: 1
status: complete
owner: Stylist Agent
stage: stage-002-primitives
parts:
  - part-001-new-primitives
estimated_duration: 0.5d
---

## Goal

Add the four net-new editorial primitives required by Stages 004–005:
`EditorialEyebrow`, `Logline`, `Ornament`, `DropCap`. Export from the
`src/lib/components/ui/` barrel.

## Parts

| #   | Part                                                          | Status     |
| --- | ------------------------------------------------------------- | ---------- |
| 001 | [New Editorial Primitives](part-001-new-primitives/part.md)   | `complete` |

## Exit Criteria

- Four new primitives exist under `src/lib/components/ui/`.
- Each consumes tokens only — no hardcoded values.
- Barrel export updated.
- Quality gates green.
