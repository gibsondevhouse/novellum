---
title: Context Contract and Prompt
slug: phase-001-context-contract-and-prompt
phase_number: 1
status: review
owner: Planner Agent
stage: stage-001-character-context-priority
parts:
  - part-001-add-generation-context-contract
  - part-002-expand-character-schema-and-prompt
estimated_duration: 1.25d
---

## Goal

Replace the loose string-only context path with a typed generation-context contract and upgrade character prompt/schema coverage so the model can return full dossier-ready fields.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add Generation Context Contract](part-001-add-generation-context-contract/part.md) | `in-progress` | Backend Agent | 0.5d |
| 002 | [Expand Character Schema and Prompt](part-002-expand-character-schema-and-prompt/part.md) | `in-progress` | AI Agent | 0.75d |

## Acceptance Criteria

- [ ] Request/response contract supports structured generation context (targets/avoids/sources)
- [ ] `/api/worldbuilding/generate` parses structured context safely
- [ ] Character output schema includes advanced dossier fields
- [ ] Character mock draft path reflects expanded schema for test/dev parity

## Notes

Backward compatibility should be preserved for callers still passing `context` as plain string during the migration window.
