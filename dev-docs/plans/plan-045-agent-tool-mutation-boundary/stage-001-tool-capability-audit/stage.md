---
title: Tool Capability Audit
slug: stage-001-tool-capability-audit
stage_number: 1
status: review
owner: Planner Agent
plan: plan-045-agent-tool-mutation-boundary
phases:
  - phase-001-registry-inventory
  - phase-002-capability-classification
estimated_duration: TBD
risk_level: medium
---

## Goal

Inventory every Nova Agent mode tool and classify whether it reads, generates review artifacts, or mutates project state.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Registry Inventory](phase-001-registry-inventory/phase.md) | `review` | TBD |
| 002 | [Capability Classification](phase-002-capability-classification/phase.md) | `review` | TBD |

## Entry Criteria

- Current tool registry and agent-loop code are available for inspection.

## Exit Criteria

- [x] All registered tool IDs are listed with capability class and mutation risk.
- [x] Direct and indirect mutation paths are identified.
- [x] The expanded plan knows which tools must remain model-callable and which must move behind UI action.

## Notes

Start with `authorDraft.accept_checkpoint`, `authorDraft.reject_checkpoint`, checkpoint generation tools, project read tools, and proposal tools.
