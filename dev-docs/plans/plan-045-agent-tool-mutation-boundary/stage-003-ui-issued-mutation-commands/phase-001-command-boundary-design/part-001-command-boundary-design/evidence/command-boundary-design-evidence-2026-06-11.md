# Command Boundary Design Evidence — 2026-06-11

## Design Summary

Updated `dev-docs/03-ai/agents-map.md` with the plan-045 Agent Tool Mutation Boundary.

The documented boundary is:

- Model-callable tools may read context or create review artifacts.
- Mutation commands are excluded from model advertisement and rejected by generic dispatch unless a trusted app caller explicitly opts in.
- UI review cards and action services remain the source of author accept/reject intent.
- Server routes and transaction/stale guards remain authoritative for mutation safety.

## Pipeline Ownership

| Pipeline family | UI-issued owner | Mutation surface |
| --- | --- | --- |
| Author draft checkpoints | `NovaAuthorDraftCheckpointCard.svelte` | `acceptSceneDraftCheckpoint` / `rejectSceneDraftCheckpoint` backed by `/api/author-draft/checkpoints/*`. |
| Outline draft checkpoints | `NovaOutlineDraftCheckpointCard.svelte` and `outline-checkpoint-actions.ts` | `/api/outline/checkpoints/[checkpointId]/accept` and project-metadata lifecycle operations. |
| Worldbuilding checkpoints/proposals | Worldbuilding proposal cards, outline checkpoint console, and worldbuilding store/proposal services | Project-metadata accept/reject and proposal accept/reject routes with canon projection guards. |

## Guardrail Notes

- Rejecting a checkpoint/proposal is treated as a mutation because it records an author decision and changes lifecycle state.
- Generation-only checkpoint tools remain model-callable only while they create review artifacts and do not project changes into manuscript/canon state.
- No server-side stale guard, lifecycle guard, or transaction guard was removed or weakened.

## Validation To Run

- `pnpm check`
- `pnpm lint`
- `pnpm test tests/nova/agent-tool-mutation-boundary.test.ts tests/nova/agent-source-contracts.test.ts tests/nova/tool-registry.test.ts tests/nova/tool-router.test.ts tests/nova/agent-loop.test.ts tests/nova/chat-service.test.ts`
