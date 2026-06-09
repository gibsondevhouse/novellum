---
title: Surface Audit
slug: stage-001-surface-audit
stage_number: 1
status: draft
owner: Planner Agent
plan: plan-043-outline-pipeline-consolidation
phases:
  - phase-001-call-site-inventory
  - phase-002-contract-risk-map
estimated_duration: TBD
risk_level: medium
---

## Goal

Inventory every outline generation, outline artifact, and outline materialization path so the expanded plan can retire legacy behavior without breaking hidden callers.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Call-Site Inventory](phase-001-call-site-inventory/phase.md) | `draft` | TBD |
| 002 | [Contract Risk Map](phase-002-contract-risk-map/phase.md) | `draft` | TBD |

## Entry Criteria

- Plan scaffold exists.
- Current outline generation and apply routes are identifiable by source search.

## Exit Criteria

- All outline-related routes, services, UI cards, stores, and tests are mapped.
- Legacy and canonical behaviors are classified explicitly.
- Follow-up stages have enough evidence to choose removal, redirect, or compatibility handling.

## Notes

Start with `/api/nova/outline/apply`, `NovaOutlineCard`, `applyAuthorOutlineArtifact`, `author-outline`, `/api/ai/outline/generate`, and `acceptOutlineCheckpointMaterialization`.

