# Module: `story-bible`

> Last verified: 2026-06-25
> Source: [src/modules/story-bible/](../../src/modules/story-bible/)

## Status

Active interactive Story Bible workspace, restored under
`plan-054-story-bible-workspace`.

The module now owns the project-local wiki surface at
`/projects/[id]/story-bible`. It lets authors browse, create, edit, delete, and
cross-reference canonical dossier records without auto-applying AI-generated
changes.

## Responsibilities

- `StoryBibleWorkspacePage.svelte` composes the dossier category navigation,
  list panel, editor forms, and resolved detail preview for a project.
- `CharacterForm.svelte`, `LocationForm.svelte`, `FactionForm.svelte`,
  `GlossaryTermForm.svelte`, `ThemeForm.svelte`, and `LoreEntryForm.svelte`
  collect manual dossier edits and keep saves review-explicit.
- `story-bible-crud.ts` wraps the existing `/api/db/*` repository endpoints for
  client-side Story Bible create, update, delete, and project-scoped reads.
- `story-bible-repository.ts` provides SQLite-backed read queries for Story
  Bible snapshots, project summaries, relationship lookup, tag/category filters,
  and pagination.
- `dossier-link-resolver.ts` parses inline markers such as `@character:id` and
  `#location:id`; `BiographyPanel.svelte` renders resolved markers as workspace
  navigation links while leaving unresolved markers as static text.

## Data Surface

The workspace reads and writes existing worldbuilding tables through the public
database API routes:

- `characters`
- `locations`
- `factions`
- `glossary_terms`
- `themes`
- `lore_entries`
- read-only relationship and timeline context through the repository service

The module does not own generation, proposal review, or scene drafting. Those
remain in `world-building`, `vibe-author`, and governed AI controller modules.

## Testing

- Unit coverage lives in `tests/story-bible/` for CRUD endpoint wiring,
  repository query behavior, form validation, and dossier link resolution.
- E2E coverage lives in `tests/e2e/wiki-workspace.spec.ts` for workspace
  creation and cross-dossier link navigation.
- Stage 004 quality closure evidence is stored under
  `dev-docs/plans/plan-054-story-bible-workspace/stage-004-quality-closure/`.

## Boundaries

- Keep browser-facing workspace code inside `src/modules/story-bible/`.
- Use repository/API helpers for persistence; do not import server database
  modules into Svelte components.
- Preserve explicit user action for manuscript or canon mutations. Story Bible
  forms save only when the author submits them, and linked references navigate
  rather than auto-editing records.
