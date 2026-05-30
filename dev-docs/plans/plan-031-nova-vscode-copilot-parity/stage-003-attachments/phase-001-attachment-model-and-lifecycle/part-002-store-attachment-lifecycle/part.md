---
title: Store Attachment Lifecycle
slug: part-002-store-attachment-lifecycle
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-attachment-model-and-lifecycle
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 002 — Store Attachment Lifecycle

## Objective

Add session state for adding, dismissing, counting, and clearing attachments per conversation.

## Scope

**In scope:**

- Add session state for adding, dismissing, counting, and clearing attachments per conversation.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Add attachment state to the Nova session store using Svelte 5 runes conventions.
2. Support add, remove, clear-on-new-chat, and clear-on-send decision points.
3. Default to per-conversation attachments cleared on new chat; do not persist across sessions.
4. Add tests for dismiss and new-conversation clearing.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/services/chat-service.ts`

## Acceptance Criteria

- [ ] Attachments can be added and removed without mutating unrelated session state.
- [ ] New chat clears all attachments.
- [ ] Attachments are not persisted across projects or browser sessions unless a later plan changes that contract.

## Edge Cases

- If send fails, attachments should remain available for retry unless the user manually clears them.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
