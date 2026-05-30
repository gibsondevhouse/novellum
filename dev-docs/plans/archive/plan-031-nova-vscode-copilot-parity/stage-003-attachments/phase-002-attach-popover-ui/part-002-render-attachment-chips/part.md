---
title: Render Attachment Chips
slug: part-002-render-attachment-chips
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-attach-popover-ui
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 002 — Render Attachment Chips

## Objective

Render selected attachments as dismissible chips above the composer input and below the message log boundary.

## Scope

**In scope:**

- Render selected attachments as dismissible chips above the composer input and below the message log boundary.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Render entity and file chips with labels, type icons or text, and dismiss buttons.
2. Wrap chips without making the composer taller than necessary.
3. Expose attachment count to disclosure logic for later context wiring.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/ContextDisclosurePill.svelte`

## Acceptance Criteria

- [ ] Chips are visible, dismissible, and do not crowd the action row.
- [ ] Chip remove actions are keyboard accessible.
- [ ] Duplicate labels remain distinguishable by type or secondary metadata.

## Edge Cases

- More than five chips should wrap or collapse gracefully; do not allow horizontal panel overflow.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
