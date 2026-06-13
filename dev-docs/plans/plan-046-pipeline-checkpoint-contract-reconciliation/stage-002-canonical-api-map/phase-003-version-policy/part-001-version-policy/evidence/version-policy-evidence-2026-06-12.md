# Version Policy Evidence

Date: 2026-06-12
Agent: Codex
Plan: plan-046-pipeline-checkpoint-contract-reconciliation
Stage: stage-002-canonical-api-map
Phase: phase-003-version-policy
Part: part-001-version-policy

## Files Reviewed

- `src/lib/ai/pipeline/checkpoint-contract.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-draft-contract.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-contract.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`

## Version Constants and Validators

| Family | Current Version Anchor | Runtime Guard |
| --- | --- | --- |
| `vibe-worldbuild` staged checkpoints | `PIPELINE_CHECKPOINT_SCHEMA_VERSION = "1.0.0"` | `isSupportedCheckpointVersion()` gates review, accept, and reject operations. |
| `vibe-worldbuild` artifacts | Fixture/parser version `1.0.0`; envelope requires `pipeline`, `model`, `hierarchy`, and `notes`. | Upsert validates worldbuild-compatible `artifact.pipeline` and `artifact.taskKey`. |
| Worldbuilding scan proposals | No independent version field. | `WorldbuildProposalRecord` deserialization and proposal lifecycle routes define the accepted shape. |
| Author draft checkpoints | Owner `authorDraftCheckpoints.v1`; artifact `version: 1`. | `authorDraftCheckpointSchema` and `authorDraftArtifactSchema` reject unknown versions and malformed rows. |
| Outline draft checkpoints | `OUTLINE_DRAFT_SCHEMA_VERSION = "1.0.0"`; draft artifact `version: 1`. | Generic upsert rejects unsupported checkpoint versions; accept parses current outline draft/checkpoint schemas before materialization. |

## Policy Decision

Plan-046 should update stale tests that cover still-canonical behavior to the
current schema rather than adding compatibility for legacy fixture shapes. The
full e2e failures from Stage 001 are stale fixture failures because their
minimal artifacts predate the current `PipelineArtifactEnvelope`. Those specs
should be repaired in Stage 003 by emitting current worldbuild envelopes.

Unknown future schemas are not accepted as compatibility input. For families
with explicit versions, unknown or malformed versions must fail before review
mutation or materialization. For proposal records without a version field, the
accepted shape is the current `WorldbuildProposalRecord`; forward migration is
out of scope for Plan-046.

## Implementation Evidence

- `dev-docs/03-ai/agents-map.md` now contains a Plan-046 version policy table by family.
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts` now names `CHECKPOINT_SCHEMA_VERSION` and `ARTIFACT_PARSER_VERSION` constants instead of repeating opaque `1.0.0` literals.
- No runtime validator was loosened.

## Validation

No command was run for this docs/test-fixture policy part. Stage 003 owns the
targeted E2E remediation and rerun after stale fixture updates.
