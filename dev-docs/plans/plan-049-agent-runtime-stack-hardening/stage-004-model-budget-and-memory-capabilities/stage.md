---
title: Model, Budget & Memory Capabilities
slug: stage-004-model-budget-and-memory-capabilities
stage_number: 4
status: draft
owner: Planner Agent
plan: plan-049-agent-runtime-stack-hardening
phases:
  - phase-001-model-capability-registry
  - phase-002-search-memory-baseline
estimated_duration: TBD
risk_level: medium
---

## Goal

Give the runtime enough local capability metadata, budget controls, and search/memory infrastructure to route agent work safely.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Model Capability Registry](phase-001-model-capability-registry/phase.md) | `draft` | TBD |
| 002 | [Search Memory Baseline](phase-002-search-memory-baseline/phase.md) | `draft` | TBD |

## Entry Criteria

- Runtime ledger and worker contracts identify where model, usage, and context metadata are needed.
- Existing provider abstraction remains the integration boundary.

## Exit Criteria

- Model selection can account for tools, JSON schema, streaming, context length, provider, and budget constraints.
- Token and cost estimates are captured before runs and reconciled after provider responses.
- Local SQLite FTS provides a tested baseline for project memory/search.

## Notes

Embeddings are not required for this stage. Add vector search only after FTS evidence shows a real retrieval gap.
