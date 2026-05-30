---
title: Add Section Readiness Checks
slug: part-003-add-section-readiness-checks
part_number: 3
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-generate-buttons
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `src/modules/world-building/worldbuilding-readiness.ts` with a `checkDomainReadiness()` function that verifies a domain's upstream dependencies are populated. Update `+page.ts` to pass readiness data into the page, and update `canGenerateDomain()` to consult it.

## Scope

**In scope:**

- `WorldbuildingReadinessResult` type: `{ allowed: boolean; state: 'idle' | 'missing-context'; missingDeps: string[] }`
- `checkDomainReadiness(domainId, domainCounts)` checks: (1) upstream dependency domains have at least one record, (2) returns specific missing dep labels
- Update `canGenerateDomain` in `worldbuilding-generate-actions.ts` to call `checkDomainReadiness`
- Update `+page.ts` to expose `domainCounts` for all domains (already from part-003)

**Out of scope:**

- Premise/outline presence check (deferred to stage-003 missing-context state)
- The full 8-state state machine (stage-003-phase-003)

## Implementation Steps

1. Create `src/modules/world-building/worldbuilding-readiness.ts`.
2. Import `WORLDBUILDING_DOMAIN_SEQUENCE` to resolve dependency chain.
3. Implement `checkDomainReadiness(domainId: WorldbuildingDomainId, domainCounts: Record<WorldbuildingDomainId, number>): WorldbuildingReadinessResult`.
4. Update `worldbuilding-generate-actions.ts`: call `checkDomainReadiness` inside `canGenerateDomain`; propagate `missingDeps` into the `reason` string.
5. Ensure `+page.ts` passes `domainCounts` keyed by `WorldbuildingDomainId` (adjust if needed from part-003 implementation).
6. Run `pnpm check` and `pnpm lint`.
7. Screenshot of a downstream domain (e.g. Atlas) disabled with correct reason in `evidence/`.

## Files

**Create:**

- `src/modules/world-building/worldbuilding-readiness.ts`

**Update:**

- `src/modules/world-building/worldbuilding-generate-actions.ts` (consult `checkDomainReadiness`)
- `src/routes/projects/[id]/world-building/+page.ts` (ensure domainCounts keyed by domain id)

## Acceptance Criteria

- [ ] `checkDomainReadiness` returns correct `missingDeps` for Atlas when Personae count is 0
- [ ] Generate button for Atlas is disabled with reason "Requires Personae" when Personae has no records
- [ ] Personae Generate button is always enabled (no dependencies)
- [ ] `pnpm check` and `pnpm lint` pass
- [ ] Screenshot in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
