---
title: Compatibility Decision
slug: phase-001-compatibility-decision
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-003-legacy-adapter-or-retirement
parts:
  - part-001-compatibility-decision
estimated_duration: TBD
---

## Goal

Choose whether to implement adapters or retire each legacy checkpoint contract.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Compatibility Decision](part-001-compatibility-decision/part.md) | `complete` | Codex | TBD |

## Acceptance Criteria

- [x] Every legacy behavior has a disposition.
- [x] Decision avoids preserving stale tests by default.
- [x] Required implementation files are named.

## Notes

Resolve old generic metadata fixture behavior without preserving accidental complexity.
