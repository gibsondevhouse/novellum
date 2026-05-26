---
title: AI System Docs
slug: phase-002-ai-system-docs
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-003-modules-and-systems
parts:
  - part-001-ai-pipeline-and-prompts
  - part-002-agents-map
estimated_duration: 1d
---

## Goal

Refresh `ai-pipeline.md`, `context-engine.md`, `prompt-system.md`, and `agents-map.md` so they match `src/lib/ai/**` and the runtime roster in `AGENTS.md`.

## Parts

| #   | Part                                                                  | Status  | Assigned To | Est. Duration |
| --- | --------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Pipeline & Prompts](part-001-ai-pipeline-and-prompts/part.md)        | `draft` | ai          | 0.5d          |
| 002 | [Agents Map](part-002-agents-map/part.md)                             | `draft` | ai          | 0.5d          |

## Acceptance Criteria

- [ ] `ai-pipeline.md` reflects `ContextEngine → PromptBuilder → ModelRouter → OpenRouter`.
- [ ] `prompt-system.md` enumerates the five-section prompt contract (ROLE / TASK / CONTEXT / CONSTRAINTS / OUTPUT FORMAT).
- [ ] `agents-map.md` matches the runtime agent roster in `AGENTS.md`.
