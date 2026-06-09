---
title: Call-Site Inventory
slug: phase-001-call-site-inventory
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-001-surface-audit
parts:
  - part-001-call-site-inventory
estimated_duration: TBD
---

## Goal

Produce a complete inventory of every outline generation, artifact, apply, and materialization caller before behavior changes begin.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Call-Site Inventory](part-001-call-site-inventory/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Every outline-related caller found by search is represented in the inventory.
- [ ] Legacy direct-apply surfaces are clearly separated from checkpoint surfaces.
- [ ] The next phase can identify the exact files to modify.

## Notes

Map all outline-related entrypoints and callers so the legacy direct-apply path can be retired without breaking supported user flows.
