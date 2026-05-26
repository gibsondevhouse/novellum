---
part: part-001-continuity-agent
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [x] Read `dev-docs/agents-map.md` §ContinuityAgent in full
- [x] Read `dev-docs/context-engine.md` — confirm `continuity_scope` inclusion list
- [x] Read `src/lib/ai/types.ts` — understand all existing types before extending
- [x] Read `src/lib/ai/task-resolver.ts` — confirm action-mapping pattern before adding
- [x] Read `src/lib/ai/prompt-builder.ts` — confirm section-rendering pattern
- [x] Read `src/lib/db/schema.ts` and `db.ts` — note current Dexie version before bumping

## Post-Implementation

- [x] `ConsistencyIssue` interface in `types.ts` matches part.md spec exactly
- [x] Dexie version bumped to 4; `consistency_issues` table declared with full indexes
- [x] `resolveTask('continuity_check_scene', ctx)` returns `{ taskType: 'continuity_check', contextPolicy: 'continuity_scope', ... }`
- [x] Prompt Builder produces a correctly formatted 5-section prompt for `continuity_check`
- [x] Output parser handles: valid JSON array, empty array, malformed JSON (returns `[]`), non-array JSON (returns `[]`)
- [x] Vitest tests pass for prompt construction and output parsing (6 tests)
- [x] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
