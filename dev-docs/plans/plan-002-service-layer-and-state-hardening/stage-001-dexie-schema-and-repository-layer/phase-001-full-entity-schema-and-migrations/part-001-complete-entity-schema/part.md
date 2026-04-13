---
title: Complete Entity Schema
slug: part-001-complete-entity-schema
part_number: 1
status: complete
owner: Backend Agent
phase: phase-001-full-entity-schema-and-migrations
estimated_duration: 1d
---

## Objective

Expand `src/lib/db/schema.ts` to export TypeScript interfaces for all 9 entities in `dev-docs/data-model.md`, then update `src/lib/db/db.ts` to declare the Dexie v2 schema with all tables and compound indexes.

## Context

- `dev-docs/data-model.md` — authoritative entity shapes
- `src/lib/db/db.ts` — current v1 Dexie instance (update, do not replace)
- `src/lib/db/schema.ts` — current typed interfaces (extend)

## Entities to Add or Complete

| Entity                  | Table Name                | Key Indexes                                 |
| ----------------------- | ------------------------- | ------------------------------------------- |
| `Project`               | `projects`                | `id, createdAt`                             |
| `Chapter`               | `chapters`                | `id, projectId, order`                      |
| `Scene`                 | `scenes`                  | `id, chapterId, projectId, order`           |
| `Beat`                  | `beats`                   | `id, sceneId, projectId, order`             |
| `Character`             | `characters`              | `id, projectId`                             |
| `CharacterRelationship` | `character_relationships` | `id, projectId, characterAId, characterBId` |
| `Location`              | `locations`               | `id, projectId`                             |
| `LoreEntry`             | `lore_entries`            | `id, projectId, category`                   |
| `PlotThread`            | `plot_threads`            | `id, projectId`                             |
| `TimelineEvent`         | `timeline_events`         | `id, projectId, date`                       |

## Acceptance Criteria

- [ ] `schema.ts` exports named TypeScript interfaces for all 10 entities (including `CharacterRelationship`) with all fields from `data-model.md`
- [ ] Every entity interface has: `id: string` (UUID), `projectId: string` (or `null` for project-level), `createdAt: string` (ISO 8601), `updatedAt: string`
- [ ] `db.ts` Dexie version is bumped to `2` with all tables declared
- [ ] Dexie string schema (e.g. `"id, projectId, order"`) matches the index list above
- [ ] `pnpm run check` exits with zero errors

## Out of Scope

- Seed data
- Migration logic (→ part-002)
- Repository functions (→ phase-002)
