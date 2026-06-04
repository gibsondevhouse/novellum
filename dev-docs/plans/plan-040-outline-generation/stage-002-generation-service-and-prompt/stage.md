---
title: Generation Service & Prompt
slug: stage-002-generation-service-and-prompt
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-040-outline-generation
phases:
  - phase-001-context-sufficiency-and-assembly
  - phase-002-provider-route-and-schema-output
estimated_duration: 3d
risk_level: high
---

## Goal

Build the outline generation path from scoped project/worldbuilding context through structured OpenRouter output into one reviewable checkpoint.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Context Sufficiency & Assembly](phase-001-context-sufficiency-and-assembly/phase.md) | `complete` | 1d |
| 002 | [Provider Route & Schema Output](phase-002-provider-route-and-schema-output/phase.md) | `complete` | 2d |

## Entry Criteria

- Stage 001 contracts and checkpoint helpers are implemented or accepted for implementation.
- AI pipeline boundaries are confirmed: no direct provider SDK calls and no client-side key access.
- Context sufficiency criteria are approved.

## Exit Criteria

- Generation blocks low-context requests with clear UI-safe reasons.
- Successful model output validates against OutlineDraft schema and persists as a checkpoint only.
- Provider/schema failures return safe errors without raw output leakage.

## Risks

- Primary risk level: `high`.
- Do not start a downstream phase if its input contract is still unresolved.
- Escalate any Critical or High defect that could cause silent writes, provider bypass, client-side key exposure, or partial hierarchy materialization.

## Notes

This stage remains `draft` until implementation starts. Roll status up only when every child phase and part reaches `complete` with evidence.
