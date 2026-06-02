---
title: Resolve draft Lifecycle Dead Code
slug: part-004-draft-lifecycle
part_number: 4
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-context-and-response-hardening
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Resolve the `draft` lifecycle value in `AUTHOR_DRAFT_LIFECYCLE_VALUES`. Currently it is
defined in the Zod schema but never assigned — the service creates all checkpoints at
`review` directly. It should either be used for the pre-parse transient state or removed.

## Options

**Option A — Use `draft` for in-flight generation (preferred):**

Assign `draft` as the initial state when a checkpoint is first inserted (before LLM parse
succeeds), then transition to `review` on successful parse. This gives a more accurate
lifecycle model and allows the UI to show a distinct "generating" state.

Steps:
1. In `createCheckpoint`, insert with `lifecycle: 'draft'`.
2. In the generate route's success path, call a new `transitionCheckpointToReview(checkpointId)`
   method (or update in place) after successful parse.
3. Update the generate route's repair loop to keep `draft` during retries.
4. On `persistGenerationFailure`, set `lifecycle: 'rejected'` (already the case).

**Option B — Remove `draft` from schema:**

If the in-flight distinction isn't needed, remove `'draft'` from `AUTHOR_DRAFT_LIFECYCLE_VALUES`
and the Zod union. Simpler, but loses the semantic distinction.

## Decision

Implementer should choose Option A unless it adds excessive complexity. If Option B is
chosen, document the rationale in `impl.log.md`.

## Acceptance Criteria

- [ ] `draft` lifecycle value is either: (a) assigned during generation and transitions to
  `review` on success, or (b) removed from the schema and all references.
- [ ] No TypeScript errors.
- [ ] Checkpoint service tests updated to cover the chosen path.
- [ ] `pnpm check` — 0 errors. `pnpm test` — all pass.
