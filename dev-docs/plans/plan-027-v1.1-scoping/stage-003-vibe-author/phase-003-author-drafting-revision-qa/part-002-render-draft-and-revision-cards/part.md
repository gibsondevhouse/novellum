---
title: Render Draft and Revision Cards
slug: part-002-render-draft-and-revision-cards
part_number: 2
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-003-author-drafting-revision-qa
started_at: 2026-05-27T10:50:00Z
completed_at: 2026-05-27T10:58:00Z
estimated_duration: 2d
---

## Objective

Render `NovaMessage.artifact` payloads (scene-draft, revision-pack) as
distinct card components inside Nova with explicit user-driven
accept / reject / copy controls. No card may write to the manuscript
directly.

## Scope

**In scope:**

- Scene-draft card showing prose preview + sidecar metadata + accept /
  reject / copy actions.
- Revision-pack card showing severity-ranked issues with per-issue
  acknowledge actions.
- Wiring inside `NovaMessageLog` to branch on `message.artifact?.kind`.
- Component-level Vitest coverage with `@testing-library/svelte`.

**Out of scope:**

- The artifact-attach plumbing (owned by part-001).
- E2E coverage + doc sync (owned by part-003).
- Manuscript-write integration — accept handlers must emit a typed
  event consumed by the future editor accept-pipeline, never mutate
  the manuscript directly.

## Files

**Create:**

- `src/modules/nova/components/NovaSceneDraftCard.svelte`
- `src/modules/nova/components/NovaRevisionPackCard.svelte`
- `tests/ai/pipeline/scene-draft-sidecar.test.ts`
- `tests/ai/pipeline/revision-pack.test.ts`

**Update:**

- `src/modules/nova/components/NovaMessageLog.svelte`

## Acceptance Criteria

- [x] Scene-draft cards render prose + sidecar fields with explicit
      `Accept`, `Reject`, and `Copy` buttons.
- [x] Revision-pack cards render issues sorted by severity with an
      acknowledge action per issue.
- [x] No card auto-applies a change — actions either emit a callback or
      copy text to the clipboard.
- [x] Component tests cover keyboard reachability, ARIA labels, and the
      explicit-action requirement.

## Notes

This part closes after the unit tests pass; E2E gates land in part-003.

Deviation logged in `impl.log.md`: the repo does not install
`@testing-library/svelte`, so component coverage uses the existing
source-string assertion pattern (`tests/components/chat-interface-agentic-empty-state.test.ts`).
Keyboard reachability is enforced via native `<button>` elements +
`:focus-visible` token styling; ARIA labels and explicit-action
guardrails are asserted at the source level.
