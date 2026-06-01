---
title: Add UI Regression Tests & Manual State Verification
slug: part-001-add-ui-regression-tests-and-manual-state-verification
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Claude Code
phase: phase-002-run-ui-regression-and-manual-verification
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.5d
---

## Objective

Validate review UI states and navigation notifications through automated and manual checks.

## Scope

**In scope:**

- UI/component test coverage and manual flow verification evidence

**Out of scope:**

- Contract/schema changes

## Implementation Steps

1. Add component/state tests for pending display and accept/reject transitions
2. Add stale-state recovery assertions after reload
3. Capture manual evidence for all explicit UI states

## Files

**Create:**

- tests/world-building/worldbuild-review-ui.test.ts

**Update:**

- tests/visual/worldbuilding-suggestions.spec.ts; dev-docs/plans/plan-037-agentic-worldbuild-scan/stage-005-hardening-tests-docs-and-evidence/phase-002-run-ui-regression-and-manual-verification/part-001-add-ui-regression-tests-and-manual-state-verification/evidence/manual-states-2026-05-31.md

## Acceptance Criteria

- [x] UI tests cover required state matrix and notification behavior
- [x] Manual evidence demonstrates expected behavior across route transitions

## Edge Cases

- State matrix checks miss failed or empty modes

## Notes

Manual evidence should include exact paths and expected outcomes.
