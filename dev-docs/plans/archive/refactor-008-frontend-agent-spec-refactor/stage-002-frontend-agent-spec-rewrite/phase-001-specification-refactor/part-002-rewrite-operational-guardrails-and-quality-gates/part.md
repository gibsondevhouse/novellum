---
title: Rewrite Operational Guardrails and Quality Gates
slug: part-002-rewrite-operational-guardrails-and-quality-gates
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-specification-refactor
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Refactor the operational sections of `.github/agents/frontend.agent.md` to enforce practical implementation behavior, including Svelte 5 patterns, boundary discipline, accessibility obligations, and non-optional quality gate execution.

## Scope

**In scope:**

- Svelte 5 and architecture guardrails
- Accessibility and interaction quality requirements
- Required command-level quality gates and completion checks
- Failure conditions and self-check protocols

**Out of scope:**

- Strategic product-positioning language
- Non-frontend agent files

## Implementation Steps

1. Rewrite technical guardrails to align with current Novellum architecture and module boundaries.
2. Encode mandatory verification commands (`pnpm run lint`, `pnpm run check`, `pnpm run test`) with explicit completion expectations.
3. Ensure boundaries verification remains explicit and non-optional.
4. Tighten failure-condition and self-check sections into actionable review criteria.

## Files

**Create:**

- `dev-docs/plans/refactor-008-frontend-agent-spec-refactor/stage-002-frontend-agent-spec-rewrite/phase-001-specification-refactor/part-002-rewrite-operational-guardrails-and-quality-gates/evidence/operational-gate-mapping.md`

**Update:**

- `.github/agents/frontend.agent.md`
- `dev-docs/plans/refactor-008-frontend-agent-spec-refactor/stage-002-frontend-agent-spec-rewrite/phase-001-specification-refactor/part-002-rewrite-operational-guardrails-and-quality-gates/impl.log.md`

## Acceptance Criteria

- [ ] Operational directives are explicit, testable, and free of soft language ambiguity
- [ ] Lint, typecheck, and Vitest execution requirements are mandatory and visible
- [ ] Boundaries verification is encoded as a required gate
- [ ] Self-check protocol can be used as reviewer rubric without additional interpretation

## Edge Cases

- Legacy directives that reference outdated patterns
- Operational duplication that hides non-negotiable requirements

## Notes

- Favor concrete commands and pass criteria over generic quality statements.
