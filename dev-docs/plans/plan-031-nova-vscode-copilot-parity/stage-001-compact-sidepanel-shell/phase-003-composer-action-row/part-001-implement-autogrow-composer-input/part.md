---
title: Implement Auto-Grow Composer Input
slug: part-001-implement-autogrow-composer-input
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-003-composer-action-row
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Implement Auto-Grow Composer Input

## Objective

Change the composer textarea from pre-sized prototype height to a single-line auto-grow control with a capped maximum height.

## Scope

**In scope:**

- Change the composer textarea from pre-sized prototype height to a single-line auto-grow control with a capped maximum height.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Set textarea min-height to the compact target of approximately 32px using tokens.
2. Auto-grow up to approximately 144px and then allow internal scrolling.
3. Preserve Enter-to-send and Shift+Enter newline behavior.
4. Add or update tests for empty, one-line, multi-line, and disabled states.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaComposer.svelte`
- `tests/nova/*composer*.test.ts`

## Acceptance Criteria

- [ ] Composer starts as a single-line input at 360px width.
- [ ] Composer grows only when content requires it and does not push controls off-screen.
- [ ] Keyboard send/newline behavior remains unchanged and tested.

## Edge Cases

- Long pasted text must not expand the panel indefinitely; it should cap and scroll within the input.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
