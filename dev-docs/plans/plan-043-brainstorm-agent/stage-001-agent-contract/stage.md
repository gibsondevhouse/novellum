---
title: Agent Contract & Prompt
slug: stage-001-agent-contract
stage_number: 1
status: review
owner: Planner Agent
plan: plan-043-brainstorm-agent
phases:
  - phase-001-contract-schema
  - phase-002-prompt-parser
estimated_duration: 1d
risk_level: low
---

## Goal

Define the `BrainstormAgent` contract, output schema, and prompt engineering. Implement the
prompt builder and parser logic that transforms brainstorm output into a structured proposal list.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Contract & Schema](phase-001-contract-schema/phase.md) | `review` | 0.5d |
| 002 | [Prompt & Parser](phase-002-prompt-parser/phase.md) | `review` | 0.5d |

## Entry Criteria

- Plan-042 (Quality Gates Closure) is complete
- `src/lib/ai/` architecture reviewed
- Agent infrastructure (`ContextEngine`, `PromptBuilder`, `ModelRouter`) available

## Exit Criteria

- All phases complete
- `BrainstormAgent` contract defined in `src/lib/ai/types.ts`
- Prompt builder wired and tested
- Parser validates and deserializes brainstorm output correctly
- All quality gates passed

## Notes

This stage is purely contract and infrastructure — no UI yet. Focus on getting the agent
architecture right so stage-002 UI integration is straightforward.
