---
title: DB Repair Script & Regression Tests
slug: phase-003-db-repair-and-tests
phase_number: 3
status: review
owner: Planner Agent
stage: stage-001-fix-json-encoding
parts:
  - part-001-create-repair-script
  - part-002-add-regression-tests
estimated_duration: 0.5d
risk_level: low
---

## Goal

Create a one-time DB repair script to fix existing double-encoded JSON rows, and add comprehensive regression tests to prevent future double-encoding bugs.

## Parts

| #   | Part                                     | Status  | Est. Duration |
| --- | ---------------------------------------- | ------- | ------------- |
| 001 | [Create DB Repair Script](part-001-create-repair-script/part.md) | `review` | 0.25d |
| 002 | [Add Regression Tests](part-002-add-regression-tests/part.md) | `review` | 0.25d |

## Entry Criteria

- [ ] Phases 1 & 2 are complete
- [ ] All pre-encoding removed and type guards added
- [ ] Server hardening in place

## Exit Criteria

- [ ] Repair script created at `scripts/repair-json-fields.mjs`
- [ ] Script runs without errors and logs repaired rows
- [ ] New test file: `tests/db/json-encoding.test.ts`
- [ ] Tests cover round-trip JSON encoding, pre-stringified values, type guards
- [ ] All tests passing
- [ ] No lint or type errors

## Notes

- Repair script is non-destructive and can be safely run multiple times
- Tests validate both Phases 1–3 behavior
- Script should be run before any deployment to production
