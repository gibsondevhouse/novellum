---
title: Hidden Caller Sweep
slug: phase-003-hidden-caller-sweep
phase_number: 3
status: draft
owner: Planner Agent
stage: stage-003-legacy-adapter-or-retirement
parts:
  - part-001-hidden-caller-sweep
estimated_duration: TBD
---

## Goal

Confirm no active source caller relies on retired or changed checkpoint contracts.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Hidden Caller Sweep](part-001-hidden-caller-sweep/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] No active caller uses retired checkpoint contracts.
- [ ] Remaining historical references are documented.
- [ ] Source search evidence is captured.

## Notes

Use source search and targeted runtime checks to prevent hidden route breakage.
