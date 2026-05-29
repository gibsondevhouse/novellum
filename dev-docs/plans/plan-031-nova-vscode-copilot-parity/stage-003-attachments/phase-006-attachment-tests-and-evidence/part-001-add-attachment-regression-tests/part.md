---
title: Add Attachment Regression Tests
slug: part-001-add-attachment-regression-tests
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-006-attachment-tests-and-evidence
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 001 — Add Attachment Regression Tests

## Objective

Create focused tests for attachment UI state, validation, context inclusion, and disclosure counts.

## Scope

**In scope:**

- Create focused tests for attachment UI state, validation, context inclusion, and disclosure counts.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Test valid `.md` and `.txt` attachments.
2. Test invalid extension, oversize file, malformed payload, dismiss, and clear-on-new-chat.
3. Test project entity attachment appears in context payload.
4. Add a constrained-width visual case for chips above the compact composer.

## Files

**Create:**

- `tests/nova/attachments.test.ts`

**Update:**

- `tests/visual/editor-nova-panel*.test.ts`

## Acceptance Criteria

- [ ] Attachment tests run without network or OpenRouter dependency.
- [ ] Rejected attachments never reach context payload assertions.
- [ ] Visual evidence covers chip wrapping or collapsed behavior.

## Edge Cases

- Mocks should include duplicate entity names across different entity kinds.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
