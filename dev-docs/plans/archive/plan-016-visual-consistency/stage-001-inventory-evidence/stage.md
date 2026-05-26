---
title: Inventory and Evidence
slug: stage-001-inventory-evidence
stage_number: 1
status: complete
owner: Architect Agent
plan: plan-016-visual-consistency
phases:
  - phase-001-surface-inventory
  - phase-002-drift-audits
  - phase-003-canonical-rules
estimated_duration: 4d
risk_level: low
---

## Goal

Produce evidence-backed artifacts that answer the primary question of the research brief: _do all Novellum screens look and feel like they belong to the same application?_ Deliver a complete surface inventory, drift-finding tables with file-level attribution, and a canonical visual rules document that every later stage references.

## Phases

| #   | Phase                                                                      | Status  | Est. Duration |
| --- | -------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Surface Inventory](phase-001-surface-inventory/phase.md)                  | `complete` | 1d            |
| 002 | [Drift Audits](phase-002-drift-audits/phase.md)                            | `complete` | 2d            |
| 003 | [Canonical Visual Rules](phase-003-canonical-rules/phase.md)               | `complete` | 1d            |

## Entry Criteria

- Research brief reviewed by the Architect and Stylist agents.
- Current `main` builds, lints, and tests pass — no functional regressions to chase during the audit.

## Exit Criteria

- Surface Inventory Table covers every reachable route and major UI surface with severity ratings.
- Visual Drift Findings captured and grouped by category (shell, card/panel, typography, density, interaction, empty state, workspace, entity, editor, AI).
- Canonical Visual Rules document accepted by the Stylist and Architect agents.
- No production code changes beyond what is required to make otherwise-unreachable routes render for audit purposes.

## Notes

- Audit-only stage. Any code changes are strictly limited to making broken routes render — anything beyond that is deferred to Stages 002–008.
- The canonical rules produced here become the contract for every convergence stage; all later parts must reference them.
