---
title: Add Readiness Copy
slug: part-002-add-readiness-copy
part_number: 2
status: draft
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-003-cta-refactor
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Render a static readiness label on each domain section tile in `+page.svelte`, derived from `WORLDBUILDING_DOMAIN_SEQUENCE` dependency data — not hardcoded inline strings.

## Scope

**In scope:**

- Import `WORLDBUILDING_DOMAIN_SEQUENCE` from `worldbuilding-workflow.ts`
- Derive a `readinessLabel` per domain based on `dependencyIds` (empty → "Recommended first"; else → "Requires [dep label]")
- Render the label visually on each domain section in the page
- Static only: no database queries, no runtime dependency analysis

**Out of scope:**

- `WorldbuildingReadinessBadge` component (stage-002-phase-001-part-002)
- Dynamic readiness based on actual record counts (stage-002)

## Implementation Steps

1. Confirm `WORLDBUILDING_DOMAIN_SEQUENCE` has `dependencyIds` populated (phase-002 part-001).
2. In `+page.svelte`, import `WORLDBUILDING_DOMAIN_SEQUENCE`.
3. Create a helper `getReadinessLabel(domainId)` that maps `dependencyIds` to a human-readable string.
4. Match each section in the `sections` array to its domain config entry by id.
5. Render the readiness label alongside the domain section title.
6. Run `pnpm check`, `pnpm lint`, `pnpm lint:css`.
7. Screenshot in `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte`

## Acceptance Criteria

- [ ] Each of the five domain sections shows a readiness label
- [ ] Labels are derived from `WORLDBUILDING_DOMAIN_SEQUENCE`, not hardcoded
- [ ] Personae shows "Recommended first"; Atlas shows "Requires Personae"; etc.
- [ ] `pnpm check`, `pnpm lint`, `pnpm lint:css` pass
- [ ] Screenshot in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
