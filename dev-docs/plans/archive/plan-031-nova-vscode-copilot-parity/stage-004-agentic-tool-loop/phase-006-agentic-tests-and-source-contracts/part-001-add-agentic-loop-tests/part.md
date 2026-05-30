---
title: Add Agentic Loop Tests
slug: part-001-add-agentic-loop-tests
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-006-agentic-tests-and-source-contracts
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 001 — Add Agentic Loop Tests

## Objective

Create tests for Agent tool calls, final responses, cap exhaustion, abort, and error recovery.

## Scope

**In scope:**

- Create tests for Agent tool calls, final responses, cap exhaustion, abort, and error recovery.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Mock model responses for one-tool, multi-tool, no-tool, malformed-tool, and cap-exhaustion cases.
2. Assert tool calls dispatch through the router and return final answer plus proposal artifacts where expected.
3. Assert Ask and Write routes do not advertise or execute tools.

## Files

**Create:**

- `tests/nova/agentic-loop.test.ts`
- `tests/nova/tool-handlers.test.ts`

**Update:**

- `tests/nova/*`

## Acceptance Criteria

- [ ] Agentic loop tests run without network access.
- [ ] All loop terminal states are covered.
- [ ] Tests prove no tool execution path exists outside Agent mode.

## Edge Cases

- Model mock should include unexpected tool name to verify router rejection.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
