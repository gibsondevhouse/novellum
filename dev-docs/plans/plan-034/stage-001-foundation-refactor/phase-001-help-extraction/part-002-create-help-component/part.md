---
title: Create Help Component
slug: part-002-create-help-component
part_number: 2
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-001-help-extraction
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `WorldbuildingHelpPanel.svelte` and `WorldbuildingHelpDrawer.svelte` components that accept `WorldbuildingHelpSection[]` as props and render the extracted domain help content.

## Scope

**In scope:**

- `WorldbuildingHelpPanel.svelte` — inline expandable panel variant for desktop
- `WorldbuildingHelpDrawer.svelte` — sheet/overlay variant for triggered display
- Both components accept `sections: WorldbuildingHelpSection[]` prop from `worldbuilding-help-content.ts`
- Styling must use design tokens only (no hardcoded colors/spacing)

**Out of scope:**

- Wiring open/close button into `+page.svelte` (part-003)
- Any new routes or navigation changes

## Implementation Steps

1. Confirm `part-001-extract-content` is complete and `WORLDBUILDING_HELP_SECTIONS` is exported.
2. Create `src/modules/world-building/help/WorldbuildingHelpPanel.svelte` — renders a list of section blocks (label, purpose, questions, pitfalls, signals, glossary).
3. Create `src/modules/world-building/help/WorldbuildingHelpDrawer.svelte` — wraps content in a dismissible overlay/sheet using the existing `$lib/components/ui` drawer primitives.
4. Use `--space-*`, `--color-*`, `--text-*` tokens throughout; run `pnpm check:tokens`.
5. Run `pnpm lint:css` and `pnpm check`.
6. Screenshot or component snapshot in `evidence/`.

## Files

**Create:**

- `src/modules/world-building/help/WorldbuildingHelpPanel.svelte`
- `src/modules/world-building/help/WorldbuildingHelpDrawer.svelte`

**Update:**

- None

## Acceptance Criteria

- [ ] Both components render all five domain sections from `WORLDBUILDING_HELP_SECTIONS`
- [ ] No hardcoded design values — `pnpm check:tokens` passes
- [ ] `pnpm lint:css` and `pnpm check` pass
- [ ] At least one screenshot or snapshot in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
