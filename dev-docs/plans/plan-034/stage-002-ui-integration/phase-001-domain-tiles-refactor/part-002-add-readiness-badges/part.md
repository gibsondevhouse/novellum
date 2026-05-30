---
title: Add Readiness Badges
slug: part-002-add-readiness-badges
part_number: 2
status: draft
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-domain-tiles-refactor
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `WorldbuildingReadinessBadge.svelte` and render it on each domain tile, with label and visual variant derived from `WORLDBUILDING_DOMAIN_SEQUENCE` dependency data.

## Scope

**In scope:**

- `WorldbuildingReadinessBadge.svelte`: accepts `label: string` and `variant: 'first' | 'dependent' | 'ready'` props
- Render one badge per domain tile — driven by the domain's `dependencyIds` from `WORLDBUILDING_DOMAIN_SEQUENCE`
- Badge styling via design tokens only
- Static rendering (no DB queries at this part)

**Out of scope:**

- Dynamic readiness based on actual record presence (phase-002-part-003)
- Completion counts (part-003)

## Implementation Steps

1. Confirm part-001-add-action-trio is complete.
2. Create `src/modules/world-building/components/WorldbuildingReadinessBadge.svelte` with `label` and `variant` props.
3. Add `variant` styles using `--color-*` tokens: `first` → accent; `dependent` → neutral; `ready` → success.
4. In `+page.svelte`, import the badge and derive `variant` per section: `dependencyIds.length === 0 → 'first'`; else `'dependent'`.
5. Run `pnpm check`, `pnpm lint:css`, `pnpm check:tokens`.
6. Screenshot in `evidence/`.

## Files

**Create:**

- `src/modules/world-building/components/WorldbuildingReadinessBadge.svelte`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte`

## Acceptance Criteria

- [ ] `WorldbuildingReadinessBadge` renders with all three variant states
- [ ] Personae tile shows `first` variant; Atlas/Archive/Threads/Chronicles show `dependent`
- [ ] No hardcoded colors (`pnpm check:tokens` passes)
- [ ] `pnpm check` and `pnpm lint:css` pass
- [ ] Screenshot in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
