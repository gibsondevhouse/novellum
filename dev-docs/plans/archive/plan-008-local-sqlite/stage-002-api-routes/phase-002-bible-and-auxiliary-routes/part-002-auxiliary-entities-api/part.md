---
title: Auxiliary Entities API Routes
slug: part-002-auxiliary-entities-api
part_number: 2
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-bible-and-auxiliary-routes
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Implement full CRUD API routes for the five auxiliary entity tables: `consistency_issues`, `export_settings`, `story_frames`, `acts`, and `arcs`.

## Scope

**In scope:**

- Collection + item routes for all five tables
- `projectId` query param filtering
- `ORDER BY order ASC` for `acts` and `arcs` (both have `order` field)
- `ORDER BY createdAt DESC` for `consistency_issues` and `story_frames`
- Special handling for `export_settings`: 1:1 per project, collection GET returns single object or null
- `severity`, `type`, `status` query param filtering on `consistency_issues`

**Out of scope:**

- Bulk status update for consistency_issues (V1: one at a time)

## Implementation Steps

1. Create routes for `consistency_issues` with `projectId`, `type`, `severity`, `status` filter support on GET
2. Create routes for `export_settings` — collection GET returns `{ data: ExportSettings | null }` shaped response
3. Create routes for `story_frames`
4. Create routes for `acts` with reorder endpoint (`PUT /api/db/acts/reorder`)
5. Create routes for `arcs` with reorder endpoint (`PUT /api/db/arcs/reorder`)

## Files

**Create:**

- `src/routes/api/db/consistency_issues/+server.ts`
- `src/routes/api/db/consistency_issues/[id]/+server.ts`
- `src/routes/api/db/export_settings/+server.ts`
- `src/routes/api/db/export_settings/[id]/+server.ts`
- `src/routes/api/db/story_frames/+server.ts`
- `src/routes/api/db/story_frames/[id]/+server.ts`
- `src/routes/api/db/acts/+server.ts`
- `src/routes/api/db/acts/[id]/+server.ts`
- `src/routes/api/db/acts/reorder/+server.ts`
- `src/routes/api/db/arcs/+server.ts`
- `src/routes/api/db/arcs/[id]/+server.ts`
- `src/routes/api/db/arcs/reorder/+server.ts`

## Acceptance Criteria

- [ ] `GET /api/db/consistency_issues?projectId=X&status=open` returns filtered issues
- [ ] `GET /api/db/export_settings?projectId=X` returns `{ data: ExportSettings }` or `{ data: null }`
- [ ] Acts and arcs collection GETs return records ordered by `order ASC`
- [ ] Reorder endpoints for acts and arcs work atomically
- [ ] `pnpm check` and `pnpm lint` pass

## Edge Cases

- `export_settings` uses `upsert` semantics on POST (insert or replace by `projectId` rather than `id`) — consider using `INSERT OR REPLACE INTO` for this table
- `consistency_issues` `sceneId` field is nullable — allow null in schema and response

## Notes

> `story_frames` is a relatively new table (schemaV7). It has minimal fields — check `src/lib/db/types.ts` for the exact interface before writing DDL or route logic.
