---
title: Phase 002 - Prompt Library and Templates
slug: phase-002-prompt-library-and-templates
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-001-pipeline-foundation
parts:
  - part-001-build-prompt-library
estimated_duration: 2d
---

## Goal

Establish reusable prompt scaffolds per stage, backed by `templates` storage where project-specific overrides are needed.

## Parts

| #   | Part                                                       | Status  | Assigned To | Est. Duration |
| --- | ---------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Build Prompt Library](part-001-build-prompt-library/part.md) | `draft` | AI Agent    | 2d            |

## Acceptance Criteria

- [ ] All parts reach `complete`
- [ ] Prompt scaffolds are reusable, typed, and template-overridable

## Notes

Prompts must preserve `ROLE -> TASK -> CONTEXT -> CONSTRAINTS -> OUTPUT FORMAT` sections.
