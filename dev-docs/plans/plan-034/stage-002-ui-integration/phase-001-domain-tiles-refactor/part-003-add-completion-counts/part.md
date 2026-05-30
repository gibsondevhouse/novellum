---
title: Add Completion Counts
slug: part-003-add-completion-counts
part_number: 3
status: draft
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-domain-tiles-refactor
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `src/routes/projects/[id]/world-building/+page.ts` with a `load` function that runs COUNT queries against each worldbuilding canonical table and returns per-domain counts. Render counts on each domain tile in `+page.svelte`.

## Scope

**In scope:**

- Create `+page.ts` load function with `locals.db` COUNT queries for: `characters`, `factions`, `lineages`, `locations`, `lore_entries`, `themes`, `glossary_terms`, `plot_threads`, `timeline_events`
- Group counts by domain and expose as `data.domainCounts`
- Render "N records" count on each tile (zero-state: "No records yet")

**Out of scope:**

- Animated loading state (not needed at this phase)
- Counts driving disabled state (phase-002-part-003)

## Implementation Steps

1. Read `src/routes/projects/[id]/+layout.ts` to understand how `locals.db` and `projectId` are passed.
2. Create `src/routes/projects/[id]/world-building/+page.ts` with an async `load` function.
3. Run parallel COUNT queries: `SELECT COUNT(*) FROM characters WHERE project_id = ?` etc. for all tables.
4. Map query results into a `domainCounts` record keyed by `WorldbuildingDomainId`.
5. In `+page.svelte`, accept `data.domainCounts` and render per-domain count.
6. Run `pnpm check`.
7. Count output screenshot in `evidence/`.

## Files

**Create:**

- `src/routes/projects/[id]/world-building/+page.ts`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte` (accept `data.domainCounts`, render counts)

## Acceptance Criteria

- [ ] `+page.ts` exports a `load` function that returns `domainCounts` for all five domains
- [ ] All five domain tiles display a count (number or zero-state message)
- [ ] COUNT queries run in parallel (Promise.all or equivalent)
- [ ] `pnpm check` passes
- [ ] Screenshot with counts rendered in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
