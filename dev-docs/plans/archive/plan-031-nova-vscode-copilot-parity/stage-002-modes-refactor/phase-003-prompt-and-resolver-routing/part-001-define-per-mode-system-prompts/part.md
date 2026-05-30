---
title: Define Per-Mode System Prompts
slug: part-001-define-per-mode-system-prompts
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-003-prompt-and-resolver-routing
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Define Per-Mode System Prompts

## Objective

Update prompt construction so Ask, Write, and Agent have distinct behavior boundaries.

## Scope

**In scope:**

- Update prompt construction so Ask, Write, and Agent have distinct behavior boundaries.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Ask mode: conversational, no tool calls, grounded in project context.
2. Write mode: structured proposal generation for outline, scene, and revision artifacts.
3. Agent mode: multi-step planning and tools allowed only after Stage 004 loop is implemented.
4. Encode no-auto-apply rule in Write and Agent prompts.

## Files

**Create:**

- None expected.

**Update:**

- `src/lib/ai/prompt-builder.ts`
- `src/modules/nova/services/chat-service.ts`
- `tests/ai/*prompt*.test.ts`

## Acceptance Criteria

- [x] Each mode emits a distinct system prompt segment or resolver instruction.
- [x] Ask mode never advertises tools.
- [x] Write and Agent prompts explicitly require proposal envelopes for generated changes.

## Edge Cases

- Until Stage 004 completes, Agent mode may route to a guarded not-yet-enabled path rather than silently behaving like Ask.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
