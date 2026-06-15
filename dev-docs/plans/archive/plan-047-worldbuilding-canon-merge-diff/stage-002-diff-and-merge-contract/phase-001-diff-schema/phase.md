---
title: Diff Schema
slug: phase-001-diff-schema
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-002-diff-and-merge-contract
parts:
  - part-001-diff-schema
estimated_duration: TBD
---

## Goal

Define a typed canon diff schema for create, update, merge, link, and no-op proposals.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Diff Schema](part-001-diff-schema/part.md) | `complete` | Codex | TBD |

## Acceptance Criteria

- [x] Diff schema validates all intended decision types.
- [x] Schema includes enough evidence for author review.
- [x] Malformed diffs fail safely.

## Notes

Give worldbuilding proposal review a structured representation of field-level changes.
