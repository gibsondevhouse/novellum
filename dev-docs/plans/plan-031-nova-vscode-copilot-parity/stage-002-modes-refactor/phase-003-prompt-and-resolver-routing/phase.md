---
title: Prompt and Resolver Routing
slug: phase-003-prompt-and-resolver-routing
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-002-modes-refactor
parts:
  - part-001-define-per-mode-system-prompts
  - part-002-route-modes-through-task-resolver
estimated_duration: 1d
---

# Phase 003 — Prompt and Resolver Routing

## Goal

Make each mode route through the right AI contract instead of relying on prompt regexes.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Define Per-Mode System Prompts](part-001-define-per-mode-system-prompts/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Route Modes Through Task Resolver](part-002-route-modes-through-task-resolver/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [x] All parts reach `complete` after reviewer signoff.
- [x] `NovaMode = 'ask' | 'write' | 'agent'` replaces `chat | scribe` across Nova types, store, UI, and resolver routing.
- [x] Each mode has distinct placeholder copy, system prompt behavior, and acceptance-tested route behavior.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
