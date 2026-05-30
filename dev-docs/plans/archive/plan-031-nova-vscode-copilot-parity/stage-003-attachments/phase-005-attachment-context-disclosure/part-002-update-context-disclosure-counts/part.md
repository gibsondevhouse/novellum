---
title: Update Context Disclosure Counts
slug: part-002-update-context-disclosure-counts
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-005-attachment-context-disclosure
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 002 — Update Context Disclosure Counts

## Objective

Expose attachment counts separately from project, scene, outline, and compressed context in the disclosure pill.

## Scope

**In scope:**

- Expose attachment counts separately from project, scene, outline, and compressed context in the disclosure pill.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Add `user-attached` scope count to disclosure metadata.
2. Render clear copy such as `2 attached` without implying RAG ingestion.
3. Test zero, one, and multiple attachment disclosure states.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/ContextDisclosurePill.svelte`
- `src/modules/nova/services/chat-service.ts`
- `tests/nova/attachments.test.ts`

## Acceptance Criteria

- [ ] Disclosure accurately reports attached item count.
- [ ] Attached count is separate from project-derived context count.
- [ ] New chat clears disclosure attachment count.

## Edge Cases

- If an attachment is rejected during server validation, disclosure should not count it as sent.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
