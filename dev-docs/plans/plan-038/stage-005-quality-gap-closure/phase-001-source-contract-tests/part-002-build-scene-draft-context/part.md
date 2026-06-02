---
title: buildSceneDraftContext Unit Test
slug: part-002-build-scene-draft-context
part_number: 2
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-source-contract-tests
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Cover `buildSceneDraftContext` in `src/lib/ai/pipeline/author-draft-context.ts` with a
unit test using an in-memory SQLite database. The function has non-trivial logic that is
currently untested.

## Scope

**Create:**

- `tests/ai/pipeline/author-draft-context.test.ts`

## Logic to Test

1. **`targetWordCount` computation** — Chapter `targetLength` metadata / number of scenes
   in chapter. Assert correct division and rounding.

2. **Metadata key aliasing** — Chapter metadata may store quick intent as `quickIntent`
   or `quick-intent`. Assert both keys are resolved correctly to `quickIntent`.

3. **`priorSceneSummary` selection** — The function picks the summary of the previous
   scene (by order) within the same chapter. Assert correct scene is selected when multiple
   scenes exist, and `null` when the target scene is the first.

4. **Canon refs assembly** — Characters, locations, and factions associated with the scene
   are collected into `canonRefs`. Assert the assembled lists are correct.

5. **`continuity.unresolvedThreads`** — After stage-005-phase-002-part-001 populates
   this from `plot_threads`, assert the returned list matches open threads for the project.

## Acceptance Criteria

- [ ] Test file created at `tests/ai/pipeline/author-draft-context.test.ts`.
- [ ] All five logic branches have passing test cases.
- [ ] Tests use in-memory SQLite (no file I/O, no HTTP mocks needed).
- [ ] `pnpm test` passes — no regressions.

## Notes

Test item 5 (unresolvedThreads) is a dependency on part-002-phase-001. Write the test
with a placeholder/skip if implementing in isolation before part-002-phase-002 is done,
then remove the skip once the feature is implemented.
