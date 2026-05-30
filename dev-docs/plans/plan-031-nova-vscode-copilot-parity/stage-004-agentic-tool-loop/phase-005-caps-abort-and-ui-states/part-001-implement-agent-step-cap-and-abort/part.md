---
title: Implement Agent Step Cap and Abort
slug: part-001-implement-agent-step-cap-and-abort
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-005-caps-abort-and-ui-states
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 001 — Implement Agent Step Cap and Abort

## Objective

Add hard iteration cap, user abort path, and explicit max-step exhaustion state.

## Scope

**In scope:**

- Add hard iteration cap, user abort path, and explicit max-step exhaustion state.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Set Agent loop max steps to 8 unless existing config indicates a lower safe default.
2. Wire composer stop/abort action to the active Agent loop AbortController.
3. Return a visible max-step-exhausted state instead of infinite recursion.
4. Add tests for abort before tool result and cap exhaustion.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/stores/nova-session.svelte.ts`

## Acceptance Criteria

- [ ] Agent loop cannot exceed configured max steps.
- [ ] User can abort mid-loop and the UI reflects aborted state.
- [ ] Abort does not leave composer permanently disabled.

## Edge Cases

- Abort during a router call must not apply partial proposal state as if complete.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
