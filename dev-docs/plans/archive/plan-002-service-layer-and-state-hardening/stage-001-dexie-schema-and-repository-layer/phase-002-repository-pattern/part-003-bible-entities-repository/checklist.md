---
part: part-003-bible-entities-repository
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `part-002-scene-beat-repository` is `complete`
- [ ] All 5 bible entity tables confirmed in Dexie v2 schema with `projectId` indexes
- [ ] `character_relationships` table confirmed in schema

## Post-Implementation

- [ ] All 5 repository files created at `src/modules/story-bible/services/`
- [ ] `CharacterRelationship` CRUD in `character-repository.ts`
- [ ] All `getByProjectId` methods use Dexie `.where()` index query
- [ ] No import from `editor/` or `outliner/` modules
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean
