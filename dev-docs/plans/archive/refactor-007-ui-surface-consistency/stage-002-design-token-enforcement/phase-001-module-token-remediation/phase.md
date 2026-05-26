---
title: Module Token Remediation
slug: phase-001-module-token-remediation
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-002-design-token-enforcement
parts:
  - part-001-ai-token-enforcement
  - part-002-bible-token-enforcement
  - part-003-consistency-token-enforcement
  - part-004-editor-token-enforcement
  - part-005-export-token-enforcement
  - part-006-outliner-token-enforcement
  - part-007-project-token-enforcement
estimated_duration: 3d
---

## Goal

Execute a module-by-module token sweep to replace hardcoded values with approved design tokens.

## Parts

| #   | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [AI module token enforcement](part-001-ai-token-enforcement/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [Bible module token enforcement](part-002-bible-token-enforcement/part.md) | `draft` | Frontend Agent | 0.5d |
| 003 | [Consistency module token enforcement](part-003-consistency-token-enforcement/part.md) | `draft` | Frontend Agent | 0.5d |
| 004 | [Editor module token enforcement](part-004-editor-token-enforcement/part.md) | `draft` | Frontend Agent | 0.5d |
| 005 | [Export module token enforcement](part-005-export-token-enforcement/part.md) | `draft` | Frontend Agent | 0.5d |
| 006 | [Outliner module token enforcement](part-006-outliner-token-enforcement/part.md) | `draft` | Frontend Agent | 0.5d |
| 007 | [Project module token enforcement](part-007-project-token-enforcement/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] All parts reach complete status.
- [ ] Before/after grep evidence confirms zero hardcoded token violations in scoped modules.

## Notes

Violation classes include raw hex colors, non-token borders, and spacing values not using token variables.
