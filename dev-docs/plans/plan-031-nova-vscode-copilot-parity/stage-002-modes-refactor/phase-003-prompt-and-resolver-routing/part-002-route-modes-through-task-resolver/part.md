---
title: Route Modes Through Task Resolver
slug: part-002-route-modes-through-task-resolver
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-003-prompt-and-resolver-routing
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 002 — Route Modes Through Task Resolver

## Objective

Replace prompt-regex behavior with explicit routing through `task-resolver.ts` and chat service mode dispatch.

## Scope

**In scope:**

- Replace prompt-regex behavior with explicit routing through `task-resolver.ts` and chat service mode dispatch.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Add mode-aware route selection for Ask, Write, and Agent.
2. Keep Ask path as single-shot chat with grounded context.
3. Route Write to existing pipeline runners where supported.
4. Route Agent to a feature-guarded agent resolver until Stage 004 removes the guard.

## Files

**Create:**

- None expected.

**Update:**

- `src/lib/ai/task-resolver.ts`
- `src/modules/nova/services/chat-service.ts`
- `tests/nova/mode-routing.test.ts`

## Acceptance Criteria

- [x] Mode routing is deterministic and unit-tested.
- [x] Unsupported Write actions return honest unsupported-action state, not hallucinated output.
- [x] Ask/Write behavior does not regress existing context grounding.

## Edge Cases

- Ambiguous Write requests should ask for missing fields or emit a bounded proposal, not mutate scenes.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
