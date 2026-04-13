---
title: Context Policies — Chapter & Continuity
slug: part-003-context-policies-chapter-continuity
part_number: 3
status: complete
owner: AI Agent
phase: phase-001-task-resolver-and-context-engine
estimated_duration: 1d
---

## Objective

Extend `src/lib/ai/context-engine.ts` with the `chapter_scope` and `continuity_scope` context policies. These are the heavier policies used for outline and continuity-check tasks.

## Reference Documents

- `dev-docs/context-engine.md` §chapter_scope, §continuity_scope
- `dev-docs/ai-pipeline.md` §Context Builder

## Policy Specifications

### `chapter_scope`

Fetches:

- All scenes in the active chapter (ordered by `order`)
- Beats for each scene
- All characters referenced across any scene in the chapter (de-duplicated by id)
- All locations referenced across any scene in the chapter
- Chapter metadata (`title`, `summary`)

Hard cap: total character count ≤ 10; total location count ≤ 5; scene body text truncated to 300 chars each.

### `continuity_scope`

Fetches:

- All scenes across the entire project (ordered by chapter order, then scene order)
- Chapter titles and summaries
- All characters (no scene filter)
- All locations (no scene filter)
- All `LoreEntry` records for the project
- All `PlotThread` records for the project

Hard cap: scene body text truncated to 200 chars each; total token budget ≈ 6000 tokens (enforce via total char count ≤ 24000 chars).

## Acceptance Criteria

- [ ] `chapter_scope` handler added to `buildContext` switch
- [ ] `continuity_scope` handler added with full project-wide context assembly
- [ ] Hard caps applied for both policies; cap values added to named constants at top of file
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean
