---
title: Migrate POST Handlers
slug: part-002-migrate-post-handlers
part_number: 2
status: review
owner: Backend
assigned_to: Backend
phase: phase-001-create-api-helpers
started_at: 2026-04-16
completed_at: 2026-04-16
estimated_duration: 1d
dependencies:
  - part-001-api-helper-impl
---

## Objective

> Replace the inline POST handler logic in all 14+ `+server.ts` files with calls to `createPostHandler` from the new API helper factory.

## Scope

**In scope — target endpoints:**

| # | Endpoint Path | Table | Est. Lines Saved |
|---|---------------|-------|------------------|
| 1 | `api/db/projects/+server.ts` | projects | ~14 |
| 2 | `api/db/characters/+server.ts` | characters | ~20 |
| 3 | `api/db/locations/+server.ts` | locations | ~16 |
| 4 | `api/db/lore-entries/+server.ts` | lore_entries | ~16 |
| 5 | `api/db/plot-threads/+server.ts` | plot_threads | ~16 |
| 6 | `api/db/relationships/+server.ts` | relationships | ~14 |
| 7 | `api/db/timeline-events/+server.ts` | timeline_events | ~18 |
| 8 | `api/db/scenes/+server.ts` | scenes | ~24 |
| 9 | `api/db/acts/+server.ts` | acts | ~14 |
| 10 | `api/db/chapters/+server.ts` | chapters | ~14 |
| 11 | `api/db/beats/+server.ts` | beats | ~14 |
| 12 | `api/db/stages/+server.ts` | stages | ~14 |
| 13 | `api/db/arcs/+server.ts` | arcs | ~16 |
| 14 | `api/db/writing-styles/+server.ts` | writing_styles | ~14 |

**Out of scope:**

- GET, PUT, DELETE handler migration (can be done in a follow-up)
- Changing response shapes

## Implementation Steps

1. For each endpoint: define an `EntityRouteConfig` with table name, required fields, defaults, JSON fields
2. Replace the inline POST function body with `export const POST = createPostHandler(config)`
3. Verify each endpoint compiles
4. Keep GET/PUT/DELETE handlers untouched for now

## Files

**Create:** None

**Update:**

- `src/routes/api/db/projects/+server.ts`
- `src/routes/api/db/characters/+server.ts`
- `src/routes/api/db/locations/+server.ts`
- `src/routes/api/db/lore-entries/+server.ts`
- `src/routes/api/db/plot-threads/+server.ts`
- `src/routes/api/db/relationships/+server.ts`
- `src/routes/api/db/timeline-events/+server.ts`
- `src/routes/api/db/scenes/+server.ts`
- `src/routes/api/db/acts/+server.ts`
- `src/routes/api/db/chapters/+server.ts`
- `src/routes/api/db/beats/+server.ts`
- `src/routes/api/db/stages/+server.ts`
- `src/routes/api/db/arcs/+server.ts`
- `src/routes/api/db/writing-styles/+server.ts`

## Acceptance Criteria

- [ ] All 14 POST handlers use `createPostHandler`
- [ ] Zero inline `crypto.randomUUID()` calls in POST handlers
- [ ] Zero inline `new Date().toISOString()` calls in POST handlers
- [ ] `pnpm check` passes
- [ ] `pnpm run lint` passes — no boundary violations

## Edge Cases

- `scenes` has the most fields (~28 lines) — verify all defaults are preserved
- `characters` has JSON arrays for `arcRefs` — verify `encodeJson` applied
- Endpoints with custom validation (beyond required fields) may need to keep some inline logic

## Notes

> Each migration is a self-contained edit. If any endpoint has custom logic beyond boilerplate (e.g., cascading deletes, computed fields), keep the custom part inline and only factory-ize the standard portion.
