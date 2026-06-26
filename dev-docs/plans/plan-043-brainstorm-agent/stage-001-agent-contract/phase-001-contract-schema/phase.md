---
title: Contract & Schema
slug: phase-001-contract-schema
phase_number: 1
status: review
owner: Planner Agent
stage: stage-001-agent-contract
parts:
  - part-001-define-schema
estimated_duration: 0.5d
---

## Goal

Define the `BrainstormAgent` contract and output schema that captures creative seeds
(premise variants, thematic threads, genre hooks, protagonist sketches).

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Define Schema](part-001-define-schema/part.md) | `review` | Codex | 0.5d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] `BrainstormAgentRequest` and `BrainstormProposal` types added to `src/lib/ai/types.ts`
- [ ] Schema documented and validated in tests
- [ ] Output structure matches the proposal hierarchy

## Notes

The schema should be strict and well-constrained to ensure reliable parsing. Define categories
like `premiseVariants`, `thematicThreads`, `genreHooks`, and `protagonistSketches`.
