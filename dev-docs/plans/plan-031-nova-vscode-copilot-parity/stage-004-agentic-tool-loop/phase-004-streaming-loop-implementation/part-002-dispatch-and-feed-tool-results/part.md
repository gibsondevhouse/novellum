---
title: Dispatch and Feed Tool Results
slug: part-002-dispatch-and-feed-tool-results
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-004-streaming-loop-implementation
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 002 — Dispatch and Feed Tool Results

## Objective

Dispatch parsed tool calls through the router, append `tool_result`, and continue the Agent loop.

## Scope

**In scope:**

- Dispatch parsed tool calls through the router, append `tool_result`, and continue the Agent loop.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Dispatch tool calls through `tool-router.ts` only; do not inline handlers in chat service.
2. Append structured `tool_result` messages to the conversation context.
3. Continue streaming until a final assistant response arrives or the cap is reached.
4. Record tool call and result metadata for UI chips.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/services/tool-router.ts`
- `tests/nova/agentic-loop.test.ts`

## Acceptance Criteria

- [ ] A one-tool Agent request completes with tool call, tool result, and final assistant answer.
- [ ] Router errors return tool-result error envelopes the model can recover from.
- [ ] Conversation transcript remains deterministic enough for tests.

## Edge Cases

- If one of multiple tool calls fails, decide whether to continue with partial results or fail the step; document chosen behavior.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
