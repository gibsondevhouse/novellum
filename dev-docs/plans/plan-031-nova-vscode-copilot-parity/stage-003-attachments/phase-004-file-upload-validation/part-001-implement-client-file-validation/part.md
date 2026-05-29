---
title: Implement Client File Validation
slug: part-001-implement-client-file-validation
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-004-file-upload-validation
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 001 — Implement Client File Validation

## Objective

Reject invalid attachments early in the UI while keeping server validation authoritative.

## Scope

**In scope:**

- Reject invalid attachments early in the UI while keeping server validation authoritative.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Limit file picker accept types to `.md,.txt`.
2. Reject files over 100KB before reading content.
3. Read valid files as text only and store parsed content in attachment payload.
4. Show actionable rejection messages for type, size, and read errors.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaAttachmentPopover.svelte`
- `src/modules/nova/types.ts`

## Acceptance Criteria

- [ ] Only `.md` and `.txt` can be attached from the UI.
- [ ] Files larger than 100KB are rejected before being added as chips.
- [ ] Binary or unreadable files do not enter Nova state.

## Edge Cases

- A file with `.txt` extension but unreadable binary content should fail safe and show a rejection message.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
