---
title: Specify Validation & Error Semantics
slug: part-001-specify-validation-and-error-semantics
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-003-define-validation-and-error-contract
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.75d
---

## Objective

Define schema-validation and provider-error semantics for scan/proposal APIs and UI handling.

## Scope

**In scope:**

- Error code taxonomy, user-safe copy, and developer diagnostics contract

**Out of scope:**

- Implementing final UI polish

## Implementation Steps

1. Enumerate validation and provider failure modes
2. Define HTTP/error code mapping and safe user-facing messages
3. Document required developer diagnostics payload fields

## Files

**Create:**

- src/routes/api/worldbuilding/scan/+server.ts

**Update:**

- src/routes/api/worldbuilding/generate/+server.ts; dev-docs/03-ai/worldbuild-generation.md

## Acceptance Criteria

- [x] Validation failures return stable, typed error responses
- [x] Missing credentials and malformed model output follow existing provider patterns

## Edge Cases

- Error handling leaks raw internal detail to end users

## Notes

Developer diagnostics should remain available without exposing sensitive internals in UI copy.
