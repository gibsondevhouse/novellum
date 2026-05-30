---
title: Define Domain Taxonomy
slug: part-002-define-domain-taxonomy
part_number: 2
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-workflow-config
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Extend `worldbuilding-workflow.ts` with `targetEntities`, `generationReadiness`, and `entryPath` fields per domain. Verify that `worldbuilding-navigation.ts` does not duplicate sequence/dependency information — remove or cross-reference as needed.

## Scope

**In scope:**

- Add `targetEntities: string[]` (canonical table names) to `WorldbuildingDomainConfig`
- Add `generationReadiness: string` (human-readable prerequisite description)
- Add `entryPath: string` (relative path used by `WORLD_BUILDING_LANDING_CONFIG` links)
- Audit `worldbuilding-navigation.ts` for any sequence/order data that can now reference `WORLDBUILDING_DOMAIN_SEQUENCE`

**Out of scope:**

- `promptSeedKey` (part-003)
- Changes to UI components

## Implementation Steps

1. Open `src/modules/world-building/worldbuilding-workflow.ts` and extend `WorldbuildingDomainConfig` with the three new fields.
2. Fill in each domain: Personae → `['characters', 'factions', 'lineages']`; Atlas → `['locations']`; Archive → `['lore_entries', 'themes', 'glossary_terms']`; Threads → `['plot_threads']`; Chronicles → `['timeline_events']`.
3. Read `src/modules/world-building/worldbuilding-navigation.ts` — identify any hardcoded ordering text or sequence logic.
4. Remove or replace identified duplications with a reference to `WORLDBUILDING_DOMAIN_SEQUENCE`.
5. Run `pnpm check`.
6. Save diff to `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/modules/world-building/worldbuilding-workflow.ts` (extend config with new fields)
- `src/modules/world-building/worldbuilding-navigation.ts` (remove duplicated sequence data if present)

## Acceptance Criteria

- [ ] All five domain entries have `targetEntities`, `generationReadiness`, and `entryPath`
- [ ] No duplicate sequence/dependency information in `worldbuilding-navigation.ts`
- [ ] `pnpm check` passes
- [ ] Diff in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
