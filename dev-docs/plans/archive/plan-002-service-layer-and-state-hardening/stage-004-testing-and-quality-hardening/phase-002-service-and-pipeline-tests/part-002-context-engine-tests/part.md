---
title: Context Engine Tests
slug: part-002-context-engine-tests
part_number: 2
status: complete
owner: Backend Agent
phase: phase-002-service-and-pipeline-tests
estimated_duration: 1d
---

## Objective

Write unit tests for `src/lib/ai/context-engine.ts` covering all four context policies. Tests exercise the real repository layer with `fake-indexeddb` — no mocking.

## Test File

`src/lib/ai/context-engine.test.ts`

## Test Scenarios Required

### Seed data helper

Create a `seedProject()` helper in the test file that inserts:

- 1 Project
- 2 Chapters (ch1, ch2)
- 3 Scenes in ch1 (ordered 1, 2, 3) and 1 Scene in ch2
- 2 Beats in Scene 1
- 2 Characters
- 1 Location
- 1 LoreEntry
- 1 PlotThread

### Policy tests (`scene_only`)

- Returns active scene and its beats
- Returns referenced characters and locations (not all project characters)
- Returns empty `adjacentScenes`

### Policy tests (`scene_plus_adjacent`)

- Returns prev and next scenes when they exist
- Returns only prev when at last scene (no next)
- Returns only next when at first scene (no prev)

### Policy tests (`chapter_scope`)

- Returns all scenes in the chapter
- De-duplicates characters referenced across scenes

### Policy tests (`continuity_scope`)

- Returns all scenes across the project
- Includes LoreEntry and PlotThread records

### Error case

- Throws for unknown policy string

## Acceptance Criteria

- [ ] Test file created with all scenarios above
- [ ] `pnpm run test` passes with zero failures
- [ ] Coverage ≥80% for `context-engine.ts` — attach `evidence/coverage-context-engine-YYYY-MM-DD.txt`
