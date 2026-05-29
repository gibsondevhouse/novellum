---
title: Handle Entity Loading and Empty States
slug: part-002-handle-entity-loading-and-empty-states
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-003-project-entity-attachments
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 002 — Handle Entity Loading and Empty States

## Objective

Make entity attachment behavior honest when repositories are empty, loading, or unavailable.

## Scope

**In scope:**

- Make entity attachment behavior honest when repositories are empty, loading, or unavailable.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Add loading state while candidates are fetched.
2. Add empty states by entity category.
3. Add safe error state with retry where appropriate.
4. Ensure unavailable entity data does not block file attachment.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaAttachmentPopover.svelte`
- `src/modules/nova/components/NovaComposer.svelte`

## Acceptance Criteria

- [ ] No project, empty project, and fetch error states are visually distinct.
- [ ] The user is never shown a selectable fake entity.
- [ ] Attachment popover remains usable when one category fails.

## Edge Cases

- A partially loaded candidate list should not create duplicate attachments on retry.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
