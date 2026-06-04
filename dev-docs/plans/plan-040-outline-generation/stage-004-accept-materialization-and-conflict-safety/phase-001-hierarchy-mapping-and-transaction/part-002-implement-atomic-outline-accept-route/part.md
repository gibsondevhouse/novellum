---
title: Implement Atomic Outline Accept Route
slug: part-002-implement-atomic-outline-accept-route
part_number: 2
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-hierarchy-mapping-and-transaction
started_at: 2026-06-04T11:28:00-04:00
completed_at: 2026-06-04T11:38:00-04:00
estimated_duration: 1d
---

## Objective

Create the server accept route that materializes a checkpoint and updates checkpoint lifecycle only after successful transaction commit.

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

1. Validate projectId/checkpointId and load checkpoint server-side.
2. Verify checkpoint lifecycle is reviewable and payload version is supported.
3. Run conflict preflight before transaction.
4. Insert hierarchy records and scene intent inside one transaction.
5. Update checkpoint acceptance metadata only after successful materialization.

## Files

**Create:**

- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `src/lib/server/outline/outline-materialization-service.ts`
- `tests/routes/outline-accept.test.ts`

**Update:**

- `src/lib/server/db/index.ts`
- `src/lib/project-metadata.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Successful accept creates expected hierarchy and marks checkpoint accepted.
- [x] Injected failure rolls back all hierarchy rows and leaves checkpoint unaccepted.
- [x] Route is server-only and no client imports DB utilities.
- [x] Tests prove no partial writes.

## Edge Cases

- Checkpoint already accepted/rejected.
- Checkpoint belongs to another project.
- DB constraint failure mid-transaction.
- Project deleted during accept.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
