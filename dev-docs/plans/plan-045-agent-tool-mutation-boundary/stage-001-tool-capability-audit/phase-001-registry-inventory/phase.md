---
title: Registry Inventory
slug: phase-001-registry-inventory
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-001-tool-capability-audit
parts:
  - part-001-registry-inventory
estimated_duration: TBD
---

## Goal

Inventory every registered Nova Agent mode tool and the APIs each handler can reach.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Registry Inventory](part-001-registry-inventory/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Every registered tool is listed.
- [ ] Each tool includes route/API reachability.
- [ ] Mutation-suspect tools are flagged.

## Notes

Create the tool registry baseline needed to identify unsafe model-callable mutations.
