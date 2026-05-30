---
title: Handle Missing Context
slug: part-002-handle-missing-context
part_number: 2
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-003-error-handling
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Integrate `checkDomainReadiness()` with the generation state machine so that domains with unmet upstream requirements automatically transition to `missing-context` state with a specific reason string, rather than silently blocking or enabling the wrong state.

## Scope

**In scope:**

- Add a `evaluateReadiness(domainId, domainCounts)` function that calls `checkDomainReadiness` and invokes `transition(domainId, 'missing-context')` when `allowed: false`
- `WorldbuildingReadinessResult.missingDeps` becomes the human-readable reason attached to state
- Add `getMissingContextReason(domainId): string | null` getter to the state store
- Call `evaluateReadiness` on page load (from `+page.svelte` effect)

**Out of scope:**

- Premise/outline API-level checks (future hardening)
- UI status component (part-003)

## Implementation Steps

1. Open `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts`.
2. Add a `missingContextReasons: Record<WorldbuildingDomainId, string | null>` `$state` map.
3. Implement `evaluateReadiness(domainId, domainCounts)` importing `checkDomainReadiness` from `worldbuilding-readiness.ts`.
4. Export `getMissingContextReason(domainId)`.
5. In `+page.svelte`, add a `$effect` that calls `evaluateReadiness` for all five domains whenever `data.domainCounts` changes.
6. Run `pnpm check`.
7. Save a screenshot of a domain showing `missing-context` reason in `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts`
- `src/routes/projects/[id]/world-building/+page.svelte` (add `$effect` for readiness evaluation)

## Acceptance Criteria

- [ ] Atlas transitions to `missing-context` when Personae count is 0
- [ ] `getMissingContextReason('atlas')` returns "Requires Personae" in that case
- [ ] `evaluateReadiness` called on page load
- [ ] `pnpm check` passes
- [ ] Screenshot in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
