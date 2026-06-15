---
title: Replace Nova Prompt Seeding With Generation Action Service
slug: part-001-replace-nova-prompt-seeding-with-generation-action-service
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-001-generation-action-contract
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Move domain Generate buttons from open-Nova-only behavior to a service that performs readiness checks and calls the generation route.

## Scope

**In scope:**

- Use canGenerateDomain and evaluateReadiness before execution.
- Call /api/worldbuilding/generate or controller-native equivalent for the selected domain.
- Keep Nova prompt as secondary explain/help affordance only when generation cannot run.

**Out of scope:**

- Making generation auto-accept canon records.

## Implementation Steps

1. Inspect current generation route contract and domain kind mapping.
2. Add a generation action service with typed results.
3. Replace openNovaForDomain as the primary Generate behavior.
4. Preserve a clear Ask Nova/help path separately.

## Files

**Create:**

- `src/modules/world-building/services/worldbuilding-generation-actions.ts`
- `tests/world-building/worldbuilding-generation-actions.test.ts`

**Update:**

- `src/modules/world-building/worldbuilding-generate-actions.ts`
- `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts`

**Reference:**

- `src/routes/api/worldbuilding/generate/+server.ts`
- `src/modules/world-building/worldbuilding-readiness.ts`
- `src/lib/ai/validators/worldbuilding-draft-validator.ts`

## Acceptance Criteria

- [ ] Generate invokes a real generation path when readiness allows.
- [ ] Missing context transitions to missing-context and shows the reason.
- [ ] Successful generation transitions to review-ready and provides proposal/draft visibility.
- [ ] Nova prompt opening is no longer mistaken for execution.

## Edge Cases

- Provider credentials may be missing.
- Generation can return invalid drafts.
- Domain IDs and entity kinds may not be one-to-one.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
