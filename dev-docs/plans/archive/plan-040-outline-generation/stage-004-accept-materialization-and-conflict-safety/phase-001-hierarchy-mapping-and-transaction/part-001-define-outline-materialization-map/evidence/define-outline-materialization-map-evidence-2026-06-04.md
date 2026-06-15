# Define Outline Materialization Map Evidence — 2026-06-04

## Summary

Implemented a pure server-side outline materialization mapper in `src/lib/server/outline/outline-materialization-map.ts`.

The mapper converts validated `OutlineDraft` payloads into deterministic hierarchy row objects for:

- `arcs`
- `acts`
- default one-per-act `milestones`
- `chapters`
- `scenes`
- scene-scoped intent metadata sidecars

It intentionally emits no `beats` or `stages` for V1 because the current outline generation contract does not generate those layers and `stages.beatId` is required by the canonical hierarchy.

## Mapping Decisions

- Generated arc, act, chapter, and scene ids are preserved as canonical materialized ids.
- Sort order is deterministic: `order`, then `title`, then `id`.
- Duplicate ids across any generated hierarchy node throw `OutlineMaterializationMapError`.
- Empty child collections are rejected before materialization map output, preventing parent or leaf rows that cannot form a usable accepted hierarchy.
- Scene intent is emitted as `project_metadata` sidecars with `scope = scene`, `ownerId = materialized scene id`:
  - `quickIntent`: `{ goal, obstacle, conflict, turn, outcome }`
  - `quick-intent`: compatibility alias with the same value
  - `clarity`: `{ sceneGoal, immediateObstacle, turningPoint, outcome }`
- The mapper imports no DB modules and performs no writes. The accept route in the next part will own transaction boundaries, conflict checks, JSON encoding, and checkpoint lifecycle mutation.

## Verification

Focused mapper tests:

```text
pnpm test tests/server/outline/outline-materialization-map.test.ts

Test Files  1 passed (1)
Tests       5 passed (5)
```

Adjacent plan-038 compatibility tests:

```text
pnpm test tests/ai/pipeline/author-draft-context.test.ts

Test Files  1 passed (1)
Tests       16 passed (16)
```

Type/Svelte check:

```text
pnpm check

svelte-check found 0 errors and 11 warnings in 3 files
```

The 11 warnings are pre-existing world-building/help warnings unrelated to this server/doc part.

Lint:

```text
pnpm lint

Passed.
```

`pnpm lint:css` and `pnpm check:tokens` were not run for this part because no UI or style files changed.
