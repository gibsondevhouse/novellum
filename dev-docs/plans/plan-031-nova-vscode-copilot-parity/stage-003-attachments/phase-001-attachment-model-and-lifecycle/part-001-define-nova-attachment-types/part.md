---
title: Define Nova Attachment Types
slug: part-001-define-nova-attachment-types
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-attachment-model-and-lifecycle
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 001 — Define Nova Attachment Types

## Objective

Introduce `NovaAttachment` and payload types for entity and file attachments.

## Scope

**In scope:**

- Introduce `NovaAttachment` and payload types for entity and file attachments.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Define `NovaAttachment` with `id`, `kind`, `label`, `payload`, and enough metadata for disclosure and truncation.
2. Separate entity payloads from file payloads; do not store raw File objects in durable state.
3. Add type guards or validators for attachment payloads crossing service boundaries.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/types.ts`
- `src/lib/ai/context*`
- `tests/nova/attachments.test.ts`

## Acceptance Criteria

- [ ] Entity and file attachments have explicit typed payloads.
- [ ] Attachment IDs are stable within a conversation and collision-resistant enough for chip dismissal.
- [ ] Types do not expose client-only File objects to server routes.

## Edge Cases

- Duplicate labels from different entity types must remain distinguishable.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
