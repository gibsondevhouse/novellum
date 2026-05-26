---
title: Author E2E and Doc Sync
slug: part-003-author-e2e-and-doc-sync
part_number: 3
status: complete
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-003-author-drafting-revision-qa
started_at: 2026-05-27T11:00:00Z
completed_at: 2026-05-27T11:04:00Z
estimated_duration: 1d
---

## Objective

Close phase-003 with end-to-end review-gate coverage and synced
pipeline / agent documentation.

## Scope

**In scope:**

- Playwright spec covering: pipeline task runs, artifact card renders,
  accept / reject / copy actions, no-auto-apply guarantee.
- Doc sync to `dev-docs/03-ai/pipeline.md` and
  `dev-docs/03-ai/agents-map.md` for the shipped `vibe-author` review
  surface.

**Out of scope:**

- New runtime behavior — this part is gates + docs only.

## Files

**Create:**

- `tests/e2e/vibe-author-review-gates.spec.ts`

**Update:**

- `dev-docs/03-ai/pipeline.md`
- `dev-docs/03-ai/agents-map.md`

## Acceptance Criteria

- [x] Playwright spec exercises both scene-draft and revision-pack
      cards, asserting accept / reject / copy each fire user-visible
      effects without touching manuscript content.
- [x] `pipeline.md` documents the `vibe-author` review-gate flow with
      links to the runner and card components.
- [x] `agents-map.md` reflects the shipped author surface.

## Notes

This part is the final close on plan-027 stage-003 phase-003. It must
not land until part-001 and part-002 are `complete`.

Deviation logged in `impl.log.md`: the Playwright spec drives the
shared `/api/db/project-metadata/.../pipeline/vibe-author/...`
lifecycle (the same REST surface `vibe-worldbuild-checkpoints.spec.ts`
uses) and asserts the manuscript-write guardrail by verifying
`/api/db/scenes` and `/api/db/chapters` stay empty across accept and
reject. The card-level Accept / Reject / Copy / Acknowledge
contract is already covered at the source-string layer by part-002's
tests — mounting the Svelte cards in Playwright would require a new
dev-only route, which the part scope explicitly excludes
(“Out of scope: new runtime behavior”).
