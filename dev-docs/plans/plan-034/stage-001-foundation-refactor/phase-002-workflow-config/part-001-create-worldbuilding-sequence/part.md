---
title: Create Worldbuilding Sequence
slug: part-001-create-worldbuilding-sequence
part_number: 1
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-workflow-config
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `src/modules/world-building/worldbuilding-workflow.ts` as the single source of truth for worldbuilding generation order. Define `WorldbuildingDomainId`, `WorldbuildingDomainConfig`, and the `WORLDBUILDING_DOMAIN_SEQUENCE` constant with id, label, sequenceNumber, and dependencyIds.

## Scope

**In scope:**

- `WorldbuildingDomainId` union type (`'personae' | 'atlas' | 'archive' | 'threads' | 'chronicles'`)
- `WorldbuildingDomainConfig` interface with at minimum `id`, `label`, `sequenceNumber`, `dependencyIds`
- `WORLDBUILDING_DOMAIN_SEQUENCE` as a typed readonly array of all five domains in order
- File must have zero Svelte/DOM imports (pure TypeScript, testable in isolation)

**Out of scope:**

- `targetEntities`, `generationReadiness`, `promptSeedKey` fields (part-002)
- Any UI wiring or component updates

## Implementation Steps

1. Create `src/modules/world-building/worldbuilding-workflow.ts`.
2. Define `WorldbuildingDomainId` as a string union.
3. Define `WorldbuildingDomainConfig` interface.
4. Define `WORLDBUILDING_DOMAIN_SEQUENCE` covering: Personae (no deps), Atlas (dep: personae), Archive (dep: atlas), Threads (deps: personae, atlas), Chronicles (deps: personae, atlas, archive, threads).
5. Run `pnpm check`.
6. Save `tsc --noEmit` output to `evidence/`.

## Files

**Create:**

- `src/modules/world-building/worldbuilding-workflow.ts`

**Update:**

- None

## Acceptance Criteria

- [ ] `WORLDBUILDING_DOMAIN_SEQUENCE` exported with all five domains and correct dependency arrays
- [ ] Zero Svelte or DOM imports in the file
- [ ] `pnpm check` passes with zero errors
- [ ] `evidence/` contains tsc output

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
