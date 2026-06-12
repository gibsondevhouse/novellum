---
title: Docs Sync
slug: part-001-docs-sync
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-003-docs-sync
started_at: 2026-06-11
completed_at: 2026-06-11
estimated_duration: TBD
---

## Objective

Make the read/generate versus accept/apply distinction explicit in Nova and AI docs.

## Scope

**In scope:**

- Update Agent mode docs, AI pipeline docs, and developer guidance.
- Document mutation tool policy and test coverage.
- Avoid overpromising autonomous writes.

**Out of scope:**

- Marketing copy rewrite.
- Changing AGENTS.md unless requested.

## Implementation Steps

1. Search docs for Agent mode mutation language.
2. Update copy to state model tools create review artifacts only.
3. Reference explicit author accept buttons for mutation.
4. Save docs evidence.

## Files

**Create:**

- `evidence/docs-sync-evidence-2026-06-09.md`

**Update:**

- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`
- `novellum-docs/user/ai-setup.md`

**Reference:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [x] Docs no longer imply the model can silently apply manuscript/canon changes.
- [x] Mutation boundary policy is clear for future tools.
- [x] Verification evidence is recorded.

## Edge Cases

- Do not hide useful Agent mode capabilities; describe them accurately.
- Preserve local-first/privacy framing.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
