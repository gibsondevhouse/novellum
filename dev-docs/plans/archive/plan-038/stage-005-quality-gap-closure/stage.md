---
title: Quality Gap Closure
slug: stage-005-quality-gap-closure
stage_number: 5
status: complete
owner: Backend Agent
plan: plan-038-novel-engine-v1
phases:
  - phase-001-source-contract-tests
  - phase-002-context-and-response-hardening
estimated_duration: 2d
risk_level: low
---

## Goal

Close the six quality gaps discovered during review of the Codex initial implementation.
All items are in-scope for the plan and do not require architectural changes.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Source-Contract Tests](phase-001-source-contract-tests/phase.md) | `draft` | 1d |
| 002 | [Context & Response Hardening](phase-002-context-and-response-hardening/phase.md) | `draft` | 1d |

## Entry Criteria

- Stages 003 and 004 are `complete`.
- `buildSceneDraftContext` and checkpoint card are in their current implemented state.

## Exit Criteria

- All phases complete.
- `NovaAuthorDraftCheckpointCard` source-contract test exists and locks dangerous behavior.
- `buildSceneDraftContext` unit test exists with in-memory SQLite.
- `unresolvedThreads` populated from `plot_threads` table.
- `rawOutput` stripped from generate response.
- Progress counter correctly tracks generated (not just iterated) scenes.
- `draft` lifecycle value used or removed.

## Background: The Six Gaps

| # | Gap | Phase | Part |
| --- | --- | --- | --- |
| 1 | No source-contract test for `NovaAuthorDraftCheckpointCard` | 001 | 001 |
| 2 | No unit test for `buildSceneDraftContext` | 001 | 002 |
| 3 | `unresolvedThreads` always `[]` | 002 | 001 |
| 4 | `rawOutput` returned in generate response | 002 | 002 |
| 5 | Progress counter wrong for skipped scenes | 002 | 003 |
| 6 | `draft` lifecycle value dead code | 002 | 004 |
