---
title: Write Mode Pipeline Migration
slug: phase-004-write-mode-pipeline-migration
phase_number: 4
status: complete
owner: Planner Agent
stage: stage-002-modes-refactor
parts:
  - part-001-migrate-scribe-outline-to-write
  - part-002-define-write-subaction-contract
estimated_duration: 0.75d
---

# Phase 004 — Write Mode Pipeline Migration

## Goal

Convert the old Scribe outline path into a real Write-mode proposal workflow.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Migrate Scribe Outline to Write](part-001-migrate-scribe-outline-to-write/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Define Write Sub-Action Contract](part-002-define-write-subaction-contract/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [x] All parts reach `complete` after reviewer signoff.
- [x] `NovaMode = 'ask' | 'write' | 'agent'` replaces `chat | scribe` across Nova types, store, UI, and resolver routing.
- [x] Each mode has distinct placeholder copy, system prompt behavior, and acceptance-tested route behavior.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
