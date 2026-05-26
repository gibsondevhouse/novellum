---
title: Projects API Route
slug: part-001-projects-api
part_number: 1
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-core-entity-routes
started_at: ~
completed_at: ~
estimated_duration: 0.33d
---

## Objective

> Implement `GET`, `POST` collection routes and `GET`, `PUT`, `DELETE` item routes for the `projects` entity, establishing the canonical route pattern for all subsequent entity routes.

## Scope

**In scope:**

- `src/routes/api/db/projects/+server.ts` — collection (GET all, POST create)
- `src/routes/api/db/projects/[id]/+server.ts` — item (GET by ID, PUT update, DELETE)
- Input validation for required fields (`title`)
- Server-generated `id` (UUID), `createdAt`, `updatedAt`
- Return full entity shape matching `Project` interface from `src/lib/db/types.ts`

**Out of scope:**

- Authentication
- Soft delete
- Pagination (V1 returns all)

## Implementation Steps

1. Create `src/routes/api/db/projects/+server.ts`
   - `GET`: `SELECT * FROM projects ORDER BY createdAt DESC` → return JSON array
   - `POST`: parse body, validate `title` present, generate UUID, insert, return 201 + entity
2. Create `src/routes/api/db/projects/[id]/+server.ts`
   - `GET`: `SELECT * FROM projects WHERE id = ?` → 200 or 404
   - `PUT`: parse body, update `updatedAt`, `UPDATE ... WHERE id = ?` → 200 + updated entity
   - `DELETE`: `DELETE FROM projects WHERE id = ?` → 204
3. Use `db.prepare(sql).run(params)` / `.get(params)` / `.all()` from `better-sqlite3`
4. Wrap each handler in a try/catch; return `{ error: e.message }` with status 500 on unexpected errors
5. Set `Content-Type: application/json` on all responses

## Files

**Create:**

- `src/routes/api/db/projects/+server.ts`
- `src/routes/api/db/projects/[id]/+server.ts`

## Acceptance Criteria

- [ ] `GET /api/db/projects` returns `[]` on empty DB and full array when projects exist
- [ ] `POST /api/db/projects` with `{ title: "My Novel" }` returns 201 with full `Project` shape
- [ ] `POST /api/db/projects` without `title` returns 400 `{ error: "title is required" }`
- [ ] `GET /api/db/projects/:id` returns 404 for unknown ID
- [ ] `PUT /api/db/projects/:id` with partial body updates only provided fields and bumps `updatedAt`
- [ ] `DELETE /api/db/projects/:id` returns 204 and row is gone from DB
- [ ] `pnpm check` and `pnpm lint` pass

## Edge Cases

- `PUT` with no body fields is a no-op but still bumps `updatedAt`
- `DELETE` on non-existent ID returns 204 (idempotent delete)
- `title` field in `PUT` can be an empty string — only reject missing `title` on `POST`

## Notes

> Use `crypto.randomUUID()` (available in Node 19+) for ID generation. Do not import any client-side UUID library.
> This route is the canonical template — document the handler structure with inline comments so it is easy to replicate.
