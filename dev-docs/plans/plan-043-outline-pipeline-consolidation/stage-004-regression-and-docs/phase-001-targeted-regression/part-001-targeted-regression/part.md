---
title: Targeted Regression
slug: part-001-targeted-regression
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-targeted-regression
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Verify checkpoint generation, review, reject, accept, and conflict behavior after legacy retirement.

## Scope

**In scope:**

- Run targeted Vitest and Playwright specs for outline generation.
- Capture command outputs as evidence.
- Fix regressions found by targeted tests.

**Out of scope:**

- Full visual regression unless a UI snapshot is intentionally changed.
- New feature tests outside outline flow.

## Implementation Steps

1. Run outline-related unit/component tests.
2. Run `pnpm exec playwright test --project=chromium tests/e2e/outline-generation-review.spec.ts`.
3. Run standard static gates needed by the plan.
4. Save summarized command outputs under evidence.

## Files

**Create:**

- `evidence/targeted-regression-evidence-2026-06-09.md`

**Update:**

- `tests/e2e/outline-generation-review.spec.ts`
- `tests/nova/nova-artifact-cards.test.ts`

**Reference:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `src/lib/server/outline/outline-materialization-service.ts`
- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Targeted outline e2e passes.
- [ ] Static gates pass or blockers are documented with exact output.
- [ ] Any test changes assert current canonical behavior.

## Edge Cases

- Playwright command form matters because package script prepends `tests/e2e/`.
- Existing browser cache/server state can make stale UI appear.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
