---
title: Implement Mode Keyboard Cycle
slug: part-002-implement-mode-keyboard-cycle
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-mode-ui-and-keyboard
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 002 — Implement Mode Keyboard Cycle

## Objective

Add `Cmd+.` mode cycling to speed keyboard-heavy author workflows while preserving normal text input behavior.

## Scope

**In scope:**

- Add `Cmd+.` mode cycling to speed keyboard-heavy author workflows while preserving normal text input behavior.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Add keyboard handler for `Cmd+.` / platform equivalent cycle order Ask → Write → Agent → Ask.
2. Prevent conflict with IME, browser shortcuts, or focused popover controls.
3. Announce mode change with accessible live text or visible hint.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaComposer.svelte`
- `tests/nova/mode-routing.test.ts`

## Acceptance Criteria

- [x] Keyboard shortcut cycles modes in the expected order.
- [x] Shortcut does not insert stray characters into composer input.
- [x] Mode change is test-covered and does not submit the message.

## Edge Cases

- On Windows/Linux, evaluate whether Ctrl+. should be supported or explicitly deferred.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
