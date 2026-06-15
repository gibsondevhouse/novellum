---
title: Define AI Request & Response Types
slug: part-001-define-ai-contract-types
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-define-contracts-and-task-types
estimated_duration: 0.5d
---

## Objective

Define the governed controller request and response contracts, including task
status constants, target/source taxonomies, artifact status constants, and
structured error codes.

## Scope

**In scope:**
- Implement behavior described in this part

**Out of scope:**
- Refactoring unrelated modules
- Changing UX beyond minimal surfaces

## Implementation Steps

1. Inspect existing AI pipeline and agent runtime contracts for status, artifact, and response patterns.
2. Create the server-side controller contract module under `src/lib/server/ai/controller/`.
3. Add focused Vitest coverage for status taxonomies, terminal status detection, request examples, and response envelopes.
4. Run the focused test and relevant repo quality gates.

## Files

**Create:**
- `src/lib/server/ai/controller/contracts.ts`
- `tests/ai/controller/contracts.test.ts`

**Update:**
- none

## Data / Contract Notes

- Controller status names are explicit and include `awaiting_review`, `accepted`, `rejected`, `blocked`, `failed`, and `cancelled`.
- Artifact statuses remain separate from task statuses so review-gated proposals can be referenced without implying a completed controller run.
- Response envelopes are discriminated by `ok` and carry redacted-safe error metadata.

## Acceptance Criteria

- [x] Specified files are created/updated in the repository.
- [x] Part objectives are fulfilled without violating plan guardrails.
- [x] Relevant unit or integration tests are added and pass.

## Edge Cases

- none

## Verification

- Run the smallest relevant test first, then applicable plan gates.

## Notes

