---
title: Repository Factory Implementation
slug: part-001-repository-factory-impl
part_number: 1
status: review
owner: Architect
assigned_to: Architect
phase: phase-001-create-factory
started_at: 2026-04-16
completed_at: 2026-04-16
estimated_duration: 0.5d
---

## Objective

> Create a generic, typed repository factory function in `src/lib/factories/repository-factory.ts` that generates standard CRUD functions (create, getById, getByProjectId, update, remove) and optional reorder support, all backed by the existing fetch-based API client pattern.

## Scope

**In scope:**

- Generic `createRepository<T>()` factory function
- Support for standard CRUD operations (create, getById, getByProjectId, update, remove)
- Optional `reorder` method support (Tier 2)
- Support for custom query methods (e.g., `getBySceneId`, `getByCategory`) via config
- Type-safe return values matching existing repository signatures

**Out of scope:**

- Migrating existing repositories (Part 002)
- Changing API route handlers
- Adding new repository methods not currently in use

## Implementation Steps

1. Create `src/lib/factories/repository-factory.ts`
2. Define `RepositoryConfig<T>` interface:
   ```typescript
   interface RepositoryConfig<T extends { id: string }> {
     endpoint: string;                    // e.g., '/api/db/arcs'
     entityName: string;                  // e.g., 'Arc' (for error messages)
     hasReorder?: boolean;                // generates reorder function
     customQueries?: Record<string, {     // e.g., { bySceneId: { param: 'sceneId' } }
       param: string;
     }>;
   }
   ```
3. Implement factory returning typed object:
   ```typescript
   interface Repository<T> {
     create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
     getById: (id: string) => Promise<T | undefined>;
     getByProjectId: (projectId: string) => Promise<T[]>;
     update: (id: string, changes: Partial<T>) => Promise<void>;
     remove: (id: string) => Promise<void>;
     reorder?: (parentId: string, orderedIds: string[]) => Promise<void>;
   }
   ```
4. Each method calls `fetch()` against the configured endpoint, matching exact behavior of current repositories
5. Add JSDoc documentation for factory and config

## Files

**Create:**

- `src/lib/factories/repository-factory.ts`

**Update:**

- None (migration is Part 002)

## Acceptance Criteria

- [ ] Factory function compiles with zero type errors
- [ ] Factory supports Tier 1 (standard CRUD) via basic config
- [ ] Factory supports Tier 2 (CRUD + reorder) via `hasReorder: true`
- [ ] Factory supports Tier 3 (custom queries) via `customQueries` config
- [ ] Return types match existing repository function signatures
- [ ] `pnpm check` passes

## Edge Cases

- Endpoints with non-standard parameter names (e.g., `sceneId` vs `projectId`)
- Character repository has relationship sub-methods — factory should allow extension, not replace those
- Export settings repository has no `create`/`remove` — factory should support partial CRUD

## Notes

> All existing repositories use `fetch()` to call `/api/db/*` endpoints. The factory must preserve this pattern — it must NOT import `better-sqlite3` or access the database directly. This maintains the client/server boundary.
>
> The factory lives in `$lib/factories/` which is importable by all modules per the boundary matrix.
