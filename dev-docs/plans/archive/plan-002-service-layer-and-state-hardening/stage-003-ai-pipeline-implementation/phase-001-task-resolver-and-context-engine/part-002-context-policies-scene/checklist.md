---
part: part-002-context-policies-scene
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `part-001-task-resolver` is `complete` — `AiTask` and `AiContext` types are stable in `types.ts`
- [ ] Read `dev-docs/context-engine.md` §scene_only and §scene_plus_adjacent policy specs
- [ ] Confirm repository exports: `getSceneById`, `getBeatsBySceneId`, `getCharactersByProjectId`, etc. are available

## Post-Implementation

- [ ] `context-engine.ts` created with `buildContext` function
- [ ] `scene_only` policy correctly fetches scene + beats + referenced characters + referenced locations
- [ ] `scene_plus_adjacent` adds prev/next scene lookup
- [ ] Token budget constants (`MAX_CHARACTERS = 5`, etc.) declared at top of file
- [ ] Unrecognized policy throws error with policy name in message
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean
