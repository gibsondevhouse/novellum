---
title: Version Policy
slug: phase-003-version-policy
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-002-canonical-api-map
parts:
  - part-001-version-policy
estimated_duration: TBD
---

## Goal

Define schema version acceptance, migration, and rejection policy.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Version Policy](part-001-version-policy/part.md) | `complete` | Codex | TBD |

## Acceptance Criteria

- [x] Version policy is explicit by family.
- [x] Stale fixture update strategy is clear.
- [x] Unknown versions fail safely.

## Notes

Clarify how routes handle old, current, malformed, and future checkpoint artifact versions.
