---
title: Tool Policy Contract
slug: stage-002-tool-policy-contract
stage_number: 2
status: draft
owner: Planner Agent
plan: plan-045-agent-tool-mutation-boundary
phases:
  - phase-001-capability-schema
  - phase-002-advertisement-filter
  - phase-003-source-contract-tests
estimated_duration: TBD
risk_level: high
---

## Goal

Define and enforce the policy that model-callable tools cannot directly apply manuscript or canon mutations.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Capability Schema](phase-001-capability-schema/phase.md) | `draft` | TBD |
| 002 | [Advertisement Filter](phase-002-advertisement-filter/phase.md) | `draft` | TBD |
| 003 | [Source Contract Tests](phase-003-source-contract-tests/phase.md) | `draft` | TBD |

## Entry Criteria

- Stage 001 classifies tool capabilities.
- Product rule is accepted: model-callable tools may create review artifacts but not accept/apply them.

## Exit Criteria

- Tool definitions expose enough metadata to enforce read/generate/mutate boundaries.
- Tool advertisement excludes mutation tools from model-callable surfaces.
- Tests fail if a model-callable tool imports or invokes mutation APIs directly.

## Notes

The policy should be mechanical enough that future tool registrations cannot accidentally bypass it.

