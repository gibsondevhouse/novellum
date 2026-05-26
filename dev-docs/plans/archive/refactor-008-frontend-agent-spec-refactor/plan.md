---
title: Frontend Agent Specification Refactor
slug: refactor-008-frontend-agent-spec-refactor
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-14
last_updated: 2026-04-14
target_completion: 2026-04-18
stages:
  - stage-001-tri-plan-synthesis
  - stage-002-frontend-agent-spec-rewrite
  - stage-003-validation-and-rollout
dependencies:
  - refactor-006-frontend-production-readiness
  - refactor-007-ui-surface-consistency
  - linearization-overhaul
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - agent_behavior_qa
  - docs_sync
---

## Objective

Refactor `.github/agents/frontend.agent.md` into a single authoritative frontend execution contract that merges production-hardening constraints from refactor-006, surface-consistency requirements from refactor-007, and systems-level UI discipline from linearization-overhaul.

## Scope

**In scope:**

- Cross-plan directive extraction and conflict resolution
- Structural rewrite of `.github/agents/frontend.agent.md`
- Consolidated quality-gate and self-check protocol for frontend tasks
- Scenario-based validation of agent behavior after refactor
- Documentation sync for plan tracking and sign-off readiness

**Out of scope:**

- Runtime feature implementation on product routes
- Backend/API refactors or SQLite schema work
- New design system token creation
- Reopening completed refactor-006 or refactor-007 implementation parts

## Stages

|#|Stage|Status|Est. Duration|
|---|---|---|---|
|001|[Tri-Plan Synthesis](stage-001-tri-plan-synthesis/stage.md)|`draft`|1d|
|002|[Frontend Agent Spec Rewrite](stage-002-frontend-agent-spec-rewrite/stage.md)|`draft`|2d|
|003|[Validation and Rollout](stage-003-validation-and-rollout/stage.md)|`draft`|1d|

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** - `pnpm run lint` exits 0
- [ ] **typecheck** - `pnpm run check` exits 0
- [ ] **tests** - `pnpm run test` exits 0
- [ ] **boundaries** - `eslint-plugin-boundaries` reports zero violations
- [ ] **agent_behavior_qa** - scenario prompts show expected frontend-agent behavior without policy regressions
- [ ] **docs_sync** - updated agent contract and plan artifacts are internally consistent

## Risks & Mitigations

|Risk|Likelihood|Mitigation|
|---|---|---|
|Over-constraining the frontend agent into low autonomy|medium|Separate non-negotiables from guidance; keep execution mindset pragmatic|
|Contradictory directives between the three source plans|medium|Resolve through explicit priority ordering in Stage 001 matrix|
|Quality gates become aspirational instead of enforceable|medium|Encode concrete commands and failure conditions in rewritten spec|
|Drift between agent contract and actual frontend architecture|low|Validate against current module boundaries and Svelte 5 conventions during Stage 003|

## Notes

- The rewritten frontend agent must preserve Svelte 5 runes requirements and route-surface cohesion rules.
- This refactor must encode mandatory lint/typecheck/test execution expectations and boundaries verification.
- Reviewer sign-off is required before moving this plan to `complete`.
