---
title: Define Schema
slug: part-001-define-schema
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-contract-schema
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: 0.5d
---

## Objective

Define the `BrainstormAgent` input/output TypeScript interfaces and establish the proposal schema
that will be used throughout the brainstorm pipeline.

## Scope

**In scope:**

- `BrainstormAgentRequest` type (seed idea, context constraints)
- `BrainstormProposal` type (individual creative seed with metadata)
- `BrainstormSession` type (collection of proposals)
- JSON schema validation for the output format
- Type constraints and documentation

**Out of scope:**

- UI component types (defer to stage-002)
- Database persistence schema (defer to later if needed)

## Implementation Steps

1. Review existing agent types in `src/lib/ai/types.ts` for patterns
2. Define `BrainstormAgentRequest` with seed idea and context parameters
3. Define `BrainstormProposal` with category, title, description, and metadata
4. Define `BrainstormSession` as a collection of proposals
5. Add JSDoc comments explaining each field and constraints
6. Create unit test fixtures matching the schema
7. Document examples in `impl.log.md`

## Files

**Update:**

- `src/lib/ai/types.ts` — add agent request/response types

**Create:**

- Tests in `tests/ai/` for schema validation (if needed)

## Acceptance Criteria

- [ ] All types added to `src/lib/ai/types.ts`
- [ ] Types follow existing agent patterns (e.g., `EditAgentRequest`)
- [ ] JSDoc comments are comprehensive
- [ ] Example fixtures created and pass `pnpm test`
- [ ] No TypeScript errors (`pnpm check`)

## Edge Cases

- Empty proposal list (no seeds generated)
- Seeds with missing optional fields
- Seeds with very long descriptions

## Notes

Keep the schema simple and strict. Overly flexible schema will lead to parsing failures
downstream. It's better to constrain now and relax later if needed.
