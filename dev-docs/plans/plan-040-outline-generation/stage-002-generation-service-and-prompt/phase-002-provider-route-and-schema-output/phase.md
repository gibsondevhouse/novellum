---
title: Provider Route & Schema Output
slug: phase-002-provider-route-and-schema-output
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-002-generation-service-and-prompt
parts:
  - part-001-author-outline-generation-prompt
  - part-002-implement-outline-generation-route
  - part-003-add-generation-runner-service
estimated_duration: 2d
---

## Goal

Implement the provider-backed generation route, prompt contract, repair pass, and checkpoint persistence for valid outline drafts.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Author Outline Generation Prompt](part-001-author-outline-generation-prompt/part.md) | `complete` | AI Agent | 0.5d |
| 002 | [Implement Outline Generation Route](part-002-implement-outline-generation-route/part.md) | `complete` | Backend Agent | 1d |
| 003 | [Add Generation Runner Service](part-003-add-generation-runner-service/part.md) | `complete` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [x] All parts reach `complete` with evidence artifacts.
- [x] Phase implementation remains inside declared repo/module boundaries.
- [x] Any deviation from planned files is documented in the relevant `impl.log.md`.
- [x] Required tests for the phase pass or have a reviewer-approved waiver.

## Notes

Treat this phase as blocked if an upstream contract is missing or contradicts current source. Source code wins over stale documentation; capture the mismatch in evidence before proceeding.
