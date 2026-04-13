---
title: Chapter/Scene Management
slug: part-001-chapter-scene-management
part_number: 1
status: complete
owner: Frontend Agent
phase: phase-003-outliner-ui
estimated_duration: 1.5d
---

## Objective

Build the Outliner's primary view: a hierarchical, collapsible list of chapters and scenes for the active project. Users can create, rename, delete, and reorder chapters and scenes via drag-and-drop.

## Context

- `dev-docs/data-model.md` §Chapter, §Scene
- `src/modules/outliner/services/chapter-repository.ts`, `scene-repository.ts` (plan-002)
- `src/modules/outliner/stores/outliner-store.ts` (plan-002) — extend with CRUD actions
- Drag-and-drop library: use the native HTML5 Drag and Drop API or `@neodrag/svelte` (evaluate and install if needed)

## Target Files

| File                                                    | Action                             |
| ------------------------------------------------------- | ---------------------------------- |
| `src/routes/(app)/projects/[id]/outline/+page.svelte`   | Create (≤150 lines)                |
| `src/modules/outliner/components/ChapterRow.svelte`     | Create — collapsible chapter item  |
| `src/modules/outliner/components/SceneRow.svelte`       | Create — scene item inside chapter |
| `src/modules/outliner/components/AddChapterForm.svelte` | Create — inline add form           |
| `src/modules/outliner/components/AddSceneForm.svelte`   | Create — inline add form           |

## Scene Card Display Fields

- `title`
- `summary` (first 80 chars, truncated)
- `povCharacterId` → resolved to character name
- `wordCount`

## Reordering Behaviour

- Drag chapter rows to reorder chapters; drop calls `ChapterRepository.reorder(projectId, newOrderedIds)`
- Drag scene rows within a chapter to reorder scenes; drop calls `SceneRepository.reorder(chapterId, newOrderedIds)`
- Moving scenes between chapters is deferred (→ Path 4)

## Acceptance Criteria

- [ ] All chapters for active project render in `order` sequence; each is collapsible
- [ ] Scenes for each chapter render in `order` sequence inside their chapter
- [ ] Create chapter: inline form; `title` required; new chapter appended at bottom with `order = max + 1`
- [ ] Create scene: inline form inside chapter; `title` required; appended at bottom of chapter
- [ ] Rename: double-click or edit icon; inline edit; saves on blur/enter
- [ ] Delete chapter: confirmation dialog; deletes chapter and all its scenes
- [ ] Delete scene: confirmation dialog; deletes scene only
- [ ] Drag reorder persisted: `order` values updated in Dexie after drop
- [ ] `pnpm run check` exits clean; `pnpm run lint` exits clean

## Out of Scope

- Moving scenes between chapters — Path 4
- Beat tracking (→ part-002)
- Scene text editing (→ stage-005)
