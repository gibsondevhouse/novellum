---
title: Add Scan Contract, Dedupe, and API Test Coverage
slug: part-001-add-scan-contract-dedupe-and-api-test-coverage
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Claude Code
phase: phase-001-expand-unit-and-api-coverage
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.5d
---

## Objective

Add required unit and API coverage for scan contract validation and duplicate handling.

## Scope

**In scope:**

- Unit/API tests for validation, dedupe, and provider-error behaviors

**Out of scope:**

- Manual verification evidence capture

## Implementation Steps

1. Add unit tests for contract normalization and dedupe logic
2. Add API tests for no-credentials, bad schema, duplicate, and success responses
3. Ensure coverage aligns with plan-037 failure mode register

## Files

**Create:**

- tests/world-building/worldbuild-scan-contract.test.ts; tests/world-building/worldbuild-scan-dedupe.test.ts

**Update:**

- tests/routes/worldbuilding-scan.test.ts

## Acceptance Criteria

- [x] Required unit and API scenarios are covered and passing
- [x] Tests explicitly cover listed high-risk failure modes

## Edge Cases

- Tests pass but omit duplicate/precondition edge cases

## Notes

Coverage should be deterministic and avoid timing-sensitive assertions.
