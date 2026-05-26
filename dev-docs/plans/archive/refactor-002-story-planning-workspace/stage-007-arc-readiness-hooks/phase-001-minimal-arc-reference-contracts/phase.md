---
title: Minimal Arc Reference Contracts
slug: phase-001-minimal-arc-reference-contracts
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-007-arc-readiness-hooks
parts:
  - part-001-arc-hook-extensions
estimated_duration: 2d
---

## Goal

Introduce lightweight arc metadata hooks that preserve future expansion paths while keeping current UI calm.

## Parts

- 001: [Arc Hook Extensions](part-001-arc-hook-extensions/part.md) (`draft`, Frontend Agent, 2d)

## Acceptance Criteria

- [ ] Optional arc reference fields exist in relevant planning entities
- [ ] UI affordance for arc tagging readiness is available but unobtrusive
- [ ] Existing planning flows remain unchanged when arc data is absent

## Notes

Keep contracts additive and optional to minimize migration complexity.
