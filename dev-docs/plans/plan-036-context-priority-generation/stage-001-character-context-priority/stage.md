---
title: Character Context Priority
slug: stage-001-character-context-priority
stage_number: 1
status: review
owner: Planner Agent
plan: plan-036-context-priority-generation
phases:
  - phase-001-context-contract-and-prompt
  - phase-002-ui-and-save-parity
estimated_duration: 2.5d
risk_level: medium
---

## Goal

Deliver implementation-ready Character generation that is explicitly guided by user-selected target/avoid names and that fills both existing core array fields and advanced psychological/voice fields already supported by persistence APIs.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Context Contract + Prompt](phase-001-context-contract-and-prompt/phase.md) | `in-progress` | 1.25d |
| 002 | [UI + Save Parity](phase-002-ui-and-save-parity/phase.md) | `review` | 1.25d |

## Entry Criteria

- Plan 036 approved for implementation.
- Active generation baseline (`plan-032`) and JSON-hardening fixes (`plan-035`) reviewed.
- File ownership confirmed for `GenerateButton`, `generation-draft` store, and `/api/worldbuilding/generate`.

## Exit Criteria

- Typed generation-context contract is wired end-to-end.
- Character schema/prompt includes advanced dossier fields.
- GeneratedEntityModal save path persists expanded fields to `/api/db/characters`.
- Pre-generation dialog can set target/avoid context before generation.

## Notes

This stage is the functional core. Stage 002 (faction/lineage extension) reuses the same context-priority primitives defined here.
