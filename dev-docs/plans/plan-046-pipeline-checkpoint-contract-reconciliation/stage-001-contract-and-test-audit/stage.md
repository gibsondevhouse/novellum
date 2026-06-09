---
title: Contract & Test Audit
slug: stage-001-contract-and-test-audit
stage_number: 1
status: draft
owner: Planner Agent
plan: plan-046-pipeline-checkpoint-contract-reconciliation
phases:
  - phase-001-route-inventory
  - phase-002-schema-inventory
  - phase-003-failing-spec-classification
estimated_duration: TBD
risk_level: high
---

## Goal

Classify every pipeline checkpoint route, schema, helper, and failing e2e spec before changing behavior.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Route Inventory](phase-001-route-inventory/phase.md) | `draft` | TBD |
| 002 | [Schema Inventory](phase-002-schema-inventory/phase.md) | `draft` | TBD |
| 003 | [Failing Spec Classification](phase-003-failing-spec-classification/phase.md) | `draft` | TBD |

## Entry Criteria

- Current full e2e failures are reproducible.
- Existing pipeline checkpoint services and tests are available for inspection.

## Exit Criteria

- Each checkpoint family has an identified current route and schema.
- Each failing e2e spec is classified as stale fixture, product regression, or unsupported legacy behavior.
- The expanded plan has a route ownership decision for each checkpoint family.

## Notes

Use the current failing generic project-metadata checkpoint specs as evidence, not as an automatic instruction to preserve old contracts.

