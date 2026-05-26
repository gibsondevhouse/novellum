---
title: Visual Rulebook and Acceptance Criteria
slug: part-002-visual-rulebook-and-acceptance-criteria
part_number: 2
status: review
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-001-baseline-and-rulebook
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Encode enforceable visual rules and route-family acceptance checks for implementation and review of every inventoried UI surface.

## Scope

**In scope:**

- Token and primitive usage rules
- Typography and spacing consistency rules
- Allowed and forbidden pattern guidance
- Route-family acceptance checks
- Per-surface rule mapping for all entries in the UI surface registry

**Out of scope:**

- Automation implementation
- Route remediation code edits

## Implementation Steps

1. Convert baseline gaps to explicit rules.
2. Document allowed and forbidden patterns.
3. Define route-family and per-surface pass/fail checks.
4. Create a rule-mapping section that references every registry surface.
5. Publish rulebook artifact for Stage 002.

## Files

**Create:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-001-visual-contract-baseline/phase-001-baseline-and-rulebook/part-002-visual-rulebook-and-acceptance-criteria/evidence/visual-rulebook-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-001-visual-contract-baseline/phase-001-baseline-and-rulebook/part-002-visual-rulebook-and-acceptance-criteria/impl.log.md`

## Acceptance Criteria

- [ ] Rulebook includes enforceable token and primitive policies
- [ ] Route-family and per-surface acceptance checks are complete
- [ ] Every surface in the registry has at least one mapped contract check
- [ ] Rules can be translated to lint, test, or visual regression checks
