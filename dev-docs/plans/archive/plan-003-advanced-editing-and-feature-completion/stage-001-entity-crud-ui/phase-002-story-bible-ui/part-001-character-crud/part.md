---
title: Character CRUD
slug: part-001-character-crud
part_number: 1
status: complete
owner: Frontend Agent
phase: phase-002-story-bible-ui
estimated_duration: 1.5d
---

## Objective

Build the Character section of the Story Bible: a list of all characters in the active project, full create/edit/delete for each character, and inline management of `CharacterRelationship` entries on the character detail view.

## Context

- `dev-docs/data-model.md` §Character, §CharacterRelationship
- `src/modules/bible/services/character-repository.ts` (from plan-002) — `getByProject()`, `create()`, `update()`, `delete()`
- `src/modules/bible/stores/bible-store.ts` (from plan-002) — extend with character actions
- `dev-docs/modular-boundaries.md` — all components inside `src/modules/bible/`

## Target Files

| File                                                                    | Action                                      |
| ----------------------------------------------------------------------- | ------------------------------------------- |
| `src/routes/(app)/projects/[id]/bible/characters/+page.svelte`          | Create — character list (≤150 lines)        |
| `src/routes/(app)/projects/[id]/bible/characters/[charId]/+page.svelte` | Create — character detail/edit (≤150 lines) |
| `src/modules/bible/components/CharacterCard.svelte`                     | Create                                      |
| `src/modules/bible/components/CharacterForm.svelte`                     | Create — shared create/edit form            |
| `src/modules/bible/components/RelationshipEditor.svelte`                | Create — inline relationship CRUD           |

## Character Form Fields

| Field    | Type     | Notes                                    |
| -------- | -------- | ---------------------------------------- |
| `name`   | string   | Required                                 |
| `role`   | string   | e.g. protagonist, antagonist, supporting |
| `traits` | string[] | Comma-separated input                    |
| `goals`  | string[] | Comma-separated input                    |
| `flaws`  | string[] | Comma-separated input                    |
| `arcs`   | string[] | Comma-separated input                    |
| `notes`  | string   | Textarea                                 |
| `tags`   | string[] | Tag input                                |

## Relationship Editor

- Lists all `CharacterRelationship` entries for this character
- Add relationship: pick target character (dropdown of project characters), set `type` (text), set `description`
- Delete relationship: remove from list; persist

## Acceptance Criteria

- [ ] Character list shows all characters for `activeProjectId`; empty state when none
- [ ] Create character: form validates `name` required; submits via `CharacterRepository.create()`
- [ ] Edit character: pre-populated form; submits via `CharacterRepository.update()`
- [ ] Delete character: confirmation dialog; calls `CharacterRepository.delete()`; removes from list
- [ ] Relationship editor: add/remove relationships persisted correctly; target character dropdown limited to current project
- [ ] All `+page.svelte` files ≤150 lines
- [ ] `pnpm run check` exits clean

## Out of Scope

- Character relationship graph visualization — Path 4
- Character portrait upload — Path 4
