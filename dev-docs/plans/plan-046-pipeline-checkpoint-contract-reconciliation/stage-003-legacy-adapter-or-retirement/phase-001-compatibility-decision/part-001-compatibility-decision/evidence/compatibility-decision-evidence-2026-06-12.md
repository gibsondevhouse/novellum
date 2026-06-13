# Compatibility Decision Evidence

Date: 2026-06-12
Agent: Codex
Plan: plan-046-pipeline-checkpoint-contract-reconciliation
Stage: stage-003-legacy-adapter-or-retirement
Phase: phase-001-compatibility-decision
Part: part-001-compatibility-decision

## Decision Table

| Legacy or Ambiguous Behavior | Disposition | Rationale | Implementation Files |
| --- | --- | --- | --- |
| Plan-028 E2E fixture artifacts using `family: "vibe-worldbuild"` without current envelope fields | Update fixtures to current `PipelineArtifactEnvelope` shape | Specs still cover useful queue/lifecycle behavior; the stale shape is not a supported compatibility input. | `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts`; `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts` |
| Worldbuilding proposal accept/reject helper sends no `projectId` | Update active helper and callback contracts to pass project context | Proposal routes load rows by `projectId`, owner, and proposal id. A global proposal lookup would add accidental legacy behavior. | `src/modules/world-building/services/worldbuilding-proposal-service.ts`; `WorldbuildingProposalCard.svelte`; `WorldbuildingProposedTile.svelte`; `tests/world-building/worldbuilding-proposal-service.test.ts` |
| `/api/nova/outline/apply` legacy route | Keep retired route retired | Plan-043 already made this route return `410 outline_apply_retired`; Plan-046 does not reintroduce legacy application. | Existing route tests remain the explicit failure coverage. |
| Generic project metadata lifecycle route for `vibe-worldbuild` checkpoints | Retain as canonical for staged worldbuild checkpoints | Current product/tests use it for upsert/review/accept/reject and it owns populated world bible projection. | No adapter change required. |
| Generic project metadata lifecycle route for outline checkpoints | Retain for list/read/review/reject compatibility only; outline accept stays task-specific | This matches shipped outline checkpoint materialization and stale-guard behavior. | No adapter change required. |
| Author draft checkpoints through generic metadata | Do not support | Author drafts have task-specific generate/list/accept/reject routes and strict Zod schemas. | No adapter change required. |

## Required Implementation

1. Replace malformed worldbuild E2E fixture envelopes with current envelope fields.
2. Include `projectId` in worldbuilding proposal accept/reject service request bodies.
3. Keep route-retirement tests/docs for `/api/nova/outline/apply`.
4. Run targeted and full E2E validation after updates.

## Edge Cases

- Existing local database rows that deserialize to current records remain supported.
- Malformed current fixtures should fail validator coverage rather than be silently adapted.
- Historical plan docs remain historical and should not be rewritten unless they claim current behavior.
