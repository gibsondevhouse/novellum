---
title: Parser Tests
slug: part-002-parser-tests
part_number: 2
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-002-prompt-parser
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: 0.2d
---

## Objective

Implement the `BrainstormAgent` response parser that reliably deserializes and validates
brainstorm output from the model.

## Scope

**In scope:**

- Create `parseBrainstormOutput()` function
- Validate response against `BrainstormSession` schema
- Handle edge cases (malformed JSON, missing fields, etc.)
- Create comprehensive test suite (`tests/ai/brainstorm-agent.test.ts`)
- Ensure parser never silently fails

**Out of scope:**

- Prompt engineering (that's part-001)
- UI integration (that's stage-002)

## Implementation Steps

1. Add `parseBrainstormOutput()` to `src/lib/ai/brainstorm-agent.ts`
2. Use runtime validation (e.g., `zod`, `ts-runtime`, or manual checks)
3. Handle JSON parsing errors gracefully
4. Validate each proposal against schema constraints
5. Return typed `BrainstormSession` or throw clear error
6. Create test fixtures with:
   - Valid output
   - Invalid JSON
   - Missing fields
   - Extra fields
   - Empty proposals
7. Achieve >90% code coverage
8. Run `pnpm test` to verify

## Files

**Update:**

- `src/lib/ai/brainstorm-agent.ts` — add parser function

**Create:**

- `tests/ai/brainstorm-agent.test.ts` — comprehensive parser tests

## Acceptance Criteria

- [ ] Parser function implemented and exported
- [ ] Validates against `BrainstormSession` schema
- [ ] Handles all edge cases without silent failures
- [ ] Test suite covers >90% of parser logic
- [ ] `pnpm test` passes with all tests passing
- [ ] `pnpm check` passes with zero errors

## Edge Cases

- Malformed JSON (parser throws with clear message)
- Missing required fields (parser throws)
- Extra fields (parser accepts and ignores)
- Empty proposals array (parser accepts)
- Very long strings (parser accepts, UI truncates)

## Notes

The parser is the reliability boundary between the model and the UI. Be defensive here.
Better to error early with a clear message than to silently fail with corrupted data.
