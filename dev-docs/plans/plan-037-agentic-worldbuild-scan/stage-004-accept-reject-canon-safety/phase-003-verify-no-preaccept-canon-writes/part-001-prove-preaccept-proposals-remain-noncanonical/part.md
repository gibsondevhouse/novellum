---
title: Prove Pre-Accept Proposals Remain Non-Canonical
slug: part-001-prove-preaccept-proposals-remain-noncanonical
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Claude Code
phase: phase-003-verify-no-preaccept-canon-writes
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.5d
---

## Objective

Add regression verification proving proposals do not mutate canon until explicit accept.

## Scope

**In scope:**

- Regression assertions for pre-accept persistence boundaries

**Out of scope:**

- New schema redesign

## Implementation Steps

1. Author regression tests for pre-accept proposal storage behavior
2. Assert canon tables unchanged prior to accept path
3. Capture evidence showing pre/post-accept table state differences

## Files

**Create:**

- tests/world-building/worldbuild-proposal-canon-safety.test.ts

**Update:**

- tests/routes/worldbuilding-proposals.test.ts

## Acceptance Criteria

- [x] Regression suite proves no pre-accept canon mutation
- [x] Evidence demonstrates write boundaries before and after accept

## Edge Cases

- Hidden side effects write canon via non-accept code paths

## Notes

Tests should include duplicate and failure-path preconditions.
