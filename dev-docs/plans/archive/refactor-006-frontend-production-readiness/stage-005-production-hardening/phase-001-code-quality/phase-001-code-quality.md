---
title: Code Quality Cleanup
slug: phase-001-code-quality
phase_number: 1
status: complete
owner: frontend
stage: stage-005-production-hardening
parts:
  - part-001-console-log-removal
  - part-002-memory-leaks
estimated_duration: 0.5d
---

## Goal

Remove all production `console.log` statements and fix any event-listener registrations that are not cleaned up on component destroy.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Console Log Removal](./part-001-console-log-removal.md) | `draft` | frontend | 0.25d |
| 002 | [Memory Leak Fixes](./part-002-memory-leaks.md) | `draft` | frontend | 0.25d |

## Acceptance Criteria

- [ ] `grep -rn "console\.log" src/` returns zero matches.
- [ ] All `addEventListener` calls in layout/root components have matching `removeEventListener` in cleanup.
- [ ] All parts reach `complete` status.

## Notes

`console.error` and `console.warn` inside genuine error-handling paths are acceptable in production if they aid diagnostics. Only `console.log` (debug/informational) must be removed.
