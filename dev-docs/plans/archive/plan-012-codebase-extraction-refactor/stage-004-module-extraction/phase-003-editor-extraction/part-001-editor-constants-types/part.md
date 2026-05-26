---
title: Editor Constants & Types
slug: part-001-editor-constants-types
part_number: 1
status: review
owner: Architect
assigned_to: Architect
phase: phase-003-editor-extraction
started_at: 2025-07-17
completed_at: 2025-07-17
estimated_duration: 0.5d
---

## Objective

> Consolidate editor toolbar configurations, Tiptap extension option constants, key binding maps, and formatting option types into `src/modules/editor/constants.ts` and update `src/modules/editor/types.ts`. Update the barrel export (`index.ts`) which currently only exports types — it should also export components and constants.

## Scope

**In scope:**

- Toolbar button configurations (bold, italic, headings, lists, etc.)
- Tiptap extension configurations (currently inline in editor setup)
- Editor mode constants (prose, screenplay, notes)
- Editor-specific type exports beyond what's currently in `types.ts`

**Out of scope:**

- Tiptap extension logic itself
- Scene content management

## Implementation Steps

1. Audit editor components: `grep -rn "const.*=.*{" src/modules/editor/`
2. Create `src/modules/editor/constants.ts` with toolbar configs and extension configs
3. Update `src/modules/editor/types.ts` if any types are inline in components
4. Update `src/modules/editor/index.ts` — add constants and component exports alongside existing type exports

## Files

**Create:**

- `src/modules/editor/constants.ts`

**Update:**

- `src/modules/editor/types.ts` (if needed)
- `src/modules/editor/index.ts` — expand barrel exports
- Editor components importing inline configs

## Acceptance Criteria

- [ ] `src/modules/editor/constants.ts` exists with all config objects
- [ ] `src/modules/editor/index.ts` exports constants, types, and components
- [ ] Zero inline configuration objects in editor `.svelte` files
- [ ] `pnpm check` — 0 errors
- [ ] `pnpm run lint` — 0 boundary violations
