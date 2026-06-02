---
title: Task Definitions — Agent Role and Constants
slug: phase-001-task-definitions
phase_number: 1
status: complete
owner: AI Agent
stage: stage-001-agentic-surface
parts:
  - part-001-agent-role-copy
estimated_duration: 2h
---

## Goal

Update the `agent` task role text, system-instruction descriptions, and `prose_plus_scene_sidecar`
output format string so all three actively encourage tool use and accurately describe the sidecar schema.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Agent Role & Constants](part-001-agent-role-copy/part.md) | `complete` | AI Agent | 2h |

## Acceptance Criteria

- [x] `TASK_MAP.agent.role` in `task-resolver.ts` encourages tool calls, does not disclaim them.
- [x] `SYSTEM_INSTRUCTIONS.agent` array entries describe tool-call behaviour positively.
- [x] `TASK_DESCRIPTIONS.agent` entry matches the new framing.
- [x] `OUTPUT_FORMAT_DESCRIPTIONS.prose_plus_scene_sidecar` describes all seven sidecar fields.

## Notes

Completed by Codex during the initial plan-038 implementation pass.
