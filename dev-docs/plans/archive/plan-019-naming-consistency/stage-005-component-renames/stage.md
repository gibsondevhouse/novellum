---
title: Component Renames
slug: stage-005-component-renames
stage_number: 5
status: draft
owner: Stylist Agent
plan: plan-019-naming-consistency
phases:
  - phase-001-rename-svelte-components
  - phase-002-rename-supporting-ts-files
estimated_duration: 1d
risk_level: low
---

## Goal

Rename Svelte components and supporting `.ts` files inside each
module so that file names map cleanly to the screen, panel, or
piece of UI they render. Particular attention to the editor
module where `DocumentEditorFrame` and `ManuscriptSurface`
currently coexist with no clear hint as to which renders the
multi-pane writing surface vs the focused single-scene editor.

## Phases

| #   | Phase                                                                                                | Status  | Est. Duration |
| --- | ---------------------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Rename Svelte components](phase-001-rename-svelte-components/phase.md)                              | `draft` | 0.5d          |
| 002 | [Rename supporting TS files](phase-002-rename-supporting-ts-files/phase.md)                          | `draft` | 0.5d          |

## Entry Criteria

- Stage 004 complete; module folders + import aliases canonical.

## Exit Criteria

- Every component file inside a renamed module has a name that
  matches the section/screen it renders, per the name map.
- Module `index.ts` barrel files re-export under the new names.
- `pnpm run lint`, `pnpm run check`, `pnpm run test` all pass.

## Notes

- Use `git mv` and verify with `git log --follow` that history
  is preserved per renamed file.
- Keep `default export` style consistent with the rest of the
  module — don't change export shapes during the rename.
