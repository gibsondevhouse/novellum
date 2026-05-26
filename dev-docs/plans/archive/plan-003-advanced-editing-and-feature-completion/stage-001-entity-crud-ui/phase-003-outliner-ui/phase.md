---
title: Outliner UI
slug: phase-003-outliner-ui
phase_number: 3
status: complete
owner: Frontend Agent
stage: stage-001-entity-crud-ui
parts:
  - part-001-chapter-scene-management
  - part-002-beat-tracking
estimated_duration: 2d
---

## Goal

Build the Outliner UI: a hierarchical view of the novel's structure (Chapters → Scenes → Beats) with inline create/edit/delete for each level and drag-and-drop reordering for chapters and scenes.

## Parts

| #   | Part                                                                  | Status     |
| --- | --------------------------------------------------------------------- | ---------- |
| 001 | [Chapter/Scene Management](part-001-chapter-scene-management/part.md) | `complete` |
| 002 | [Beat Tracking](part-002-beat-tracking/part.md)                       | `complete` |

## Entry Criteria

- `ChapterRepository` and `SceneRepository` from plan-002 exist and tested
- Outliner module store (`src/modules/outliner/stores/outliner-store.ts`) exists
- `activeProjectId` available

## Exit Criteria

- `/projects/[id]/outline` renders a collapsible chapter list in `order` sequence
- Chapters can be created, renamed, reordered (drag-and-drop), and deleted
- Each chapter expands to show its scenes; scenes can be created, edited, reordered, and deleted
- Scene cards show: title, summary snippet, POV character (if set), word count
- Beat list is accessible per scene (navigates to scene detail view or expands inline per design system)
- Order changes are persisted immediately via repository `reorder()` method
