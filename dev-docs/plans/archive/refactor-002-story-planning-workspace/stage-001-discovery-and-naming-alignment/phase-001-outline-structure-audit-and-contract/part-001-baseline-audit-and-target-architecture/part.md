---
title: Baseline Audit and Target Architecture
slug: part-001-baseline-audit-and-target-architecture
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-001-outline-structure-audit-and-contract
started_at: 2026-04-13
completed_at: 2026-04-13
estimated_duration: 2d
---

## Objective

Capture what currently blocks delivery in the outline page and produce an implementation-ready architecture contract.

## Scope

**In scope:**

- Audit current outline route responsibilities and coupling points
- Define target Story Planning Workspace decomposition and naming
- Document module-boundary and route-thinness constraints

**Out of scope:**

- Runtime feature implementation
- Schema migrations

## Implementation Steps

1. Inventory route-level logic, state, and rendering responsibilities in the current outline page.
2. Group identified responsibilities into route orchestration, outliner module UI, services, and stores.
3. Produce a target decomposition map aligned with modular-boundaries policy.
4. Define naming contract for Story Frame, Act, Chapter, Scene, and Beat terminology.
5. Record acceptance checklist and handoff notes for Frontend Agent execution.

## Files

**Create:**

- dev-docs/plans/refactor-002-story-planning-workspace/stage-001-discovery-and-naming-alignment/phase-001-outline-structure-audit-and-contract/part-001-baseline-audit-and-target-architecture/evidence/structure-baseline-2026-04-13.md

**Update:**

- dev-docs/modules/outliner.md
- dev-docs/modular-boundaries.md

## Acceptance Criteria

- [ ] Baseline audit documents all blocking structural issues
- [ ] Target architecture map is approved and actionable
- [ ] Handoff checklist exists for Stage 002 onward

## Edge Cases

- Existing route-local behaviors that are intentionally temporary must be tagged as exceptions.
- Naming decisions should avoid collisions with current type aliases.

## Notes

Use this part as the contract source for all downstream implementation review.
