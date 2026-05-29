---
title: Add Mode Pill Control
slug: part-001-add-mode-pill-control
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-mode-ui-and-keyboard
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Add Mode Pill Control

## Objective

Add the Ask/Write/Agent mode pill to the compact action row and make mode affordances legible.

## Scope

**In scope:**

- Add the Ask/Write/Agent mode pill to the compact action row and make mode affordances legible.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Render current mode as a compact pill in the action row.
2. Provide an accessible menu or segmented popover for mode selection.
3. Add one-sentence mode hints without expanding the composer vertically by default.
4. Ensure Agent mode warning copy says proposals only, no auto-apply.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/NovaPanel.svelte`

## Acceptance Criteria

- [x] Mode pill shows Ask, Write, or Agent exactly.
- [x] Changing mode updates placeholder and route state immediately.
- [x] Mode menu is keyboard accessible and screen-reader named.

## Edge Cases

- At 280px width, the mode pill may abbreviate visually but must keep accessible full text.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
