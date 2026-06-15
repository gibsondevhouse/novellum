---
title: Agentic Surface Stabilization
slug: stage-001-agentic-surface
stage_number: 1
status: complete
owner: AI Agent
plan: plan-038-novel-engine-v1
phases:
  - phase-001-task-definitions
  - phase-002-composer-copy
estimated_duration: 0.5d
risk_level: low
---

## Goal

Remove all self-sabotaging copy that actively discourages agent tool use or labels Agent mode
as "coming soon", and align the `prose_plus_scene_sidecar` output format description with the
actual sidecar schema fields.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Task Definitions](phase-001-task-definitions/phase.md) | `complete` | 2h |
| 002 | [Composer UX Copy](phase-002-composer-copy/phase.md) | `draft` | 1h |

## Entry Criteria

- Nova agent mode is wired to `runAgentLoop` (completed in plan-031).

## Exit Criteria

- All phases complete.
- No string in the shipped UI or prompt system claims agent tools are disabled or "coming soon".
- `prose_plus_scene_sidecar` format description accurately describes the sidecar schema.

## Notes

- Phase 001 was completed by Codex during the initial plan-038 implementation pass.
- Phase 002 (NovaComposer.svelte copy) was missed — two lines remain with "coming soon" text.
