---
title: Persist Revision Acknowledgements
slug: part-001-persist-revision-acknowledgements
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-002-revision-pack-acknowledgement
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Store acknowledged revision-pack issue IDs in project metadata keyed by project, artifact identity, and issue ID.

## Scope

**In scope:**

- Create a small service for read/upsert of revision acknowledgement state.
- Use project_metadata or the existing client metadata API consistently.
- Handle artifacts without stable IDs by using a deterministic envelope fingerprint.

**Out of scope:**

- Creating a full comments or tasks system.

## Implementation Steps

1. Define ownerId/key format for revision acknowledgement metadata.
2. Add read and write helpers with validation.
3. Add unit tests for persistence, reload, and corrupted metadata.

## Files

**Create:**

- `src/modules/nova/services/revision-pack-acknowledgements.ts`
- `tests/nova/revision-pack-acknowledgements.test.ts`

**Update:**

- `src/modules/nova/index.ts`

**Reference:**

- `src/lib/project-metadata.ts`
- `src/lib/ai/pipeline/author-schemas.ts`
- `src/modules/nova/components/NovaRevisionPackCard.svelte`

## Acceptance Criteria

- [ ] Acknowledged issue IDs persist and reload for a stable artifact.
- [ ] Corrupted metadata is ignored with a safe empty state.
- [ ] No manuscript or canon data is modified by acknowledgement.

## Edge Cases

- Issue IDs may collide across different revision-pack artifacts.
- Older artifacts may lack model or producedAt metadata.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
