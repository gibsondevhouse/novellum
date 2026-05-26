---
title: Canonical Shell Contract
slug: phase-001-canonical-shell
phase_number: 1
status: complete
owner: Architect Agent
stage: stage-002-app-shell-convergence
parts:
  - part-001-appshell-convergence
estimated_duration: 1.5d
---

## Goal

Collapse layout variants into one `AppShell` backing every reachable route.

## Parts

| #   | Part                                                                 | Status   | Assigned To | Est. Duration |
| --- | -------------------------------------------------------------------- | -------- | ----------- | ------------- |
| 001 | [AppShell Convergence](part-001-appshell-convergence/part.md)        | `complete` | Architect   | 1.5d          |

## Acceptance Criteria

- [x] All parts reach `complete` status (pending formal approval)
- [x] Every route uses the canonical `AppShell`.
- [x] No route-local background or shell CSS remains outside documented exceptions.

## Notes

- Any whitelisted exception must be documented in the canonical rules.
