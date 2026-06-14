---
title: Model Capability Registry
slug: phase-001-model-capability-registry
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-004-model-budget-and-memory-capabilities
parts:
  - part-001-model-capability-registry
estimated_duration: TBD
---

## Goal

Replace ad hoc model selection assumptions with a capability-aware local registry.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Model Capability Registry](part-001-model-capability-registry/part.md) | `draft` | unassigned | TBD |

## Acceptance Criteria

- [ ] Model metadata includes provider, tool support, JSON schema support, streaming support, context length, usage confidence, and cost hints.
- [ ] Runtime routes can reject or reroute tasks when a selected model lacks required capabilities.
- [ ] Budget estimates and provider-reported usage are stored separately.

## Notes

This phase should extend the existing provider abstraction, not replace it.
