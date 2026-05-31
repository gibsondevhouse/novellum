---
title: Faction and Lineage Extension
slug: stage-002-faction-lineage-extension
stage_number: 2
status: review
owner: Planner Agent
plan: plan-036-context-priority-generation
phases:
  - phase-001-faction-lineage-context-extension
  - phase-002-draft-validation-hardening
estimated_duration: 1.5d
risk_level: medium
---

## Goal

Apply the context-priority model beyond Characters so Faction and Lineage generation can also be guided by target/avoid entity hints while respecting current persistence contracts.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Faction/Lineage Context Extension](phase-001-faction-lineage-context-extension/phase.md) | `review` | 0.75d |
| 002 | [Draft Validation Hardening](phase-002-draft-validation-hardening/phase.md) | `review` | 0.75d |

## Entry Criteria

- Stage 001 complete and merged locally.
- Context contract and dialog plumbing available for reuse.

## Exit Criteria

- Faction/lineage prompting consumes context-priority hints.
- Validation layer rejects or normalizes malformed drafts before UI consumption.
- No cross-kind regressions in generation flow.

## Notes

Factions and lineages currently persist under different contracts (`/api/db/factions` and `project_metadata`), so this stage focuses on generation quality and safety, not schema expansion.
