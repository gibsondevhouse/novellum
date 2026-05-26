---
title: Audit & Canonical Name Map
slug: stage-001-audit-and-canonical-name-map
stage_number: 1
status: draft
owner: Planner Agent
plan: plan-019-naming-consistency
phases:
  - phase-001-route-and-module-inventory
  - phase-002-canonical-name-decisions
estimated_duration: 1d
risk_level: low
---

## Goal

Produce a single authoritative table mapping every current
route segment, module folder, and prominent component file to
its **canonical** name. No code or doc edit happens in this
stage — its only output is `evidence/name-map.md` plus user
sign-off.

## Phases

| #   | Phase                                                                                              | Status  | Est. Duration |
| --- | -------------------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Route & module inventory](phase-001-route-and-module-inventory/phase.md)                          | `draft` | 0.5d          |
| 002 | [Canonical name decisions](phase-002-canonical-name-decisions/phase.md)                            | `draft` | 0.5d          |

## Entry Criteria

- Plan-017 is `complete` (no in-flight refactors competing for the
  same file paths).
- The user has confirmed scope (Q&A in conversation: "1.c, 2. every
  page, 3. follow existing documentation").

## Exit Criteria

- All phases complete.
- `evidence/name-map.md` lists every route, module, and notable
  component with: current name → canonical name → rationale.
- The user has explicitly approved the name map. Without this
  approval, Stage 002 must not begin.

## Notes

- Where the existing docs disagree (e.g.
  `repo-structure.md` says `workspace/` but `routing-context.md`
  says `outline/`), this stage decides which doc was right and
  which was stale.
- Special cases that must be addressed by name in the map:
  `bible/` vs `world-building/`, `consistency/` vs `continuity/`,
  `outline/` vs `outliner/`, `editor/` (multi-pane) vs
  `editor/[sceneId]` (focused), and the editor's
  `DocumentEditorFrame` / `ManuscriptSurface` component split.
