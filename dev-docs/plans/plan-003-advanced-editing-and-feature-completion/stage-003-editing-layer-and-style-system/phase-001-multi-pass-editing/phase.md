---
title: Multi-Pass Editing
slug: phase-001-multi-pass-editing
phase_number: 1
status: complete
owner: AI Agent
stage: stage-003-editing-layer-and-style-system
parts:
  - part-001-edit-agent-modes
  - part-002-inline-suggestion-ui
estimated_duration: 3d
---

## Goal

Implement EditAgent with three distinct modes (developmental, line editing, proofreading), each using a tailored prompt, and build the inline suggestion UI component that presents AI edit suggestions for author review.

## Parts

| #   | Part                                                          | Status  |
| --- | ------------------------------------------------------------- | ------- |
| 001 | [Edit Agent Modes](part-001-edit-agent-modes/part.md)         | `draft` |
| 002 | [Inline Suggestion UI](part-002-inline-suggestion-ui/part.md) | `draft` |

## Entry Criteria

- stage-001 complete: scene text is editable in the editor view
- plan-002 pipeline tested end-to-end (stage-004 complete)
- `edit` TaskType not yet added to `src/lib/ai/types.ts`

## Exit Criteria

- `edit` task type resolves with mode sub-type encoded in `role` / `outputFormat`
- EditAgent prompt for `developmental` mode focuses on structure, pacing, and scene goals
- EditAgent prompt for `line_edit` mode focuses on sentence clarity, word choice, rhythm
- EditAgent prompt for `proofread` mode focuses on grammar, punctuation, continuity of facts
- Output is a structured array of `EditSuggestion { spanStart, spanEnd, original, suggestion, reason }`
- Inline suggestion UI overlays suggestions on the scene text; each shows original vs. suggested with accept/reject buttons
- Accepting a suggestion applies the replacement to `scene.text` and triggers autosave
