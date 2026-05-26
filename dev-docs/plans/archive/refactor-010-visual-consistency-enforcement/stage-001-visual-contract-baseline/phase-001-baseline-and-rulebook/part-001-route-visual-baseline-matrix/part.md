---
title: Route Visual Baseline Matrix
slug: part-001-route-visual-baseline-matrix
part_number: 1
status: review
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-001-baseline-and-rulebook
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Capture and normalize current visual state for every UI surface, then map target parity requirements.

## Scope

**In scope:**

- Exhaustive inventory of all `+page*` and `+layout*` route surfaces in `src/routes/**`
- Baseline capture across route families
- Current-state versus target-state matrix
- Priority and severity ranking for remediation

**Out of scope:**

- Direct UI code changes

## Implementation Steps

1. Enumerate all UI surfaces from `src/routes/**` (`+page*` and `+layout*`) into a registry table.
2. Capture representative visual snapshots for each route family and each unique surface variant.
3. Document current shell, typography, spacing, and primitive usage per surface.
4. Define target contract per route family and map each surface to it.
5. Produce a severity-ranked matrix artifact with per-surface compliance status.

## Files

**Create:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-001-visual-contract-baseline/phase-001-baseline-and-rulebook/part-001-route-visual-baseline-matrix/evidence/route-visual-baseline-matrix-2026-04-14.md`
- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-001-visual-contract-baseline/phase-001-baseline-and-rulebook/part-001-route-visual-baseline-matrix/evidence/ui-surface-registry-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-001-visual-contract-baseline/phase-001-baseline-and-rulebook/part-001-route-visual-baseline-matrix/impl.log.md`

## Acceptance Criteria

- [ ] Surface registry includes every `+page*` and `+layout*` under `src/routes/**`
- [ ] Matrix includes surface_id, route family, current state, target state, severity, and compliance status columns
- [ ] No surface is unclassified or missing target criteria
- [ ] Matrix is implementation-ready for Stage 002
