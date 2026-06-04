---
title: Cover Pipeline Metadata Route Lifecycle
slug: part-002-cover-pipeline-metadata-route-lifecycle
part_number: 2
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-checkpoint-storage-lifecycle
started_at: 2026-06-03T17:32:00Z
completed_at: 2026-06-03T17:34:00Z
estimated_duration: 1d
---

## Objective

Add route-level tests for outline checkpoint storage lifecycle using the existing project metadata pipeline scope.

## Scope

**In scope:**

- Implement only the behavior described in this part.
- Keep changes bounded to the listed files unless source inspection proves a different path is required.
- Add or update tests that directly verify this part's acceptance criteria.
- Record implementation decisions and deviations in `impl.log.md`.

**Out of scope:**

- Broad UI redesign outside the affected Nova/outline surfaces.
- Direct provider SDK calls, client-side API keys, telemetry, sync, or auth.
- Silent manuscript/hierarchy mutation outside the explicit accept path.
- Opportunistic refactors unrelated to this part.

## Implementation Steps

1. Locate existing pipeline-scope route tests and mirror their fixture setup.
2. Add outline checkpoint upsert/list/review/reject lifecycle coverage.
3. Assert lifecycle mutation does not write hierarchy tables.
4. Document any required route hardening before generation work proceeds.

## Files

**Create:**

- `tests/routes/outline-checkpoints.test.ts`

**Update:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/<optional-key>/+server.ts` (verify exact optional-route folder name before editing)

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Route tests pass for upsert, list, review, reject, and invalid operation.
- [x] Tests prove checkpoint persistence is project-scoped.
- [x] Tests prove no hierarchy mutation occurs on checkpoint creation/rejection.

## Edge Cases

- Malformed JSON body.
- Unknown operation value.
- OwnerId mismatch.
- Project ID with no metadata rows.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
