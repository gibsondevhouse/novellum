---
title: Specify Scan Input Context Contract
slug: part-001-specify-scan-input-context-contract
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-001-define-scan-context-contract
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.5d
---

## Objective

Define exact input context contract for worldbuild scan requests across project metadata and canon sources.

## Scope

**In scope:**

- Enumerating source fields and publishing typed request contract

**Out of scope:**

- Implementing scan execution UI or persistence flows

## Implementation Steps

1. Inventory available project/canon context sources in existing services
2. Draft typed request contract and source-context envelope fields
3. Document allowed/forbidden context inputs for this feature

## Files

**Create:**

- src/modules/world-building/services/worldbuild-scan-contract.ts

**Update:**

- dev-docs/03-ai/worldbuild-generation.md; dev-docs/plans/plan-037-agentic-worldbuild-scan/plan.md

## Acceptance Criteria

- [x] Scan context contract is explicit and type-safe
- [x] Context discipline guardrails prevent manuscript-wide over-scoping

## Edge Cases

- Missing or sparse project metadata leads to low-value scans

## Notes

Contract must explicitly define behavior when logline/synopsis is missing.
