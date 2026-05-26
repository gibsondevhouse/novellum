---
title: Token Violation Classification
slug: part-002-token-debt-map
part_number: 2
status: in-progress
owner: Stylist / Reviewer
assigned_to: Stylist / Reviewer
phase: phase-001-audit-capture
estimated_duration: 1d
---

# Part-002: Token Violation Classification

## Objective

Produce the remediation work queue for token and visual-system debt.

## Scope

In scope:

- `pnpm run check:tokens` output.
- Undefined CSS token references.
- Hardcoded colors, raw shadows, raw motion, and route-local visual systems.

Out of scope:

- Fixing token violations; that happens in Stage 002.

## Implementation Steps

1. Run `pnpm run check:tokens` and save output.
2. Search for undefined tokens currently known in the plan: `--color-brand`, `--font-body`, `--transition-fast`, `--ease-out-back`, `--color-surface`, and `--color-border-hover`.
3. Map each violation to file path, line number, category, and recommended fix.
4. Identify repeated one-off visual values that should become tokens or shared utilities.
5. Document allowed exceptions separately with rationale.

## Files

Create:

- `dev-docs/plans/plan-015-cinematic-media/audit/token-debt-map.md`
- `dev-docs/plans/plan-015-cinematic-media/evidence/token-check-baseline-2026-04-21.txt`

Update:

- `dev-docs/plans/plan-015-cinematic-media/stage-001-baseline-audit/stage-001-baseline-audit.md`

## Acceptance Criteria

- [ ] Token debt map includes every `check:tokens` violation.
- [ ] Undefined token references are mapped even if `check:tokens` does not flag them.
- [ ] Each violation has a recommended replacement strategy.
- [ ] Stage 002 can execute from the debt map without rerunning discovery.

## Edge Cases

- CSS token definitions in `src/styles/` may intentionally contain raw values; classify those as definitions, not violations.
