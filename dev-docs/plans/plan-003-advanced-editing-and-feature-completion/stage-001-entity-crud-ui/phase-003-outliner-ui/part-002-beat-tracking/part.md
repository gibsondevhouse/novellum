---
title: Beat Tracking
slug: part-002-beat-tracking
part_number: 2
status: complete
owner: Frontend Agent
phase: phase-003-outliner-ui
estimated_duration: 0.5d
---

## Objective

Add beat tracking to the Outliner: each scene can have an ordered list of `Beat` entries (short narrative beat summaries). Beats are displayed and managed within the scene detail view or as an expandable inline panel in the outliner.

## Context

- `dev-docs/data-model.md` §Beat — `{ id, sceneId, projectId, text, order, createdAt, updatedAt }`
- `src/modules/outliner/services/beat-repository.ts` (plan-002)
- `src/modules/outliner/stores/outliner-store.ts` — extend with beat actions

## Target Files

| File                                              | Action                                          |
| ------------------------------------------------- | ----------------------------------------------- |
| `src/modules/outliner/components/BeatList.svelte` | Create — expandable beat panel inside scene row |
| `src/modules/outliner/components/BeatItem.svelte` | Create — single beat with inline edit           |

## Acceptance Criteria

- [ ] Each scene row has an expand toggle showing its beats in `order` sequence
- [ ] Add beat: inline text input appended at end; `text` required
- [ ] Edit beat: click to edit inline; save on blur/enter
- [ ] Delete beat: icon button with confirm; beat removed from list
- [ ] Beats reorderable via drag-and-drop within a scene (reuse drag approach from part-001)
- [ ] `pnpm run check` exits clean

## Out of Scope

- Beat tagging / type classification — Path 4
