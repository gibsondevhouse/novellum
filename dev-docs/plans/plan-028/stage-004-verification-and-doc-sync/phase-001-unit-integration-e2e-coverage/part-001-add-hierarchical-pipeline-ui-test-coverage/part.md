---
title: Add Hierarchical Pipeline UI Test Coverage
slug: part-001-add-hierarchical-pipeline-ui-test-coverage
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-unit-integration-e2e-coverage
started_at: 2026-05-26T19:35:00Z
completed_at: 2026-05-26T19:45:00Z
estimated_duration: 2d
---

## Objective

Add unit, integration, and e2e tests that prove plan-028 hierarchical UI behavior and checkpoint guardrails.

## Scope

**In scope:**

- Unit tests for path invariants, readiness guards, and runtime transitions.
- Integration tests for run adapter and checkpoint operation wiring.
- E2E UI workflow tests from Arc -> Stage traversal through accept/reject/failure outcomes.

**Out of scope:**

- New backend behavior beyond existing route contracts.
- Visual-design-only snapshot additions not tied to flow correctness.

## Implementation Steps

1. Add missing unit/integration tests for hierarchy and adapters.
2. Add e2e specs for worldbuild run/review/accept/reject/failure workflows.
3. Capture and store full gate outputs in part evidence.

## Files

**Create:**

- `tests/e2e/hierarchical-pipeline-traversal.spec.ts`
- `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts`
- `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts`

**Update:**

- `tests/outline/worldbuild-pipeline-runner.test.ts`
- `tests/outline/worldbuild-stage-runtime-state.test.ts`
- `tests/outline/worldbuild-checkpoint-decision-flow.test.ts`

## Acceptance Criteria

- [x] Unit coverage exists for path invariants and readiness/runtime guards.
- [x] Integration coverage exists for adapter/checkpoint transition mapping.
- [x] E2E coverage exists for traversal, run, review, accept, reject, and failure flows.
- [x] Evidence includes captured command outputs for required quality gates.

## Edge Cases

- Race conditions from selection changes during active runs.
- Reject without reason must fail before network call.

## Notes

Baseline expectations and gate command logs must be captured in `evidence/` files.
