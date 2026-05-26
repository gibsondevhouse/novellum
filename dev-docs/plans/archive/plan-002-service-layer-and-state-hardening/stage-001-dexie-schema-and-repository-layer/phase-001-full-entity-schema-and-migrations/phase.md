---
title: Full Entity Schema & Migrations
slug: phase-001-full-entity-schema-and-migrations
phase_number: 1
status: complete
owner: Backend Agent
stage: stage-001-dexie-schema-and-repository-layer
parts:
  - part-001-complete-entity-schema
  - part-002-migration-strategy
estimated_duration: 2d
---

## Goal

Extend the stub Dexie schema from Path 1 into a complete v2 schema covering all entities in `dev-docs/data-model.md`. Define an upgrade path from v1 so existing development databases are not corrupted.

## Parts

| #   | Part                                                              | Status  |
| --- | ----------------------------------------------------------------- | ------- |
| 001 | [Complete Entity Schema](part-001-complete-entity-schema/part.md) | `draft` |
| 002 | [Migration Strategy](part-002-migration-strategy/part.md)         | `draft` |

## Entry Criteria

- `dev-docs/data-model.md` reviewed
- Current `src/lib/db/db.ts` schema version identified

## Exit Criteria

- `src/lib/db/schema.ts` exports typed interfaces for all 9 entities
- `src/lib/db/db.ts` declares Dexie v2 with all tables and correct indexes
- Schema version comment in `db.ts` matches `data-model.md` version
- `pnpm run check` exits clean
