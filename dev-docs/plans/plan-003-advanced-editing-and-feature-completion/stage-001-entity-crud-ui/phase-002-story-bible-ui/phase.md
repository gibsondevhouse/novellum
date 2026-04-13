---
title: Story Bible UI
slug: phase-002-story-bible-ui
phase_number: 2
status: complete
owner: Frontend Agent
stage: stage-001-entity-crud-ui
parts:
  - part-001-character-crud
  - part-002-location-and-lore-crud
  - part-003-plot-thread-and-timeline-crud
estimated_duration: 4d
---

## Goal

Build the complete Story Bible UI, giving users full create/read/update/delete capability over all world-building entities: Characters (with relationships), Locations, Lore Entries, Plot Threads, and Timeline Events.

## Parts

| #   | Part                                                                          | Status     |
| --- | ----------------------------------------------------------------------------- | ---------- |
| 001 | [Character CRUD](part-001-character-crud/part.md)                             | `complete` |
| 002 | [Location & Lore CRUD](part-002-location-and-lore-crud/part.md)               | `complete` |
| 003 | [Plot Thread & Timeline CRUD](part-003-plot-thread-and-timeline-crud/part.md) | `complete` |

## Entry Criteria

- `activeProjectId` is set (user is inside a project)
- All bible repositories from plan-002 exist: `CharacterRepository`, `LocationRepository`, `LoreRepository`, `PlotThreadRepository`, `TimelineEventRepository`
- Bible module store (`src/modules/bible/stores/bible-store.ts`) exists and exposes reactive entity lists

## Exit Criteria

- `/projects/[id]/bible/characters` — full character list with create/edit/delete; inline relationship management
- `/projects/[id]/bible/locations` — location list with create/edit/delete
- `/projects/[id]/bible/lore` — lore list filterable by category with create/edit/delete
- `/projects/[id]/bible/plot-threads` — plot thread list with status badges; status update in-place
- `/projects/[id]/bible/timeline` — timeline event list sorted by narrative date; create/edit/delete
- All mutations go through the module store → repository chain; no direct Dexie calls from components
