---
title: Mode Regression Tests
slug: phase-005-mode-regression-tests
phase_number: 5
status: complete
owner: Planner Agent
stage: stage-002-modes-refactor
parts:
  - part-001-add-mode-routing-test-suite
estimated_duration: 0.5d
---

# Phase 005 — Mode Regression Tests

## Goal

Prove the mode refactor did not break grounding, proposal-only behavior, or compact UI state.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add Mode Routing Test Suite](part-001-add-mode-routing-test-suite/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [x] All parts reach `complete` after reviewer signoff.
- [x] `NovaMode = 'ask' | 'write' | 'agent'` replaces `chat | scribe` across Nova types, store, UI, and resolver routing.
- [x] Each mode has distinct placeholder copy, system prompt behavior, and acceptance-tested route behavior.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
