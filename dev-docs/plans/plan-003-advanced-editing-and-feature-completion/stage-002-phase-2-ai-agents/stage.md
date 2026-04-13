---
title: Phase 2 AI Agents
slug: stage-002-phase-2-ai-agents
stage_number: 2
status: complete
owner: AI Agent
plan: plan-003-advanced-editing-and-feature-completion
phases:
  - phase-001-continuity-and-summary-agents
  - phase-002-consistency-engine-ui
estimated_duration: 6d
---

## Goal

Implement the two remaining Phase 2 AI agents — ContinuityAgent and SummaryAgent — through the existing pipeline, and build the Consistency Engine UI to surface detected issues to the user. This stage marks the completion of all Phase 2 roadmap commitments.

## Phases

| #   | Phase                                                                           | Status  |
| --- | ------------------------------------------------------------------------------- | ------- |
| 001 | [Continuity & Summary Agents](phase-001-continuity-and-summary-agents/phase.md) | `draft` |
| 002 | [Consistency Engine UI](phase-002-consistency-engine-ui/phase.md)               | `draft` |

## Entry Criteria

- stage-001 complete: entity CRUD UI working; chapters, scenes, characters, lore, plot threads, timeline events all navigable
- plan-002 AI pipeline in place: Task Resolver, Context Engine, Prompt Builder, Model Router all tested
- `AiTask`, `AiContext`, `ContextPolicy` types defined in `src/lib/ai/types.ts`

## Exit Criteria

- ContinuityAgent can detect timeline conflicts, character inconsistencies, and lore violations in a scene or chapter
- SummaryAgent can produce scene summaries, chapter summaries, and outline backfill
- Consistency Engine UI displays the issue list with type, severity, and location
- User can mark issues as resolved or dismissed
- All AI results go through the accept/reject review flow — no silent auto-apply
- Tests cover ContinuityAgent output parsing and SummaryAgent prompt construction

## Technical Notes

- Both agents extend `TaskType` in `src/lib/ai/types.ts` — add `continuity_check` and `summarize`
- ContinuityAgent uses `chapter_scope` or `continuity_scope` context policy depending on scope
- SummaryAgent uses `scene_only` or `chapter_scope` context policy
- Issue storage: add `ConsistencyIssue` entity to Dexie schema (new version bump)
- UI: Consistency Engine panel lives in its own module `src/modules/consistency/`
