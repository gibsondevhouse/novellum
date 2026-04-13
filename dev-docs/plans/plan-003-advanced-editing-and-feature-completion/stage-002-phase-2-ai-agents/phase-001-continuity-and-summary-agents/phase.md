---
title: Continuity & Summary Agents
slug: phase-001-continuity-and-summary-agents
phase_number: 1
status: complete
owner: AI Agent
stage: stage-002-phase-2-ai-agents
parts:
  - part-001-continuity-agent
  - part-002-summary-agent
estimated_duration: 4d
---

## Goal

Implement ContinuityAgent and SummaryAgent through the existing AI pipeline. Each agent adds a new `TaskType`, defines its context policy, and produces structured output that the UI can display and act on.

## Parts

| #   | Part                                                 | Status     |
| --- | ---------------------------------------------------- | ---------- |
| 001 | [ContinuityAgent](part-001-continuity-agent/part.md) | `complete` |
| 002 | [SummaryAgent](part-002-summary-agent/part.md)       | `complete` |

## Entry Criteria

- All five context policies implemented and tested (plan-002 stage-003)
- `resolveTask()` in `src/lib/ai/task-resolver.ts` handles `TaskType` extensibly
- Prompt Builder tested for all existing task types

## Exit Criteria

- `continuity_check` task type resolves, builds context via `chapter_scope` or `continuity_scope`, constructs a structured prompt, and returns a parseable issue list
- `summarize` task type resolves, builds context via `scene_only` or `chapter_scope`, constructs a structured prompt, and returns a summary string
- Both agents tested: prompt construction verified; output parsing verified for both valid and malformed AI responses
- UI trigger points wired: "Check Continuity" button in scene/chapter toolbar; "Generate Summary" button in outliner
