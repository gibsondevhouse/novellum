# Plan-046 Schema Inventory Evidence

Date: 2026-06-12
Part: Stage 001 / Phase 002 / Part 001

## Method

- Read pipeline contract files, checkpoint services, route handlers, and representative route/e2e fixtures.
- Distinguished strict Zod validation from manual normalization and service-level guards.
- No runtime source changed for this evidence-only part.

## Schema Families

### Worldbuild Checkpoints

- Owner: `vibe-worldbuild`.
- Scope: `pipeline`.
- Version: `PIPELINE_CHECKPOINT_SCHEMA_VERSION = "1.0.0"`.
- Lifecycle: `draft`, `review`, `accepted`, `rejected`.
- Storage record: `WorldbuildCheckpointRecord` with `id`, `projectId`, `ownerId`, `version`, `lifecycle`, `taskKey`, `artifact`, `createdAt`, `updatedAt`, `review`, `acceptance`, and `rejection`.
- Upsert input is manually normalized from `{ artifact, version? }`. The artifact must belong to `vibe-worldbuild` or `vibe-worldbuild-domain`, and its task key must be worldbuild-compatible.
- Accept projection is only meaningful for populated world bible artifacts with `payload.tableWrites` arrays for canon tables.

Source anchors: `src/lib/ai/pipeline/checkpoint-contract.ts:17`, `:22`, `:24`, `:43`; `src/lib/ai/pipeline/checkpoint-service.ts:139`, `:144`, `:149`, `:156`, `:159`, `:840`, `:864`, `:873`, `:882`.

### Worldbuilding Scan Proposals

- Owner: `vibe-worldbuild-scan`.
- Scope: `pipeline`.
- Lifecycle/status: `pending_review`, `accepted`, `rejected`, `failed_validation`.
- Storage record: `WorldbuildProposalRecord` with `proposalId`, `projectId`, `categoryId`, `entityKind`, `status`, `generatedAt`, `sourceContext`, `confidence`, `reasoningSummary`, `payload`, `dedupeKey`, `acceptance`, and `rejection`.
- Proposal validation is mostly typed/manual. Route-level persistence normalizes generated drafts, applies confidence and dedupe rules, and writes records through `persistWorldbuildProposal()`.
- Proposal accept/reject routes return updated `proposal` records for the new-style path and `{ lifecycle }` for legacy checkpoint fallback.

Source anchors: `src/lib/ai/pipeline/worldbuild-proposal-schema.ts:17`, `:76`; `src/routes/api/worldbuilding/scan/+server.ts:499`, `:584`; `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts:36`, `:58`; `src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts:39`, `:61`.

### Author Draft Checkpoints

- Owner: `authorDraftCheckpoints.v1`.
- Scope: `pipeline`.
- Task key/artifact type: `vibe-author.scene-draft`.
- Artifact version: `1`.
- Lifecycle: `review`, `accepted`, `rejected`. There is no `draft` lifecycle.
- Storage record: strict `authorDraftCheckpointSchema` with `artifactEnvelope`, scene/chapter guards, base scene timestamp/hash, and optional accepted/rejected fields.
- Generation creates a checkpoint directly in `review`. Accept applies scene HTML/word count after stale-target guards; reject stores `rejectReason`.

Source anchors: `src/lib/ai/pipeline/author-draft-contract.ts:3`, `:6`, `:35`, `:38`; `src/lib/ai/pipeline/author-draft-checkpoint-service.ts:127`, `:147`, `:261`, `:341`, `:465`, `:491`.

### Outline Draft Checkpoints

- Owner: `outlineDraftCheckpoints.v1`.
- Scope: `pipeline`.
- Task key/artifact type: `vibe-outline.draft`.
- Draft artifact version: `1`.
- Schema version/checkpoint version: `1.0.0`.
- Lifecycle: `draft`, `review`, `accepted`, `rejected`.
- Draft schema is strict Zod: draft root requires `type`, `version`, `schemaVersion`, `id`, `projectId`, `slug`, `title`, `sourceContext`, and non-empty `arcs`; hierarchy nodes require strict arc/act/chapter/scene shapes with unique ids/slugs.
- Checkpoint schema is strict Zod: checkpoint requires owner/task/version, full draft, timestamps, and nullable review/acceptance/rejection audit fields.
- Generic metadata supports upsert/review/reject. Accept is blocked there; dedicated materialization route writes hierarchy and marks acceptance with `projectionMode`, `materializedCounts`, `hierarchyRootIds`, and `sceneIntentPersisted`.

Source anchors: `src/lib/ai/pipeline/outline-draft-contract.ts:3`, `:4`, `:5`, `:6`, `:11`, `:103`, `:226`; `src/lib/ai/pipeline/outline-checkpoint-contract.ts:3`, `:17`, `:32`, `:38`, `:44`; `src/lib/ai/pipeline/outline-checkpoint-service.ts:137`, `:149`, `:202`, `:219`, `:260`; `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts:33`.

## Fixture And Contract Mismatch Classes

| Area | Current Fixture / Caller | Contract Observation | Classification For Phase 003 |
| --- | --- | --- | --- |
| Worldbuild checkpoint e2e | `tests/e2e/vibe-worldbuild-checkpoints.spec.ts` uses generic metadata `operation: upsert/review/accept/reject` with `{ artifact, version: "1.0.0" }`. | This still matches the generic worldbuild checkpoint contract. | Not stale by schema alone; failures here are likely runtime state, route behavior, or projection behavior. |
| Outline checkpoint route tests/e2e | `tests/routes/outline-checkpoints.test.ts` and `tests/e2e/outline-generation-review.spec.ts` use owner `outlineDraftCheckpoints.v1`, strict draft payloads, generic review/reject, and dedicated accept. | This matches Plan-043 canonical contract. | Treat failures as potential regression unless exact assertion is based on retired direct apply behavior. |
| Outline generic accept | Some historical assumptions expected generic metadata `operation: accept` to materialize outline hierarchy. | Current contract blocks generic outline accept with `409 invalid_transition`; materialization route is canonical. | Stale legacy behavior if any test still expects generic outline accept success. |
| Worldbuilding proposal client | `src/modules/world-building/services/worldbuilding-proposal-service.ts` sends accept/reject without `projectId`. | New-style proposal route only reads persisted proposal records when body contains `projectId`; otherwise it falls through to legacy checkpoint lookup. | Product/client mismatch candidate; classify with route test before deciding Stage 003 update. |
| Author draft checkpoints | Author draft route/service tests use `review/accepted/rejected` and `artifactEnvelope`. | Contract has no `draft` lifecycle and stores strict `artifactEnvelope`, not generic `artifact`. | Stale fixture if any e2e expects generic pipeline shape for author drafts. |
| Worldbuild scan proposal shape | `tests/routes/worldbuilding-proposals.test.ts` builds proposal records with `pending_review`, `sourceContext`, `dedupeKey`, nullable acceptance/rejection. | Matches current proposal record shape. | Failures more likely route body/caller mismatch than schema mismatch. |

## Version Policy Questions For Stage 002

- Should generic worldbuild checkpoint upsert reject unsupported `version` values at write time, or only when review/accept/reject operations load a checkpoint?
- Should worldbuilding scan proposals gain an explicit schema/version field, or is owner `vibe-worldbuild-scan` plus record shape sufficient?
- Should author draft checkpoints expose a version distinct from `artifactEnvelope.version`, or is `authorDraftCheckpoints.v1` owner plus artifact version enough?
- Should outline `expectedVersion` continue to mean checkpoint schema version (`1.0.0`) instead of draft artifact version (`1`)?
- Should all canonical task-specific routes return one normalized error envelope, or keep route-family-specific envelopes for compatibility?

## Result

Acceptance criteria are satisfied for schema inventory. Phase 003 should run the e2e/spec set and classify failures against these contract facts before Stage 002 decides canonical API policy.
