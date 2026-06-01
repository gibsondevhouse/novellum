---
title: Enforce Atomic Accept Projection Constraints
slug: part-001-enforce-atomic-accept-projection-constraints
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Claude Code
phase: phase-002-enforce-atomic-projection-safety
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.75d
---

## Objective

Guarantee accept-time projection behavior prevents partial canon writes.

## Scope

**In scope:**

- Projection transaction safety, failure semantics, and lifecycle guarding

**Out of scope:**

- UI copy updates

## Implementation Steps

1. Review current accept projection path and identify partial-write risks
2. Implement atomic/rollback safeguards for proposal projection
3. Gate accepted lifecycle transition on projection safety outcome

## Files

**Create:**

- src/lib/ai/pipeline/checkpoint-service.ts

**Update:**

- src/lib/ai/pipeline/checkpoint-contract.ts

## Acceptance Criteria

- [x] Partial projection writes are prevented or rolled back safely
- [x] Accepted lifecycle does not commit when projection safety fails

## Edge Cases

- Checkpoint reaches accepted state while projection remains incomplete

## Notes

Failure behavior must be deterministic and documented for operators.
