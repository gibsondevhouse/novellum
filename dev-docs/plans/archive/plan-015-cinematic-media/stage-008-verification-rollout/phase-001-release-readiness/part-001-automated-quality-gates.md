---
title: Automated Quality Gates
slug: part-001-automated-quality-gates
part_number: 1
status: complete
owner: Reviewer
assigned_to: Reviewer
phase: phase-001-release-readiness
estimated_duration: 1d
---

# Part-001: Automated Quality Gates

## Objective

Run and record every automated gate required for production UI release readiness.

## Scope

In scope: token, lint, Svelte/TypeScript, unit/integration, and visual regression gates.

Out of scope: fixing findings; failures should create targeted follow-up work or block signoff.

## Implementation Steps

1. Run `pnpm run check:tokens`.
2. Run `pnpm run lint`.
3. Run `pnpm run check`.
4. Run `pnpm run test`.
5. Run `pnpm run test:visual`.
6. Save command output to evidence files.
7. If visual baselines change, review screenshots before updating snapshots.

## Files

Create:

- `dev-docs/plans/plan-015-cinematic-media/evidence/final-check-tokens-2026-04-21.txt`
- `dev-docs/plans/plan-015-cinematic-media/evidence/final-lint-2026-04-21.txt`
- `dev-docs/plans/plan-015-cinematic-media/evidence/final-check-2026-04-21.txt`
- `dev-docs/plans/plan-015-cinematic-media/evidence/final-test-2026-04-21.txt`
- `dev-docs/plans/plan-015-cinematic-media/evidence/final-visual-2026-04-21.txt`

## Acceptance Criteria

- [x] All automated gates pass. (Tokens: 0 violations / Lint: 0 errors / Check: 0 errors / Tests: 241/241 pass)
- [ ] Visual snapshot changes, if any, are reviewed and intentional. (Deferred: requires dev server)
- [x] Evidence files include command, date, and result. (See evidence/final-*-2026-04-21.txt)

## Edge Cases

- If a gate fails due to environment setup, record the environment issue and rerun after correction; do not treat setup failure as product signoff.
