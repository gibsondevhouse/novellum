---
title: Arc Type, Schema & Repository
slug: part-001-arc-type-schema-and-repository
part_number: 1
status: draft
owner: backend
assigned_to: backend
phase: phase-001-arc-entity
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Create the Arc as a first-class Dexie entity — define its TypeScript interface, bump the schema to v8 with an `arcs` table, implement a full CRUD repository, add service-layer convenience functions, update the Hub metrics service to return real arc counts, and write tests.

## Scope

**In scope:**

- `Arc` interface in `src/lib/db/types.ts`
- Dexie schema v8 migration adding `arcs: 'id, projectId, order'` in `src/lib/db/schema.ts`
- Arc repository at `src/modules/outliner/services/arc-repository.ts`
- Arc service functions (getArcsByProjectId, createArc, updateArc, removeArc, reorderArcs)
- Update `src/modules/project/services/hub-metrics-service.ts` to query real arc count with `ready: true`
- Unit tests for arc repository and service functions

**Out of scope:**

- Arc-to-chapter/scene assignment UI
- Arc tagging or categorization
- Any UI components (those come in Stage 002)

## Implementation Steps

1. Add `Arc` interface to `src/lib/db/types.ts` with fields: id, projectId, title, description, purpose, order, createdAt, updatedAt
2. Bump Dexie schema version to v8 in `src/lib/db/schema.ts`, adding `arcs: 'id, projectId, order'`
3. Add `arcs` table declaration to `src/lib/db/index.ts` (the Dexie DB class)
4. Create `src/modules/outliner/services/arc-repository.ts` with CRUD functions:
   - `createArc(data: Omit<Arc, 'id' | 'createdAt' | 'updatedAt'>): Promise<Arc>`
   - `getArcById(id: string): Promise<Arc | undefined>`
   - `getArcsByProjectId(projectId: string): Promise<Arc[]>`
   - `updateArc(id: string, patch: Partial<Omit<Arc, 'id' | 'projectId' | 'createdAt'>>): Promise<void>`
   - `removeArc(id: string): Promise<void>`
   - `reorderArcs(projectId: string, orderedIds: string[]): Promise<void>`
5. Update `src/modules/project/services/hub-metrics-service.ts`:
   - Import `db.arcs` and query `where('projectId').equals(projectId).count()`
   - Set `arcs: { count, ready: true }` instead of `{ count: 0, ready: false }`
6. Export Arc type and repository from `src/modules/outliner/index.ts`
7. Write tests in `src/modules/outliner/services/__tests__/arc-repository.test.ts`

## Files

**Create:**

- `src/modules/outliner/services/arc-repository.ts`
- `src/modules/outliner/services/__tests__/arc-repository.test.ts`

**Update:**

- `src/lib/db/types.ts` — add `Arc` interface
- `src/lib/db/schema.ts` — bump to v8, add `arcs` table
- `src/lib/db/index.ts` — add `arcs` table to DB class
- `src/modules/project/services/hub-metrics-service.ts` — real arc count
- `src/modules/outliner/index.ts` — export arc repository and type

## Acceptance Criteria

- [ ] `Arc` interface exists in types.ts with all specified fields
- [ ] Dexie schema v8 includes `arcs` table with correct indexes
- [ ] Arc CRUD repository functions work correctly
- [ ] Hub metrics service returns real arc count with `ready: true`
- [ ] Arc repository tests pass
- [ ] Existing tests still pass (no regressions from schema bump)
- [ ] Lint and typecheck pass

## Edge Cases

- Schema migration v7→v8: Dexie handles additive migrations automatically, but verify existing data is not affected
- `reorderArcs` should handle empty arrays gracefully
- `removeArc` on non-existent ID should not throw

## Notes

> Follow the same repository pattern established by `chapter-repository.ts` and `scene-repository.ts`. Use `crypto.randomUUID()` for IDs, ISO 8601 timestamps, and Dexie transactions for reorder operations.
