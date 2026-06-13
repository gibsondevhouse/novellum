---
title: Capability Schema
slug: phase-001-capability-schema
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-002-tool-policy-contract
parts:
  - part-001-capability-schema
estimated_duration: TBD
---

## Goal

Add explicit capability metadata to tool definitions.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Capability Schema](part-001-capability-schema/part.md) | `complete` | — | TBD |

## Acceptance Criteria

- [x] All product tools declare capability class.
- [x] Registry tests enforce metadata.
- [x] Existing read/generate tools remain callable.

## Notes

Make mutation boundaries enforceable by code rather than convention.
