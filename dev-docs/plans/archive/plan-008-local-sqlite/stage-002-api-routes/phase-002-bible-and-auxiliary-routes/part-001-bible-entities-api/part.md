---
title: Bible Entities API Routes
slug: part-001-bible-entities-api
part_number: 1
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-bible-and-auxiliary-routes
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Implement full CRUD API routes for the six story bible entity tables that build the world and character layer of each project.

## Scope

**In scope:**

- Collection + item routes for:
  - `characters` (array fields: `traits`, `goals`, `flaws`, `arcs`, `tags`)
  - `character_relationships` (no array fields)
  - `locations` (array field: `tags`)
  - `lore_entries` (no array fields)
  - `plot_threads` (no array fields)
  - `timeline_events` (no array fields)
- `projectId` query param filtering on all collection GETs
- `characterAId` and `characterBId` query param filtering on `character_relationships`

**Out of scope:**

- Search or full-text filtering
- Relationship graph traversal

## Implementation Steps

1. Create collection + item routes for `characters` — encode/decode `traits`, `goals`, `flaws`, `arcs`, `tags`
2. Create collection + item routes for `character_relationships`
3. Create collection + item routes for `locations` — encode/decode `tags`
4. Create collection + item routes for `lore_entries`
5. Create collection + item routes for `plot_threads`
6. Create collection + item routes for `timeline_events`

## Files

**Create:**

- `src/routes/api/db/characters/+server.ts`
- `src/routes/api/db/characters/[id]/+server.ts`
- `src/routes/api/db/character_relationships/+server.ts`
- `src/routes/api/db/character_relationships/[id]/+server.ts`
- `src/routes/api/db/locations/+server.ts`
- `src/routes/api/db/locations/[id]/+server.ts`
- `src/routes/api/db/lore_entries/+server.ts`
- `src/routes/api/db/lore_entries/[id]/+server.ts`
- `src/routes/api/db/plot_threads/+server.ts`
- `src/routes/api/db/plot_threads/[id]/+server.ts`
- `src/routes/api/db/timeline_events/+server.ts`
- `src/routes/api/db/timeline_events/[id]/+server.ts`

## Acceptance Criteria

- [ ] Character `POST` and `GET` correctly handles all five array fields as arrays in JSON response
- [ ] `GET /api/db/characters?projectId=X` returns all characters for that project
- [ ] `GET /api/db/character_relationships?characterAId=X` returns matching relationships
- [ ] Location `tags` field is array in response, not raw JSON string
- [ ] All entity routes return 404 for unknown IDs

## Edge Cases

- `character_relationships` query: allow filtering by either `characterAId` OR `characterBId` independently
- `timeline_events` has a `date` field (string, not `timestamp` integer) — preserve as-is
- Character `arcs` field is `string[]` (not related to the `arcs` table) — encode like other arrays

## Notes

> None of the bible entity tables have an `order` field, so collection GETs are sorted by `createdAt ASC` as a stable default.
