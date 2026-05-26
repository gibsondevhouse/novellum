---
title: Route Unit Tests
slug: part-001-route-unit-tests
part_number: 1
status: draft
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-001-api-tests
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Write focused Vitest tests for the SQLite API route logic — validating CRUD correctness, query param filtering, HTTP status codes, JSON array round-trips, and error responses.

## Scope

**In scope:**

- Tests for `projects`, `chapters`, `scenes`, `characters` route handlers
- Serialize/deserialize round-trip tests for `serialize.ts` utility
- Validation error tests (missing required fields → 400)
- 404 behavior on unknown ID

**Out of scope:**

- Full end-to-end browser tests (covered in Phase 002)
- Performance tests
- Load testing

## Implementation Steps

1. Create `tests/sqlite/` directory
2. Create `tests/sqlite/serialize.test.ts` — unit tests for `encodeJson`/`decodeJson`
3. Create `tests/sqlite/projects-route.test.ts` — test project CRUD handler logic with in-memory DB
4. Create `tests/sqlite/chapters-route.test.ts` — test chapter list filtering and reorder
5. Create `tests/sqlite/scenes-route.test.ts` — test scene array field round-trip
6. Create `tests/sqlite/characters-route.test.ts` — test character array field round-trip
7. Each test file: create fresh in-memory DB, run `runMigrations`, invoke handler functions directly

## Files

**Create:**

- `tests/sqlite/serialize.test.ts`
- `tests/sqlite/projects-route.test.ts`
- `tests/sqlite/chapters-route.test.ts`
- `tests/sqlite/scenes-route.test.ts`
- `tests/sqlite/characters-route.test.ts`

## Acceptance Criteria

- [ ] `serialize.test.ts` — `encodeJson(null)` returns `'[]'`; `decodeJson<string[]>('["a","b"]')` returns `['a','b']`
- [ ] `projects-route.test.ts` — create, read, update, delete full cycle passes; 404 on unknown ID
- [ ] `chapters-route.test.ts` — `?projectId` filter returns only matching chapters; reorder updates `order` field
- [ ] `scenes-route.test.ts` — `characterIds` and `locationIds` survive write/read as JS arrays
- [ ] `characters-route.test.ts` — `traits`, `goals`, `flaws` survive write/read as JS arrays
- [ ] All tests pass: `pnpm test`

## Edge Cases

- `encodeJson` with `undefined` input → `'[]'`
- `encodeJson` with array of objects (ArcRef) → valid JSON string
- `decodeJson` with empty string or null → empty array, no throw

## Notes

> Tests must not write to `novellum.db`. Use `new Database(':memory:')` and pass it explicitly to the handler functions (inject dependency rather than relying on the singleton). This may require a small refactor of the route handlers to accept a `db` param — plan for this in the route implementation.
