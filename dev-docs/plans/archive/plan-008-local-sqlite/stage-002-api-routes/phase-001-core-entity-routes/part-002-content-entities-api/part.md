---
title: Content Entities API Routes
slug: part-002-content-entities-api
part_number: 2
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-core-entity-routes
started_at: ~
completed_at: ~
estimated_duration: 0.67d
---

## Objective

> Implement full CRUD API routes for the four content entity tables: `chapters`, `scenes`, `beats`, and `scene_snapshots` — following the established route pattern from the projects API.

## Scope

**In scope:**

- Collection + item routes for `chapters`, `scenes`, `beats`, `scene_snapshots`
- `projectId` query param filtering on collection GET for all four
- `chapterId` query param filtering on `scenes` collection GET
- `sceneId` query param filtering on `beats` and `scene_snapshots` collection GET
- `ORDER BY order ASC` on `chapters`, `scenes`, `beats`
- `ORDER BY createdAt DESC` on `scene_snapshots`
- JSON (de)serialization of `arcRefs` (Chapter, Scene) and `characterIds`/`locationIds` (Scene)
- Reorder endpoint: `PUT /api/db/chapters/reorder` and `PUT /api/db/scenes/reorder` accepting `{ projectId, orderedIds: string[] }` body

**Out of scope:**

- Cascade delete (deleting a project does not auto-delete chapters in V1 — handled by cascade in migration utility)
- Full-text search

## Implementation Steps

1. Create `src/routes/api/db/chapters/+server.ts` (GET list with `?projectId`, POST create)
2. Create `src/routes/api/db/chapters/[id]/+server.ts` (GET, PUT, DELETE)
3. Create `src/routes/api/db/chapters/reorder/+server.ts` (PUT bulk reorder)
4. Repeat pattern for `scenes` (extra filter: `?chapterId`)
5. Create `src/routes/api/db/scenes/reorder/+server.ts`
6. Repeat pattern for `beats` (extra filter: `?sceneId`)
7. Repeat pattern for `scene_snapshots` (no reorder endpoint)
8. For Scene: `encodeJson(characterIds)`, `encodeJson(locationIds)`, `encodeJson(arcRefs)` on write; `decodeJson` on read
9. For Chapter: `encodeJson(arcRefs)` on write; `decodeJson` on read

## Files

**Create:**

- `src/routes/api/db/chapters/+server.ts`
- `src/routes/api/db/chapters/[id]/+server.ts`
- `src/routes/api/db/chapters/reorder/+server.ts`
- `src/routes/api/db/scenes/+server.ts`
- `src/routes/api/db/scenes/[id]/+server.ts`
- `src/routes/api/db/scenes/reorder/+server.ts`
- `src/routes/api/db/beats/+server.ts`
- `src/routes/api/db/beats/[id]/+server.ts`
- `src/routes/api/db/scene_snapshots/+server.ts`
- `src/routes/api/db/scene_snapshots/[id]/+server.ts`

## Acceptance Criteria

- [ ] `GET /api/db/chapters?projectId=X` returns chapters in `order ASC` order
- [ ] `PUT /api/db/chapters/reorder` with `{ orderedIds: [...] }` updates order of all listed chapters
- [ ] `GET /api/db/scenes?chapterId=X` returns scenes for a chapter in order
- [ ] Scene response includes `characterIds` and `locationIds` as arrays (not JSON strings)
- [ ] `GET /api/db/beats?sceneId=X` returns beats in order
- [ ] `GET /api/db/scene_snapshots?sceneId=X` returns snapshots newest-first
- [ ] `pnpm check` and `pnpm lint` pass

## Edge Cases

- Reorder endpoint must handle the case where `orderedIds` is empty (no-op, return 200)
- `scene_snapshots` has no `order` field — sort by `createdAt DESC`
- `arcRefs` field is optional on Chapter and Scene — handle `undefined` as `[]` for encoding

## Notes

> The reorder endpoints use SQLite prepared statements in a loop (no transaction needed for local use, but wrapping in `db.transaction()` is preferred for atomicity).
