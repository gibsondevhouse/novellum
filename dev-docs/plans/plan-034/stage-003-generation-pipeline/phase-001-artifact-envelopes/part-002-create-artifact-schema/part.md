---
title: Create Artifact Schema
slug: part-002-create-artifact-schema
part_number: 2
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-artifact-envelopes
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Add per-domain Zod schemas to `worldbuild-schemas.ts` and corresponding typed payload interfaces to `worldbuild-agent.ts`, one per worldbuilding domain.

## Scope

**In scope:**

- Five new Zod schemas in `worldbuild-schemas.ts`: `worldbuildDomainPersonaeSchema`, `worldbuildDomainAtlasSchema`, `worldbuildDomainArchiveSchema`, `worldbuildDomainThreadsSchema`, `worldbuildDomainChroniclesSchema`
- Export corresponding TypeScript types and a `WORLDBUILD_DOMAIN_SCHEMA_BY_OUTPUT_FORMAT` map
- Add typed payload interfaces to `worldbuild-agent.ts` matching schema shapes
- Schemas must be `.strict()` (no `.passthrough()`) — hardened in stage-004 but start strict here

**Out of scope:**

- Checkpoint storage (part-003)
- Review card UI (phase-002)

## Implementation Steps

1. Open `src/lib/ai/pipeline/worldbuild-schemas.ts`; review existing schema patterns.
2. Add five domain schemas. Each schema should include the key entity fields from the domain taxonomy:
   - Personae: `individuals[]`, `factions[]`, `lineages[]`, `relationships[]`
   - Atlas: `realms[]`, `landmarks[]`, `travelConstraints[]`
   - Archive: `myths[]`, `traditions[]`, `technologies[]`
   - Threads: `majorArcs[]`, `subplots[]`, `motivations[]`
   - Chronicles: `eras[]`, `keyEvents[]`, `personalHistories[]`
3. Export types and schema map.
4. In `worldbuild-agent.ts`, add domain payload interfaces and extend `WorldbuildPayloadByTaskKey`.
5. Run `pnpm check`.
6. Save schema definitions as a code snapshot in `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/lib/ai/pipeline/worldbuild-schemas.ts`
- `src/lib/ai/pipeline/worldbuild-agent.ts`

## Acceptance Criteria

- [ ] Five domain schemas exported with correct field shapes
- [ ] `WORLDBUILD_DOMAIN_SCHEMA_BY_OUTPUT_FORMAT` map includes all five keys
- [ ] Schemas are `.strict()` (no `.passthrough()`)
- [ ] `pnpm check` passes
- [ ] Schema code snapshot in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
