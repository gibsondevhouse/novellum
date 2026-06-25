---
title: CRUD Forms for Lore Dossiers
slug: part-001-story-bible-crud-forms
part_number: 1
status: complete
owner: Planner Agent
assigned_to: —
phase: phase-001-crud-forms-ui
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: undefined
---

## Objective

Build responsive forms allowing users to manually create, read, update, and delete all lore dossier categories.

## Scope

**In scope:**

- Create CharacterForm, LocationForm, FactionForm, GlossaryTermForm, ThemeForm, and LoreEntryForm in Svelte 5.
- Wire CRUD buttons to local repository APIs.

**Out of scope:**

- Auto-generating text fields (AI generation is out of scope here).

## Implementation Steps

1. Build CRUD components under src/modules/story-bible/components/.
2. Mount views in StoryBibleWorkspacePage.svelte.
3. Test data saves and validation constraints.

## Files

**Create:**

- `src/modules/story-bible/components/CharacterForm.svelte`
- `src/modules/story-bible/components/LocationForm.svelte`
- `src/modules/story-bible/components/FactionForm.svelte`
- `src/modules/story-bible/components/GlossaryTermForm.svelte`
- `src/modules/story-bible/components/ThemeForm.svelte`
- `src/modules/story-bible/components/LoreEntryForm.svelte`
- `src/modules/story-bible/components/StoryBibleWorkspacePage.svelte`
- `src/modules/story-bible/services/story-bible-crud.ts`
- `tests/story-bible/story-bible-crud.test.ts`
- `tests/story-bible/story-bible-forms.svelte.test.ts`

**Update:**

- `src/modules/story-bible/components/StoryBiblePlaceholder.svelte`
- `src/modules/story-bible/index.ts`
- `src/routes/projects/[id]/story-bible/+page.svelte`
- `src/routes/projects/[id]/story-bible/+page.ts`

## Acceptance Criteria

- [x] Form save updates database tables atomically.
- [x] Validation flags missing name/title inputs before sending API requests.

## Edge Cases

- Empty strings saved: ensure optional fields default to empty values without raising SQL constraints.

## Notes

> Part-level context for CRUD Forms for Lore Dossiers.
