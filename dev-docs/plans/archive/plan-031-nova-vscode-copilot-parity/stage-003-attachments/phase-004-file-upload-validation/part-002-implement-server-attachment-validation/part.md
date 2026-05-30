---
title: Implement Server Attachment Validation
slug: part-002-implement-server-attachment-validation
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-004-file-upload-validation
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 002 — Implement Server Attachment Validation

## Objective

Validate attachment payloads again in `chat-service.ts` or the server request boundary before adding them to context.

## Scope

**In scope:**

- Validate attachment payloads again in `chat-service.ts` or the server request boundary before adding them to context.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Validate kind, label, payload size, declared extension, and plain-text content at the service/server boundary.
2. Reject unknown attachment kinds and malformed payloads.
3. Return structured errors the UI can render without losing the user prompt.
4. Add tests for spoofed file type, oversize payload, unknown kind, and valid markdown/text.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/chat-service.ts`
- `src/routes/api/ai/*`
- `tests/nova/attachments.test.ts`

## Acceptance Criteria

- [ ] Server-side validation rejects invalid payloads even if client checks are bypassed.
- [ ] Valid `.md/.txt` attachments are accepted as plain text only.
- [ ] Error path does not send invalid content to OpenRouter.

## Edge Cases

- Unicode text must remain supported; validation should reject control/binary noise, not normal author prose.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
