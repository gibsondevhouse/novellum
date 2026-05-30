---
title: Wire Help Drawer
slug: part-003-wire-help-drawer
part_number: 3
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-001-help-extraction
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Wire `WorldbuildingHelpDrawer` into `src/routes/projects/[id]/world-building/+page.svelte` as the sole surface for domain guide content, replacing the existing inline `showManifesto` toggle pattern. Export the new help components from `src/modules/world-building/index.ts`.

## Scope

**In scope:**

- Import and mount `WorldbuildingHelpDrawer` in `+page.svelte`
- Replace `showManifesto` state and inline guide rendering with the drawer's open/close binding
- Export `WorldbuildingHelpPanel` and `WorldbuildingHelpDrawer` from the module barrel

**Out of scope:**

- Changes to any domain sub-routes or other worldbuilding pages
- Renaming the CTA button (that belongs to phase-003-cta-refactor)

## Implementation Steps

1. Confirm parts 001 and 002 of this phase are complete.
2. In `+page.svelte`, replace `showManifesto` state and inline guide content blocks with `<WorldbuildingHelpDrawer bind:open={showHelp} {sections} />`.
3. Rename `showManifesto` state variable to `showHelp` for clarity.
4. Add `WorldbuildingHelpPanel` and `WorldbuildingHelpDrawer` exports to `src/modules/world-building/index.ts`.
5. Run `pnpm check` and `pnpm lint`.
6. Capture `+page.svelte` diff in `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte` (mount drawer, remove inline guide)
- `src/modules/world-building/index.ts` (export new help components)

## Acceptance Criteria

- [ ] No inline guide/manifesto copy remains in `+page.svelte`
- [ ] `WorldbuildingHelpDrawer` opens and closes correctly via button
- [ ] `WorldbuildingHelpPanel` and `WorldbuildingHelpDrawer` are exported from module barrel
- [ ] `pnpm check` and `pnpm lint` pass
- [ ] `+page.svelte` diff in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
