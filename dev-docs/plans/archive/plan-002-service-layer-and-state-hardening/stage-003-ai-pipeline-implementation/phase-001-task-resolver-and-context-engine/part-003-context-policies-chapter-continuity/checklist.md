---
part: part-003-context-policies-chapter-continuity
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `part-002-context-policies-scene` is `complete` — `context-engine.ts` base structure exists
- [ ] Read `dev-docs/context-engine.md` §chapter_scope and §continuity_scope in detail
- [ ] Confirm `getScenesByChapterId` and `getScenesByProjectId` are both implemented in repository layer

## Post-Implementation

- [ ] `chapter_scope` case added to `buildContext` switch — fetches all scenes in chapter + character/location de-duplication
- [ ] `continuity_scope` case added — fetches project-wide scenes, all characters, locations, lore entries, plot threads
- [ ] `MAX_CONTINUITY_CHARS = 24000` constant declared
- [ ] Both caps enforced before returning `AiContext`
- [ ] No `throw 'Unknown policy'` branches remain (all 4 policies + `outline_scope` handled)
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean
