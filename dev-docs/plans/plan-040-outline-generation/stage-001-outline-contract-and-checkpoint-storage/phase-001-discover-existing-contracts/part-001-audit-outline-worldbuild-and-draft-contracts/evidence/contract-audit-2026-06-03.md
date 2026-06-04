# Contract Audit - 2026-06-03

Part: `part-001-audit-outline-worldbuild-and-draft-contracts`

## Summary

Plan 040 should reuse the existing `project_metadata` pipeline checkpoint pattern for generated outline drafts. The current source already has review-gated checkpoint lifecycles, server-owned SQLite mutations, pipeline artifact envelopes, and deterministic outline hierarchy readers. The outline-specific contract should be additive: a new owner id, task key, zod schema, service, and route surface should be introduced rather than overloading the worldbuild checkpoint service.

The planned source path `src/lib/ai/pipeline/index.ts` is stale. There is no pipeline barrel at that path. Current pipeline contracts are split across `src/lib/ai/pipeline/contracts.ts`, `src/lib/ai/pipeline/checkpoint-contract.ts`, `src/lib/ai/pipeline/checkpoint-service.ts`, `src/lib/ai/pipeline/author-draft-contract.ts`, and `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`.

## Existing Outline And Hierarchy Contracts

- Canonical hierarchy buckets are defined twice and currently match: `src/lib/ai/pipeline/contracts.ts` exposes `OUTLINE_HIERARCHY` as `arcs`, `acts`, `milestones`, `chapters`, `scenes`, `beats`, `stages`; `src/modules/outline/services/seven-layer-outline.ts` exposes `SEVEN_LAYER_HIERARCHY` with the same order.
- `src/modules/outline/services/outline-data-service.ts` has `getSevenLayerOutline(projectId)`, which loads arcs, acts, milestones, chapters, scenes, beats, and stages, then normalizes sort order.
- `src/modules/outline/services/seven-layer-outline.ts` normalizes each layer by `order` then title and keeps all buckets present as arrays.
- Public outline exports currently live in `src/modules/outline/index.ts` and include the seven-layer constants and normalization helpers, but not `getSevenLayerOutline` or `createEmptyPipelineHierarchyPath`.
- Domain rows are defined in `src/lib/db/domain-types.ts`: `Chapter`, `Scene`, `Beat`, `Stage`, `Act`, `Arc`, and `Milestone`.
- SQLite schema in `src/lib/server/db/schema.ts` stores:
  - `chapters`: `projectId`, `title`, `order`, `summary`, `wordCount`, optional `actId`, `arcRefs`.
  - `scenes`: `chapterId`, `projectId`, `title`, `summary`, optional pov/location/timeline refs, `order`, `content`, `wordCount`, `notes`, `characterIds`, `locationIds`, `arcRefs`.
  - `beats`: optional `sceneId` and `arcId`, required `projectId`, `title`, `type`, `order`, `notes`.
  - `stages`: required `beatId`, `projectId`, `title`, `description`, `order`, `status`.
  - `acts`: optional `arcId`, `projectId`, `title`, `order`, `planningNotes`.
  - `arcs`: `projectId`, `title`, `description`, `purpose`, optional `arcType`, `status`, `order`.
  - `milestones`: required `actId`, `projectId`, `title`, `description`, `order`, `chapterIds`.

## Existing Checkpoint And Metadata Pattern

- `src/lib/project-metadata.ts` is the browser wrapper for `/api/db/project-metadata/:projectId/:scope/:ownerId/:key`; allowed scopes include `pipeline`.
- `src/lib/server/project-metadata/project-metadata-service.ts` is the SQLite-canonical metadata service with the same `(projectId, scope, ownerId, key)` key.
- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts` routes pipeline `PUT` operations through `upsert`, `review`, `accept`, and `reject` checkpoint service methods instead of raw metadata writes.
- `src/lib/ai/pipeline/checkpoint-contract.ts` defines the worldbuild checkpoint lifecycle (`draft`, `review`, `accepted`, `rejected`), metadata scope `pipeline`, owner ids `vibe-worldbuild` and `vibe-worldbuild-scan`, and `WorldbuildCheckpointRecord`.
- `src/lib/ai/pipeline/checkpoint-service.ts` implements server-side transactions for worldbuild checkpoint review, accept, and reject. It only validates worldbuild pipeline families today and should not be expanded by weakening those validators.
- `src/modules/outline/services/worldbuild-pipeline-runner.ts` stages parsed worldbuild artifacts as draft checkpoints via the project metadata API from client-side code. That is the safe client pattern to follow for outline generation if client staging is needed.

## Existing Author Draft Pattern

- `src/lib/ai/pipeline/author-draft-contract.ts` defines `AUTHOR_DRAFT_CHECKPOINT_OWNER_ID = authorDraftCheckpoints.v1`, `AUTHOR_DRAFT_TASK_KEY = vibe-author.scene-draft`, `authorDraftCheckpointSchema`, and `SceneDraftContext`.
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts` stores author draft checkpoints in `project_metadata` under `scope = pipeline` and `ownerId = authorDraftCheckpoints.v1`.
- Author draft accept is transactional and guarded against stale scene updates with `baseSceneUpdatedAt` plus `baseSceneContentHash`.
- `src/lib/ai/pipeline/author-draft-context.ts` builds draft context from canonical rows plus scene and chapter metadata. Scene intent comes from scene metadata, not from the `scenes.summary` or `scenes.notes` columns.
- `buildSceneDraftContext()` reads intent in this priority order:
  - `goal`: scene metadata key `quickIntent.goal`, then `clarity.sceneGoal`.
  - `conflict`: `quickIntent.obstacle`, then `quickIntent.conflict`, then `clarity.immediateObstacle`.
  - `outcome`: `quickIntent.outcome`, then `clarity.outcome`.
  - `turn`: `clarity.turningPoint`.
- Tests in `tests/ai/pipeline/author-draft-context.test.ts` lock the `quickIntent` and `quick-intent` aliases.

## Existing Worldbuilding Proposal Pattern

- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts` defines proposal records for plan 037 scan output.
- `src/routes/api/worldbuilding/scan/+server.ts` persists scan proposals in `project_metadata` under owner `vibe-worldbuild-scan`.
- `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts` and `reject/+server.ts` delegate mutations to the worldbuild checkpoint service.
- Accept/reject endpoints keep generated data proposed until explicit author action. That review-gated semantics should be mirrored for outline drafts.

## Existing Outline Apply Route Compatibility

- `src/routes/api/nova/outline/apply/+server.ts` already materializes an outline-like payload into arcs, acts, milestones, chapters, scenes, and beats in one SQLite transaction.
- That route is not safe to reuse as the plan 040 accept route as-is because it deletes all existing stages, beats, scenes, chapters, milestones, acts, and arcs for the project before inserting the new payload.
- `tests/routes/nova-outline-apply-route.test.ts` explicitly proves the destructive replacement behavior.
- The route does provide useful adapter logic:
  - Maps source ids to newly generated UUIDs.
  - Preserves `arcRefs`.
  - Defaults missing milestones by creating one milestone per act.
  - Inserts hierarchy rows in top-down order inside a transaction.
- Plan 040 should either extract a non-destructive mapping helper from this logic or implement a new outline checkpoint accept service with explicit conflict preflight.

## Required Extension Points

Recommended source additions for later parts:

- Add a dedicated outline contract file, likely `src/lib/ai/pipeline/outline-draft-contract.ts`, with:
  - `OUTLINE_DRAFT_CHECKPOINT_OWNER_ID`, for example `outlineDraftCheckpoints.v1`.
  - `OUTLINE_DRAFT_TASK_KEY`, for example `vibe-outline.draft`.
  - Zod schemas for Arc -> Act -> Chapter -> Scene output.
  - Required scene intent fields: `goal`, `conflict`, `turn`, `outcome`.
  - Checkpoint lifecycle matching `draft`, `review`, `accepted`, `rejected`.
- Add a dedicated service, likely `src/lib/ai/pipeline/outline-draft-checkpoint-service.ts`, rather than widening `WorldbuildCheckpointRecord`.
- Add a dedicated route group, likely `/api/outline-generation/checkpoints/*` or `/api/outline/checkpoints/*`, instead of routing outline lifecycle through the existing worldbuild metadata route.
- Add client wrappers in `src/lib/project-metadata.ts` only after the server service exists.
- Export outline helpers from `src/modules/outline/index.ts` only when a downstream part needs public module access.

## Scene Intent Bridge Decision

Plan 040 acceptance must persist generated scene intent into scene metadata so plan 038 draft context can read it.

Recommended mapping on accept:

- Persist `goal`, `conflict`, and `outcome` to scene metadata key `quickIntent` and optionally `quick-intent` only if compatibility with older client helpers is required.
- Persist `goal`, `conflict`, `turn`, and `outcome` to scene metadata key `clarity` as:
  - `sceneGoal = goal`
  - `immediateObstacle = conflict`
  - `turningPoint = turn`
  - `outcome = outcome`
- Do not rely only on `scenes.summary` or `scenes.notes`; author draft context does not read those as scene intent.

## Hierarchy Adapter Defaults

The author-visible V1 generated outline can remain Arc -> Act -> Chapter -> Scene, but the materialization adapter should preserve seven-layer compatibility.

- Milestones: create default milestone buckets per act when the generated outline omits milestones. This matches the existing `nova/outline/apply` route and gives the seven-layer outline a useful middle layer.
- Beats: do not invent beat rows unless the generated outline contract explicitly includes them. Empty `beats` is a valid normalized bucket.
- Stages: do not invent stage rows. `stages.beatId` is required, so synthetic stages without generated beats would create weak or invalid hierarchy.
- Scene intent: store as metadata, not as beat or stage defaults.

## File Update Decision For This Part

No source files were changed in this audit part. The declared update paths were resolved as follows:

- `src/modules/outline/index.ts`: inspected and identified as a likely later public export point. No export is needed for an audit-only part.
- `src/lib/ai/pipeline/index.ts`: stale path. No file exists. Current pipeline contracts are file-level modules without a barrel.
- `src/lib/project-metadata.ts`: inspected and identified as a later client wrapper extension point. Updating it before the outline server contract exists would create an unused API surface.

## Acceptance Criteria Check

- Existing source files and recommended extension points are identified above.
- New API surfaces are recommended only where an existing pattern exists: project metadata pipeline scope, author-draft checkpoint service, worldbuild proposal review gates, and transactional server accept.
- Hierarchy defaults are called out: create milestone defaults per act; do not invent beats or stages for the V1 Arc -> Act -> Chapter -> Scene contract.

## Verification

- `pnpm test tests/routes/nova-outline-apply-route.test.ts tests/ai/pipeline/author-draft-context.test.ts` - passed, 2 files / 18 tests.
- `pnpm check` - passed with 0 errors and 11 pre-existing Svelte warnings in world-building files.
- `pnpm lint` - passed.
- `pnpm lint:css` - not run; no UI or style files changed in this audit part.
- `pnpm check:tokens` - not run; no UI or style files changed in this audit part.
