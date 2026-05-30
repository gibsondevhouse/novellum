---
title: Help Extraction
slug: phase-001-help-extraction
phase_number: 1
status: complete
owner: Architect Agent
stage: stage-001-foundation-refactor
parts:
  - part-001-extract-content
  - part-002-create-help-component
  - part-003-wire-help-drawer
estimated_duration: 1d
---

## Goal

Move all orientation copy, pitfalls, glossary terms, completion signals, and guide content out of `src/routes/projects/[id]/world-building/+page.svelte` into a dedicated help module under `src/modules/world-building/help/`.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Extract Content](part-001-extract-content/part.md) | `draft` | — | 0.25d |
| 002 | [Create Help Component](part-002-create-help-component/part.md) | `draft` | — | 0.5d |
| 003 | [Wire Help Drawer](part-003-wire-help-drawer/part.md) | `draft` | — | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] `+page.svelte` no longer contains hardcoded guide copy, glossary terms, or pitfall text
- [ ] `WorldbuildingHelpPanel.svelte` and `WorldbuildingHelpDrawer.svelte` render all extracted content
- [ ] `worldbuilding-help-content.ts` exports typed content constants (no inline JSX strings)
- [ ] Help drawer opens from the page without breaking existing navigation
- [ ] `pnpm check` and `pnpm lint` pass

## Notes

Target file structure:

```text
src/modules/world-building/help/
  worldbuilding-help-content.ts
  WorldbuildingHelpPanel.svelte
  WorldbuildingHelpDrawer.svelte
```

Source to extract from: `src/routes/projects/[id]/world-building/+page.svelte` — the `sections` `$derived` array containing all five domain objects.

Module barrel update required: export new components from `src/modules/world-building/index.ts`.

No data model changes. No AI behavior changes. This is pure extraction and componentization.
