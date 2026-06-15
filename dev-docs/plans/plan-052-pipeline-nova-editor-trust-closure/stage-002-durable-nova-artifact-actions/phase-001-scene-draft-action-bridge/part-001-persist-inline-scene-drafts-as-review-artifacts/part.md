---
title: Persist Inline Scene Drafts As Review Artifacts
slug: part-001-persist-inline-scene-drafts-as-review-artifacts
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-001-scene-draft-action-bridge
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Bridge Nova Write-mode scene draft artifacts into the existing author draft review model so Accept is not a no-op.

## Scope

**In scope:**

- Create a helper that converts a valid author-scene-draft envelope into a durable review artifact or checkpoint reference.
- Preserve stale-target and dirty-editor safeguards from the existing author draft checkpoint flow.
- Return clear insufficient-context results when scene/project IDs are missing.

**Out of scope:**

- Directly replacing manuscript prose from the message log without review confirmation.

## Implementation Steps

1. Inspect scene draft envelope payload and sidecar target fields.
2. Add a service that validates projectId, sceneId, prose, word count, and provenance before persistence.
3. Reuse or mirror existing author draft checkpoint accept/reject endpoints for final mutation.
4. Surface action status in NovaSceneDraftCard.

## Files

**Create:**

- `src/modules/nova/services/inline-scene-draft-actions.ts`
- `tests/nova/inline-scene-draft-actions.test.ts`

**Update:**

- `src/modules/nova/components/NovaSceneDraftCard.svelte`
- `src/modules/nova/components/NovaMessageLog.svelte`

**Reference:**

- `src/modules/nova/services/author-draft-api.ts`
- `src/lib/ai/pipeline/author-draft-contract.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `src/lib/stores/editor-dirty.svelte.ts`

## Acceptance Criteria

- [ ] Clicking Accept can no longer end in local-only “Marked as accepted” state.
- [ ] Unsafe or insufficient-context Accept shows an actionable blocked state.
- [ ] Successful Accept still requires explicit confirmation before replacing existing scene content.
- [ ] Reject persists when a durable artifact/checkpoint exists.

## Edge Cases

- Artifacts restored from old session history may have no sceneId.
- Generated prose may target a deleted scene.
- Editor may have unsaved changes for the same scene.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
