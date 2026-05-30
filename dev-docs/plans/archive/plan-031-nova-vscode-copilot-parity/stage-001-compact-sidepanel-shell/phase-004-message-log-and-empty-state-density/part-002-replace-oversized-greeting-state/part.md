---
title: Replace Oversized Greeting State
slug: part-002-replace-oversized-greeting-state
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-004-message-log-and-empty-state-density
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 002 — Replace Oversized Greeting State

## Objective

Convert the current oversized greeting card into a compact useful starter hint that does not consume most of the panel.

## Scope

**In scope:**

- Convert the current oversized greeting card into a compact useful starter hint that does not consume most of the panel.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Replace or compress greeting card padding from roughly 20px toward 16px or a single-line tip.
2. Show project-attached vs no-project state honestly in the starter hint.
3. Avoid promising attachments, tools, or agent actions before their stage is implemented.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaMessageLog.svelte`

## Acceptance Criteria

- [ ] Empty Nova sidepanel no longer looks like a large marketing card.
- [ ] Starter copy reflects the active project context state.
- [ ] The composer is visible without excessive scrolling on constrained heights.

## Edge Cases

- No-key state must remain actionable and link to the correct AI settings route.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
