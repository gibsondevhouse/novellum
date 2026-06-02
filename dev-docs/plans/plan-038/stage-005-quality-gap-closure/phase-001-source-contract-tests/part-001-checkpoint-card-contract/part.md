---
title: CheckpointCard Source-Contract Test
slug: part-001-checkpoint-card-contract
part_number: 1
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-source-contract-tests
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Lock the four behavioral contracts of `NovaAuthorDraftCheckpointCard.svelte` with a
source-contract test: the component that owns the most dangerous action in the pipeline
(writing to `scenes.content`) must have explicit locked-down assertions.

## Scope

**Create:**

- `tests/nova/checkpoint-card.contract.test.ts`

## Behavioral Contracts to Lock

1. **Explicit confirmation when content exists** — The card must show a confirmation
   dialog before accepting when `scenes.content` is non-empty. Assert the accept flow
   calls `acceptSceneDraftCheckpoint` only after confirmation, never silently.

2. **No editor-store imports** — The card must not import `editorStore` or any symbol
   from `src/stores/editor` directly (except the read-only `editorDirty` store). Assert
   by scanning the component source for forbidden import strings.

3. **`dispatchSceneContentApplied` called after accept** — Assert that a successful
   accept triggers the `novellum:scene-content-applied` custom window event.

4. **Stale-target detection wired** — When the accept API returns `{ error: 'stale_target' }`,
   the card must display a force-overwrite confirmation, not silently succeed or silently fail.

## Implementation Notes

Use Vitest + `@testing-library/svelte` for rendering. Mock `author-draft-api.ts` to
control the accept response. For the import-scan contract, read the file source with
`fs.readFileSync` and assert forbidden strings are absent — this is a simpler approach
than full static analysis.

## Acceptance Criteria

- [ ] Test file created at `tests/nova/checkpoint-card.contract.test.ts`.
- [ ] All four contracts have passing test cases.
- [ ] No editor-store direct import assertion included.
- [ ] `pnpm test` passes — no regressions.
