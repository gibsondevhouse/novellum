---
title: API Helper Implementation
slug: part-001-api-helper-impl
part_number: 1
status: review
owner: Backend
assigned_to: Backend
phase: phase-001-create-api-helpers
started_at: 2026-04-16
completed_at: 2026-04-16
estimated_duration: 0.5d
---

## Objective

> Create `src/lib/server/api-helpers.ts` with factory functions that generate standardized SvelteKit RequestHandlers for POST, GET, PUT, and DELETE operations against the SQLite database.

## Scope

**In scope:**

- `createPostHandler(config)` — generates POST handler with UUID, timestamps, defaults, validation
- `createGetHandler(config)` — generates GET handler with query param filtering
- `createPutHandler(config)` — generates PUT handler with updatedAt injection
- `createDeleteHandler(config)` — generates DELETE handler
- Support for JSON array fields (uses `encodeJson`/`decodeJson` from `$lib/db/types.js`)

**Out of scope:**

- Migrating existing handlers (Part 002)
- Changing API response shapes

## Implementation Steps

1. Create `src/lib/server/api-helpers.ts`
2. Define `EntityRouteConfig` interface with: `table`, `requiredFields`, `fieldDefaults`, `jsonFields`, `columns`
3. Implement `createPostHandler<T>(config)` → `RequestHandler`
4. Implement `createGetHandler(config)` → `RequestHandler`
5. Implement `createPutHandler(config)` → `RequestHandler`
6. Implement `createDeleteHandler(config)` → `RequestHandler`
7. Export all four plus the config type

## Files

**Create:**

- `src/lib/server/api-helpers.ts`

**Update:**

- None

## Acceptance Criteria

- [ ] All 4 handler factories compile with zero type errors
- [ ] POST factory generates UUID, injects timestamps, applies defaults, validates required fields
- [ ] GET factory supports `?projectId=`, `?sceneId=`, etc. query params
- [ ] PUT factory injects `updatedAt` timestamp
- [ ] JSON array fields properly encoded/decoded
- [ ] `pnpm check` passes

## Edge Cases

- Some entities have no `projectId` (e.g., export settings scoped differently)
- `scenes` POST handler has ~28 lines with many nullable fields — config must handle `null` defaults
- Array fields (`characterIds`, `tags`, `arcRefs`) need `encodeJson` before INSERT

## Notes

> This file is server-only (`src/lib/server/`). SvelteKit prevents client-side import of files in this directory. The `db` import from `$lib/db/db.js` is only available server-side.
