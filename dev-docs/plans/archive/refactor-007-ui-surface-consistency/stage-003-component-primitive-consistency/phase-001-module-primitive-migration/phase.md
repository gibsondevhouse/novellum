---
title: Module Primitive Migration
slug: phase-001-module-primitive-migration
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-003-component-primitive-consistency
parts:
  - part-001-ai-primitive-migration
  - part-002-bible-primitive-migration
  - part-003-consistency-primitive-migration
  - part-004-editor-primitive-migration
  - part-005-export-primitive-migration
  - part-006-outliner-primitive-migration
  - part-007-project-primitive-migration
estimated_duration: 3d
---

## Goal

Migrate module UIs to shared layout and action primitives to eliminate ad-hoc styled raw elements.

## Parts

| #   | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [AI module primitive migration](part-001-ai-primitive-migration/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [Bible module primitive migration](part-002-bible-primitive-migration/part.md) | `draft` | Frontend Agent | 0.5d |
| 003 | [Consistency module primitive migration](part-003-consistency-primitive-migration/part.md) | `draft` | Frontend Agent | 0.5d |
| 004 | [Editor module primitive migration](part-004-editor-primitive-migration/part.md) | `draft` | Frontend Agent | 0.5d |
| 005 | [Export module primitive migration](part-005-export-primitive-migration/part.md) | `draft` | Frontend Agent | 0.5d |
| 006 | [Outliner module primitive migration](part-006-outliner-primitive-migration/part.md) | `draft` | Frontend Agent | 0.5d |
| 007 | [Project module primitive migration](part-007-project-primitive-migration/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] All parts reach complete status.
- [ ] Component inventory diff evidence confirms primitive usage convergence.

## Notes

No raw button with ad-hoc styling or raw styled surface wrappers should remain in scoped modules.
