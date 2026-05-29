---
title: Build Accessible Attach Popover
slug: part-001-build-accessible-attach-popover
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-attach-popover-ui
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 001 — Build Accessible Attach Popover

## Objective

Make the `+` button open a compact popover with Project and Upload tabs that meets keyboard and focus expectations.

## Scope

**In scope:**

- Make the `+` button open a compact popover with Project and Upload tabs that meets keyboard and focus expectations.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Create a popover anchored to the attach button.
2. Add tabs for `From project` and `Upload` with roving/focusable controls.
3. Close on Escape and outside click while preserving selected attachments.
4. Display empty, loading, and error states without layout jump.

## Files

**Create:**

- `src/modules/nova/components/NovaAttachmentPopover.svelte`

**Update:**

- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/*Attachment*.svelte`

## Acceptance Criteria

- [ ] Attach button opens and closes popover reliably.
- [ ] Tabs are keyboard accessible and screen-reader named.
- [ ] Popover does not overflow the sidepanel at 280px width.

## Edge Cases

- If project context is absent, the Project tab shows a no-project state but Upload remains available.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
