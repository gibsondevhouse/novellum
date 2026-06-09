---
title: Docs Sync
slug: part-001-docs-sync
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-docs-sync
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Update developer and user docs so future work starts from the checkpoint pipeline, not the retired artifact route.

## Scope

**In scope:**

- Update AI pipeline docs, Nova docs, and outline references.
- Remove stale statements about legacy outline artifacts if present.
- Document verification commands.

**Out of scope:**

- Large roadmap rewrite.
- Marking reviewer sign-off complete.

## Implementation Steps

1. Search docs for legacy outline artifact/apply references.
2. Update canonical route and UI descriptions.
3. Add test command evidence references.
4. Re-run placeholder/stale-reference searches.

## Files

**Create:**

- `evidence/docs-sync-evidence-2026-06-09.md`

**Update:**

- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

**Reference:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `src/lib/server/outline/outline-materialization-service.ts`
- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Docs identify checkpoint generation and accept materialization as canonical.
- [ ] Retired route references are removed or marked historical.
- [ ] Verification commands are recorded.

## Edge Cases

- Historical plan docs should not be rewritten unless they claim current behavior.
- User docs should avoid internal route names unless necessary.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
