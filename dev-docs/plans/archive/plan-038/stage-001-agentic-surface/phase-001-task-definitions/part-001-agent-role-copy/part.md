---
title: Agent Role Copy — task-resolver and constants
slug: part-001-agent-role-copy
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-task-definitions
started_at: 2026-06-01
completed_at: 2026-06-01
estimated_duration: 2h
---

## Objective

Replace all copy in the AI task system that claims agent tools are disabled or unavailable with
copy that actively encourages and describes their use.

## Scope

**Updated:**

- `src/lib/ai/task-resolver.ts` — `TASK_MAP.agent.role` text
- `src/lib/ai/constants.ts` — `SYSTEM_INSTRUCTIONS.agent` array (lines ~112, ~129)
- `src/lib/ai/constants.ts` — `TASK_DESCRIPTIONS.agent` (line ~129)
- `src/lib/ai/constants.ts` — `OUTPUT_FORMAT_DESCRIPTIONS.prose_plus_scene_sidecar` (line ~158)

## Acceptance Criteria

- [x] Role text says "Use tool calls when they help" (not "tools are not available").
- [x] System instructions describe tool-call behaviour and failure handling.
- [x] `prose_plus_scene_sidecar` description lists: `sceneId`, `chapterId`, `povCharacterId`,
      `wordCount`, `usedCanonRefs`, `uncertainties`, `continuityRisks`.

## Notes

Verified by code inspection 2026-06-01.
