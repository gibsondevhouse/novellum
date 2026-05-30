---
title: Add Action Trio
slug: part-001-add-action-trio
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-domain-tiles-refactor
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Add an open/help/generate three-button action row to each of the five domain section tiles in `src/routes/projects/[id]/world-building/+page.svelte`. Extract the tile structure into a reusable `WorldbuildingDomainTile.svelte` component if the repeated pattern justifies it.

## Scope

**In scope:**

- Three actions per tile: **Open** (navigates to domain `entryHref`), **Help** (opens `WorldbuildingHelpDrawer` scoped to that domain), **Generate** (placeholder — wired in phase-002)
- Actions use token-driven styles; no hardcoded colors
- Keyboard-navigable with correct ARIA labels
- If the 5-tile pattern warrants a component, extract it to `WorldbuildingDomainTile.svelte`

**Out of scope:**

- Readiness badges (part-002)
- Completion counts (part-003)
- Actually wiring the Generate action to Nova (phase-002)

## Implementation Steps

1. Confirm stage-001 is complete (help drawer, workflow config, CTA rename all done).
2. In `+page.svelte`, add an `actions` row to each section iteration containing Open, Help, and Generate buttons.
3. Open button: uses existing `section.entryHref` or `WORLDBUILDING_DOMAIN_SEQUENCE` `entryPath`.
4. Help button: calls `openHelp(section.id)` — set the active domain and open `WorldbuildingHelpDrawer`.
5. Generate button: renders disabled with `data-domain={section.id}` — placeholder for phase-002 wiring.
6. If 5 repetitions justify it, create `WorldbuildingDomainTile.svelte` and refactor.
7. Run `pnpm check`, `pnpm lint`, `pnpm lint:css`.
8. Screenshot in `evidence/`.

## Files

**Create:**

- `src/modules/world-building/components/WorldbuildingDomainTile.svelte` (if tile pattern is extracted)

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte`

## Acceptance Criteria

- [ ] All five domain tiles have Open, Help, and Generate actions visible
- [ ] All actions are keyboard-navigable with ARIA labels
- [ ] No hardcoded design values (`pnpm check:tokens` passes)
- [ ] `pnpm check`, `pnpm lint`, `pnpm lint:css` pass
- [ ] Screenshot in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
