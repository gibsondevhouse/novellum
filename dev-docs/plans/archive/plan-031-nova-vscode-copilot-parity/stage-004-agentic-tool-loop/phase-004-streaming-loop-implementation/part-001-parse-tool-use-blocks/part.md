---
title: Parse Tool Use Blocks
slug: part-001-parse-tool-use-blocks
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-004-streaming-loop-implementation
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 001 — Parse Tool Use Blocks

## Objective

Teach Agent mode streaming to detect model tool-use requests while preserving normal streamed assistant text.

## Scope

**In scope:**

- Teach Agent mode streaming to detect model tool-use requests while preserving normal streamed assistant text.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Identify OpenRouter-compatible tool-use response shape currently returned by the model route.
2. Parse tool-use blocks only when mode is Agent and tools were advertised.
3. Keep non-tool responses streaming normally.
4. Add tests for text-only, one-tool, malformed-tool, and multiple-tool responses.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/chat-service.ts`
- `src/lib/ai/model-router.ts`
- `tests/nova/agentic-loop.test.ts`

## Acceptance Criteria

- [ ] Ask and Write modes never enter tool parsing path.
- [ ] Agent mode can distinguish final text from tool-use requests.
- [ ] Malformed tool requests become visible errors rather than silent failure.

## Edge Cases

- A model that emits prose plus tool use in the same step should preserve visible reasoning summary but not chain-of-thought.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
