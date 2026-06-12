---
title: Capability Classification
slug: part-001-capability-classification
part_number: 1
status: review
owner: Planner Agent
assigned_to: —
phase: phase-002-capability-classification
started_at: 2026-06-11
completed_at: 2026-06-11
estimated_duration: TBD
---

## Objective

Define which tools may be model-callable and which must move behind author UI intent.

## Scope

**In scope:**

- Capability classification for all product tools.
- Special handling for accept/reject/apply operations.
- Document rationale and edge cases.

**Out of scope:**

- Implementing registry metadata.
- Changing UI commands.

## Implementation Steps

1. Use the registry inventory to assign capability class to each tool.
2. Flag tools that mutate or can cause mutation through server routes.
3. Write the allow/deny recommendation for model advertisement.
4. Save capability classification evidence.

## Files

**Create:**

- `evidence/capability-classification-evidence-2026-06-11.md`

**Update:**

- None

**Reference:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [x] Every tool has one capability class.
- [x] `authorDraft.accept_checkpoint` is classified as mutation.
- [x] Generation-only checkpoint tools are distinguished from accept/apply tools.

## Edge Cases

- Reject actions mutate checkpoint lifecycle but not manuscript content.
- A tool can be safe to call server-side but unsafe for the model loop.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
