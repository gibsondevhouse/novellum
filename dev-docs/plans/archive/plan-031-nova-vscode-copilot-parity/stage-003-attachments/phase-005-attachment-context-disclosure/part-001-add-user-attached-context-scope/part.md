---
title: Add User-Attached Context Scope
slug: part-001-add-user-attached-context-scope
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-005-attachment-context-disclosure
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 001 — Add User-Attached Context Scope

## Objective

Convert selected attachments into additive context blocks under the explicit `'user-attached'` scope.

## Scope

**In scope:**

- Convert selected attachments into additive context blocks under the explicit `'user-attached'` scope.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Prepend user-attached context to the existing scoped context payload without replacing project baseline context.
2. Keep attachment blocks labeled by source kind and label.
3. Apply size/truncation accounting so attachment chips do not silently overload the prompt.
4. Record attachment scope counts for disclosure.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/context-hooks.ts`
- `src/lib/ai/context-engine.ts`
- `src/modules/nova/services/chat-service.ts`

## Acceptance Criteria

- [ ] Attached items are present in the model request context.
- [ ] Project baseline context remains included when a project is open.
- [ ] Attachment truncation, if any, is disclosed or logged in context metadata.

## Edge Cases

- Multiple attached files must retain boundaries so the model cannot confuse their source labels.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
