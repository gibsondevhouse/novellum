---
title: Static Token and Primitive Enforcement
slug: part-001-static-token-and-primitive-enforcement
part_number: 1
status: review
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-tooling-and-route-remediation
started_at: 2026-04-14
completed_at: ~
estimated_duration: 1d
---

## Objective

Implement static checks that block token drift and primitive bypasses.

## Scope

**In scope:**

- Hardcoded style value detection
- Primitive misuse detection
- Integration with lint workflow

**Out of scope:**

- Visual snapshot automation
- Route-level remediation

## Implementation Steps

1. Implement token misuse checks.
2. Implement primitive misuse checks.
3. Integrate checks with lint pipeline.
4. Capture pass/fail evidence.

## Files

**Create:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-002-enforcement-automation-and-remediation/phase-001-tooling-and-route-remediation/part-001-static-token-and-primitive-enforcement/evidence/static-enforcement-evidence-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-002-enforcement-automation-and-remediation/phase-001-tooling-and-route-remediation/part-001-static-token-and-primitive-enforcement/impl.log.md`

## Acceptance Criteria

- [ ] Violating patterns are caught
- [ ] Compliant patterns pass
- [ ] `pnpm run lint` includes checks and exits 0 on clean state
