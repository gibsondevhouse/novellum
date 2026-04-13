---
title: Context Policies — Scene
slug: part-002-context-policies-scene
part_number: 2
status: complete
owner: AI Agent
phase: phase-001-task-resolver-and-context-engine
estimated_duration: 1d
---

## Objective

Implement the `scene_only` and `scene_plus_adjacent` context policies in `src/lib/ai/context-engine.ts`. These are the two policies used most frequently (draft and continue actions).

## Reference Documents

- `dev-docs/context-engine.md` §Policies — what each policy queries
- `dev-docs/ai-pipeline.md` §Context Builder — return shape

## Target File

`src/lib/ai/context-engine.ts`

## Policy Specifications (from `context-engine.md`)

### `scene_only`

Fetches:

- The active scene (by `task.targetEntityId`)
- All beats in that scene
- Characters referenced in the scene's `characterIds` array
- Locations referenced in the scene's `locationIds` array

Returns `AiContext` with `adjacentScenes: []`, `chapter: null`, `loreEntries: []`.

### `scene_plus_adjacent`

Everything in `scene_only`, plus:

- Previous scene in the same chapter (by `order` field, order - 1)
- Next scene in the same chapter (by `order` field, order + 1)

Returns `AiContext` with `adjacentScenes: [prev, next].filter(Boolean)`.

## Required Export (partial — more policies added in part-003)

```ts
export async function buildContext(task: AiTask, projectId: string): Promise<AiContext>;
```

At this stage `buildContext` must handle `scene_only` and `scene_plus_adjacent`. For unrecognized policies it should throw `new Error('Unknown context policy: ...')` as a placeholder.

## Token Budget Enforcement

Each policy assembles context strings. After assembling, enforce a hard cap:

- Characters: max 5 per context bundle (sorted by relevance to scene)
- Locations: max 3 per context bundle
- Beats: all beats in active scene (no cap)
- Adjacent scenes: body text truncated to 500 chars each

> This prevents token overflow on the OpenRouter side. Document the cap values as named constants at top of file.

## Acceptance Criteria

- [ ] `context-engine.ts` created; `buildContext` handles `scene_only` and `scene_plus_adjacent`
- [ ] Token budget constants defined at top of file (`MAX_CHARACTERS`, `MAX_LOCATIONS`, etc.)
- [ ] Unrecognized policy throws descriptive error
- [ ] `pnpm run check` exits clean
