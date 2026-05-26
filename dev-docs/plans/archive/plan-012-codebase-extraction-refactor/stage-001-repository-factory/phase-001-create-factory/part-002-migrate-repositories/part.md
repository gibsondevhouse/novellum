---
title: Migrate All Repositories
slug: part-002-migrate-repositories
part_number: 2
status: review
owner: Architect
assigned_to: Architect
phase: phase-001-create-factory
started_at: 2026-04-16
completed_at: 2026-04-16
estimated_duration: 1d
---

## Objective

> Migrate all 18 existing repository files to use the new `createRepository()` factory, eliminating duplicated CRUD boilerplate while preserving all existing function signatures and behavior.

## Scope

**In scope:**

- Migrate all 18 repository files across 6 modules
- Preserve all existing exported function names (for backward compatibility)
- Handle Tier 3 (character-repository) custom methods as extensions

**Out of scope:**

- Changing API route handlers
- Adding new query methods
- Modifying function signatures

## Implementation Steps

### Tier 1 — Standard CRUD (migrate first, simplest)

1. `src/modules/bible/services/location-repository.ts` (30 lines)
2. `src/modules/bible/services/plot-thread-repository.ts` (30 lines)
3. `src/modules/bible/services/timeline-event-repository.ts` (30 lines)
4. `src/modules/settings/services/chat-instruction-repository.ts` (25 lines)
5. `src/modules/settings/services/system-prompt-repository.ts` (25 lines)
6. `src/modules/settings/services/template-repository.ts` (25 lines)
7. `src/modules/settings/services/writing-style-repository.ts` (25 lines)
8. `src/modules/project/services/project-repository.ts` (27 lines)
9. `src/modules/consistency/services/consistency-repository.ts` (27 lines)
10. `src/modules/outliner/services/arc-repository.ts` (31 lines)
11. `src/modules/export/services/export-settings-repository.ts` (22 lines)

### Tier 2 — CRUD + Reorder

12. `src/modules/project/services/chapter-repository.ts` (37 lines)
13. `src/modules/editor/services/beat-repository.ts` (34 lines)
14. `src/modules/editor/services/scene-repository.ts` (36 lines)
15. `src/modules/editor/services/stage-repository.ts` (34 lines)
16. `src/modules/editor/services/snapshot-repository.ts` (19 lines)

### Tier 3 — Custom Extensions

17. `src/modules/bible/services/character-repository.ts` (41 lines) — has relationship methods
18. `src/modules/bible/services/lore-entry-repository.ts` (37 lines) — has `getByCategory`

Each migration follows this pattern:
```
import { createRepository } from '$lib/factories/repository-factory.js';
import type { EntityType } from '$lib/db/types.js';

const repo = createRepository<EntityType>({ endpoint: '/api/db/entities', entityName: 'Entity' });

export const createEntity = repo.create;
export const getEntityById = repo.getById;
// etc.

// Tier 3: add custom methods below
export async function getEntitiesByCategory(category: string) { ... }
```

## Files

**Create:**

- None

**Update:**

- `src/modules/bible/services/location-repository.ts`
- `src/modules/bible/services/plot-thread-repository.ts`
- `src/modules/bible/services/timeline-event-repository.ts`
- `src/modules/bible/services/character-repository.ts`
- `src/modules/bible/services/lore-entry-repository.ts`
- `src/modules/settings/services/chat-instruction-repository.ts`
- `src/modules/settings/services/system-prompt-repository.ts`
- `src/modules/settings/services/template-repository.ts`
- `src/modules/settings/services/writing-style-repository.ts`
- `src/modules/project/services/project-repository.ts`
- `src/modules/project/services/chapter-repository.ts`
- `src/modules/consistency/services/consistency-repository.ts`
- `src/modules/outliner/services/arc-repository.ts`
- `src/modules/editor/services/beat-repository.ts`
- `src/modules/editor/services/scene-repository.ts`
- `src/modules/editor/services/stage-repository.ts`
- `src/modules/editor/services/snapshot-repository.ts`
- `src/modules/export/services/export-settings-repository.ts`

## Acceptance Criteria

- [ ] All 18 repository files refactored to use factory
- [ ] All existing exported function names preserved (re-exported from factory)
- [ ] Character repository custom relationship methods still work
- [ ] Lore entry `getByCategory` still works
- [ ] `pnpm check` — 0 type errors
- [ ] `pnpm run lint` — 0 new lint errors
- [ ] `pnpm run test` — all existing tests pass
- [ ] Browser smoke test on workspace, bible, and editor pages

## Edge Cases

- Export settings repository only has `get` and `update` (no `create`/`remove`) — use partial factory config
- Snapshot repository only has `create` and `listByScene` — minimal factory usage
- Character repository has 3 relationship methods alongside standard CRUD

## Notes

> Migrate in order: Tier 1 first (simplest), then Tier 2, then Tier 3. Run `pnpm check` after each tier to catch issues early. This is the largest part in the plan — budget time accordingly.
