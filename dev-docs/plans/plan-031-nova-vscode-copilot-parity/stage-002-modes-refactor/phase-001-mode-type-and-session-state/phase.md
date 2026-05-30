---
title: Mode Type and Session State
slug: phase-001-mode-type-and-session-state
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-002-modes-refactor
parts:
  - part-001-replace-chat-scribe-types
  - part-002-persist-last-mode-per-project
estimated_duration: 1d
---

# Phase 001 — Mode Type and Session State

## Goal

Replace old mode primitives with a durable per-project Nova mode model.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Replace Chat/Scribe Types](part-001-replace-chat-scribe-types/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Persist Last Mode Per Project](part-002-persist-last-mode-per-project/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [x] All parts reach `complete` after reviewer signoff.
- [x] `NovaMode = 'ask' | 'write' | 'agent'` replaces `chat | scribe` across Nova types, store, UI, and resolver routing.
- [x] Each mode has distinct placeholder copy, system prompt behavior, and acceptance-tested route behavior.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
