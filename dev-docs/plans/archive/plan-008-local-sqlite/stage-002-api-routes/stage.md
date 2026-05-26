---
title: API Routes
slug: stage-002-api-routes
stage_number: 2
status: draft
owner: Backend Agent
plan: plan-008-local-sqlite
phases:
  - phase-001-core-entity-routes
  - phase-002-bible-and-auxiliary-routes
estimated_duration: 2d
risk_level: medium
---

## Goal

> Build the full suite of `/api/db/*` SvelteKit REST routes that expose CRUD operations for all 16 entity tables, consuming the `SqliteDb` singleton and returning typed JSON responses.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Core Entity Routes](phase-001-core-entity-routes/phase.md) | `draft` | 1d |
| 002 | [Bible and Auxiliary Routes](phase-002-bible-and-auxiliary-routes/phase.md) | `draft` | 1d |

## Entry Criteria

- Stage 001 is `complete`
- `SqliteDb` singleton is importable and `novellum.db` is created on import

## Exit Criteria

- All phases in this stage are `complete`
- All 16 entity tables have corresponding API routes
- Each route responds with correct HTTP status codes (200, 201, 400, 404, 500)
- JSON responses match the TypeScript interface shapes in `src/lib/db/types.ts`
- No Dexie imports in any file under `src/routes/api/db/`

## Notes

> Route convention: all routes live under `src/routes/api/db/[entity]/+server.ts`.
>
> Filtering pattern: GET requests support a `projectId` query parameter for all project-scoped entities. Example: `GET /api/db/chapters?projectId=abc123`.
>
> All routes must validate that required fields are present before inserting. Return `400 Bad Request` with a JSON error body `{ error: string }` for validation failures.
>
> Route-level JSON serialization must call `encodeJson` / `decodeJson` from `$lib/server/db` for all array fields before writing to or after reading from SQLite.
