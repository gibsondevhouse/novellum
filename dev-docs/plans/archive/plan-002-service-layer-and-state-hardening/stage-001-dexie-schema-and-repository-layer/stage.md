---
title: Dexie Schema & Repository Layer
slug: stage-001-dexie-schema-and-repository-layer
stage_number: 1
status: complete
owner: Backend Agent
plan: plan-002-service-layer-and-state-hardening
phases:
  - phase-001-full-entity-schema-and-migrations
  - phase-002-repository-pattern
estimated_duration: 5d
risk_level: low
---

## Goal

Replace the minimal v1 schema stub from Path 1 with a complete, versioned Dexie schema covering all story entities. Then build a typed repository layer so every module accesses data through a consistent, testable API — no raw `db.*` calls outside of repository files.

## Phases

| #   | Phase                                                                                   | Status  | Est. Duration |
| --- | --------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Full Entity Schema & Migrations](phase-001-full-entity-schema-and-migrations/phase.md) | `draft` | 2d            |
| 002 | [Repository Pattern](phase-002-repository-pattern/phase.md)                             | `draft` | 3d            |

## Entry Criteria

- `plan-001-ui-and-interaction-model` is `complete`
- `src/lib/db/db.ts` and `src/lib/db/schema.ts` exist from Path 1
- `dev-docs/data-model.md` reviewed and all entities confirmed

## Exit Criteria

- All phases complete
- Dexie v2 schema covers all entities listed in `dev-docs/data-model.md`
- No raw `db.*` access outside of `src/modules/<domain>/services/` or `src/lib/db/`
- `pnpm run check` and `pnpm run lint` pass

## Notes

Schema source of truth: `dev-docs/data-model.md`. Every entity must have a `projectId` field (or `null` for project-level entities) to enable efficient per-project queries. The `id` field on all entities is always `crypto.randomUUID()` — never auto-increment.
