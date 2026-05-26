---
title: Arc Entity
slug: phase-001-arc-entity
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-001-data-and-state-foundation
parts:
  - part-001-arc-type-schema-and-repository
estimated_duration: 0.5d
---

## Goal

> Create the Arc as a first-class database entity with its type definition, Dexie schema migration, CRUD repository, service layer functions, and baseline tests.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Arc Type, Schema & Repository](part-001-arc-type-schema-and-repository/part.md) | `draft` | backend | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] `Arc` interface exists in `src/lib/db/types.ts` with fields: id, projectId, title, description, purpose, order, createdAt, updatedAt
- [ ] Dexie schema version bumped to v8 with `arcs: 'id, projectId, order'`
- [ ] Arc repository (`src/modules/outliner/services/arc-repository.ts`) provides: createArc, getArcById, getArcsByProjectId, updateArc, removeArc, reorderArcs
- [ ] Hub metrics service updated to return real arc count with `ready: true`
- [ ] Tests cover arc CRUD operations

## Notes

> The Arc entity is deliberately minimal. Fields like `emotionalArc`, `arcType`, or `relatedCharacterIds` can be added in future plans. The `ArcRef` on Chapter/Scene remains unchanged — it will reference Arc IDs once assignment UI is built.
