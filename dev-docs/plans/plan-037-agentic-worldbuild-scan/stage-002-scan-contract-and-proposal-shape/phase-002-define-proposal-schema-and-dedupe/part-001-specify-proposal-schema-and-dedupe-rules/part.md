---
title: Specify Proposal Schema & Dedupe Rules
slug: part-001-specify-proposal-schema-and-dedupe-rules
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-002-define-proposal-schema-and-dedupe
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.75d
---

## Objective

Define proposal payload schema and deterministic dedupe semantics before implementation.

## Scope

**In scope:**

- Schema fields for provenance/lifecycle/payload plus dedupe key strategy

**Out of scope:**

- Notification UI implementation details

## Implementation Steps

1. Draft proposal record types and status transitions
2. Define dedupe keys and duplicate conflict behavior
3. Map category IDs to payload shape constraints

## Files

**Create:**

- src/lib/ai/pipeline/worldbuild-proposal-schema.ts

**Update:**

- src/lib/ai/pipeline/checkpoint-contract.ts; dev-docs/03-ai/worldbuild-generation.md

## Acceptance Criteria

- [x] Proposal schema includes provenance, confidence, reason, and audit fields
- [x] Dedupe rules are deterministic and test-targetable

## Edge Cases

- Semantically duplicate suggestions bypass simple name-only filters

## Notes

Dedupe strategy should specify best-effort semantic handling boundaries.
