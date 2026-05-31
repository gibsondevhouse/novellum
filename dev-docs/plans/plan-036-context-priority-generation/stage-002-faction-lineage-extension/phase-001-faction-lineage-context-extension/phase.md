---
title: Faction and Lineage Context Extension
slug: phase-001-faction-lineage-context-extension
phase_number: 1
status: review
owner: Planner Agent
stage: stage-002-faction-lineage-extension
parts:
  - part-001-extend-context-priority-to-faction-lineage
estimated_duration: 0.75d
---

## Goal

Reuse context-priority extraction and intent wiring so faction/lineage generation can explicitly incorporate author-selected target and avoid signals.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Extend Context Priority to Faction/Lineage](part-001-extend-context-priority-to-faction-lineage/part.md) | `draft` | AI Agent | 0.75d |

## Acceptance Criteria

- [ ] Faction and lineage prompt builders include context-priority guidance
- [ ] Dialog flow supports these entity kinds without branching bugs
- [ ] Existing lineage metadata save behavior remains intact

## Notes

Keep generated output schema aligned with existing faction and lineage persistence shapes to avoid introducing unsaved fields.
