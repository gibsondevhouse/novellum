---
title: Route-Family Consistency Remediation
slug: part-003-route-family-consistency-remediation
part_number: 3
status: review
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-tooling-and-route-remediation
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 2d
---

## Objective

Refactor route-family surfaces until every inventoried UI surface satisfies the visual rulebook and automated checks.

## Scope

**In scope:**

- Route-family remediation by severity
- Shell, spacing, typography, and primitive parity updates
- Validation against static and visual checks

**Out of scope:**

- New feature behavior
- Backend/API changes

## Implementation Steps

1. Prioritize family-level visual drift by severity.
2. Apply remediation by route family and update per-surface compliance status in the registry.
3. Re-run lint/check/test and visual checks after each batch.
4. Capture before/after evidence.
5. Verify registry closure (100% compliant, 0 unresolved surfaces).

## Files

**Create:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-002-enforcement-automation-and-remediation/phase-001-tooling-and-route-remediation/part-003-route-family-consistency-remediation/evidence/route-family-remediation-report-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-002-enforcement-automation-and-remediation/phase-001-tooling-and-route-remediation/part-003-route-family-consistency-remediation/impl.log.md`

## Acceptance Criteria

- [ ] Route families satisfy rulebook acceptance checks
- [ ] Visual regression suite passes
- [ ] `pnpm run lint`, `pnpm run check`, and `pnpm run test` pass
- [ ] UI surface registry reports 100% compliance and zero unresolved entries
