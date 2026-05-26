---
title: Cross-Route Inventory and Target Contract
slug: part-001-cross-route-inventory-and-target-contract
part_number: 1
status: review
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-001-route-contract-and-guardrails
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Build an explicit route-family inventory and define target behavior contracts for each family before implementation begins.

## Scope

**In scope:**

- Inventory of all page and deep-route surfaces in `src/routes/**`
- Route-family grouping: library/reader, project core, bible/world-building, utility/system pages
- Family-level behavior contracts for navigation, active states, and page-shell expectations

**Out of scope:**

- Page code edits
- Loader implementation changes

## Implementation Steps

1. Enumerate and group routes by functional family.
2. Define route-family target behavior contracts and parity requirements.
3. Capture known gaps and regression risks per family.
4. Produce implementation handoff artifact for Stage 002.

## Files

**Create:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-001-route-contract-and-foundations/phase-001-route-contract-and-guardrails/part-001-cross-route-inventory-and-target-contract/evidence/route-family-contract-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-001-route-contract-and-foundations/phase-001-route-contract-and-guardrails/part-001-cross-route-inventory-and-target-contract/impl.log.md`

## Acceptance Criteria

- [ ] All route families are listed with representative routes
- [ ] Contract includes expected navigation behavior and active-state logic
- [ ] Contract artifacts are actionable for Stage 002 implementers

## Edge Cases

- Dynamic nested routes with similar purpose but different params
- Reader routes that should remain isolated from workspace-only controls

## Notes

- Ensure family definitions explicitly separate read-only and project-edit surfaces.
