# Implement Existing Outline Conflict Preflight Evidence — 2026-06-04

## Summary

Implemented reusable outline hierarchy conflict preflight in `src/lib/server/outline/outline-conflict-preflight.ts`.

The helper counts the canonical hierarchy buckets for a project:

- `arcs`
- `acts`
- `milestones`
- `chapters`
- `scenes`
- `beats`
- `stages`

It classifies the project state as:

- `empty`: no hierarchy rows, accept is allowed.
- `partial`: some hierarchy rows exist, but the core arc/act/chapter/scene spine is incomplete.
- `populated`: core arc/act/chapter/scene rows exist.

Both `partial` and `populated` block accept because Plan 040 has no non-destructive merge mode.

## Route Behavior

- Accept materialization now uses the shared preflight helper before transaction writes.
- Conflict responses return `409` with `code = outline_conflict` and safe metadata: counts, state, total, and conflict summary.
- Outline generation still creates a review checkpoint when hierarchy exists, but successful responses include `outlineConflict` so the UI can warn that the proposal is review-only until conflicts are resolved.
- The Nova generation runner now exposes that warning without importing server modules.

The accept route file itself did not need a direct edit in this part because it delegates error serialization to the materialization service. The behavior changed through the service used by that route.

## Verification

Focused preflight/generation/runner/accept bundle:

```text
pnpm test tests/server/outline/outline-conflict-preflight.test.ts tests/routes/outline-generation.test.ts tests/nova/outline-generation-runner.test.ts tests/routes/outline-accept.test.ts

Test Files  4 passed (4)
Tests       25 passed (25)
```

Type/Svelte check:

```text
pnpm check

svelte-check found 0 errors and 11 warnings in 3 files
```

The 11 warnings are pre-existing world-building/help warnings unrelated to this part.

Lint:

```text
pnpm lint

Passed.
```

`pnpm lint:css` and `pnpm check:tokens` were not run for this part because no UI or style files changed.
