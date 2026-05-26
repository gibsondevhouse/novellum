---
title: Repository Pattern
slug: phase-002-repository-pattern
phase_number: 2
status: complete
owner: Backend Agent
stage: stage-001-dexie-schema-and-repository-layer
parts:
  - part-001-project-chapter-repository
  - part-002-scene-beat-repository
  - part-003-bible-entities-repository
estimated_duration: 3d
---

## Goal

Wrap every Dexie table with a typed repository that exposes only intentional, named operations. No module may import `db` directly from outside `src/lib/db/` or a `services/` file.

## Parts

| #   | Part                                                                        | Status  |
| --- | --------------------------------------------------------------------------- | ------- |
| 001 | [Project & Chapter Repository](part-001-project-chapter-repository/part.md) | `draft` |
| 002 | [Scene & Beat Repository](part-002-scene-beat-repository/part.md)           | `draft` |
| 003 | [Bible Entities Repository](part-003-bible-entities-repository/part.md)     | `draft` |

## Entry Criteria

- `phase-001-full-entity-schema-and-migrations` is `complete`
- Dexie v2 schema with all tables is in `db.ts`

## Exit Criteria

- Repository files exist at `src/modules/<domain>/services/<entity>-repository.ts`
- Each repository exports: `create`, `getById`, `getByProjectId`, `update`, `remove`
- No `db.*` import exists outside `src/lib/db/` or `src/modules/<domain>/services/`
- `pnpm run lint` (including `eslint-plugin-boundaries`) exits clean
