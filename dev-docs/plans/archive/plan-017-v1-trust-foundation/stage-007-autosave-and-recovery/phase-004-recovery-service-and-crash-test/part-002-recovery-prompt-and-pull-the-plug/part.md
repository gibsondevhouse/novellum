---
title: Recovery Prompt and Pull-the-Plug Test
slug: part-002-recovery-prompt-and-pull-the-plug
part_number: 2
status: complete
owner: architect
assigned_to: architect
phase: phase-004-recovery-service-and-crash-test
started_at: 2026-04-29
completed_at: 2026-04-29
estimated_duration: 0.5d
---

## Objective

Ship the `RecoveryPrompt.svelte` modal and wire it into the editor
route. Cover the full "pull the plug" acceptance scenario in a
Vitest suite so future regressions surface immediately.

## Files

**Create:**

- `src/modules/editor/components/RecoveryPrompt.svelte`
- `tests/editor/recovery-prompt.test.ts`

**Modify:**

- `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`
- `src/modules/editor/index.ts`
- `dev-docs/plans/plan-017-v1-trust-foundation/plan.md` (stage-007 →
  complete)
- `dev-docs/plans/plan-017-v1-trust-foundation/stage-007-autosave-and-recovery/stage.md`
  (status → complete)

## Acceptance Criteria

- [ ] Recovery modal renders only when a divergent pending draft
      exists for the active scene.
- [ ] Restore applies the draft via the autosave pipeline; Discard
      removes the stored draft.
- [ ] Pull-the-plug test pre-seeds localStorage, mounts autosave on
      a "freshly opened" scene, and asserts the prompt surfaces.
- [ ] Stage-007 marked complete in plan.md and stage.md.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
