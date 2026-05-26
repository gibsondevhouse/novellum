---
title: Editor Surface Correction
slug: stage-006-editor-surface-correction
stage_number: 6
status: complete
owner: Stylist Agent
plan: plan-016-visual-consistency
phases:
  - phase-001-editor-calm-down
  - phase-002-editor-tools-and-modes
estimated_duration: 3d
risk_level: medium
closed_at: 2026-04-28
closed_via: transfer
transferred_to: plan-018-v1-product-experience/stage-002-editor-writing-first
---

## Goal

Restore the editor as the calmest, most author-facing surface in Novellum. Strip dashboard-like chrome, restrain the top bar, demote tool UI to secondary weight, and calibrate prose width, density, and typography so the writing surface reads like a manuscript — not a control center.

## Phases

| #   | Phase                                                              | Status  | Est. Duration |
| --- | ------------------------------------------------------------------ | ------- | ------------- |
| 001 | [Editor Calm-Down](phase-001-editor-calm-down/phase.md)            | `draft` | 1.5d          |
| 002 | [Editor Tools & Modes](phase-002-editor-tools-and-modes/phase.md)  | `draft` | 1.5d          |

## Entry Criteria

- Stages 002 and 003 complete.
- Editor-specific drift findings from Stage 001 reviewed and accepted.

## Exit Criteria

- Editor top bar, side panels, and inline tools use restrained visual weight that defers to prose.
- Prose width, line height, and spacing match the canonical editor rules.
- Tiptap-backed surface still passes its `tests/editor/**` suite.
- Focus mode and distraction-free mode (if present) align with the calm-surface rules.

## Notes

- Follow `.github/skills/editor/SKILL.md` and `.github/skills/tiptap-editor/SKILL.md`.
- Any change to editor extension wiring must preserve existing content behavior — this stage is cosmetic and structural only.

## Status Note

Closed via transfer on 2026-04-28. The cosmetic-only deferred work in this stage was superseded by [plan-018 stage-002 — Editor Writing-First Refactor](../../plan-018-v1-product-experience/stage-002-editor-writing-first/stage.md), which performs a full route decomposition, mode system, and writing-first calibration of the editor surface. Continuing with a cosmetic-only pass here would have been re-done by stage-002. Both phases (`phase-001-editor-calm-down`, `phase-002-editor-tools-and-modes`) are absorbed by that stage; no further work is planned within plan-016.
