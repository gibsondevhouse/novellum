# Call-Site Inventory Evidence

Date: 2026-06-12

## Search Commands

- `rg -n "/api/nova/outline/apply|NovaOutlineCard|applyAuthorOutlineArtifact|author-outline|applyAuthorOutline|OutlineCard" src tests dev-docs novellum-docs`
- `rg -n "/api/ai/outline/generate|acceptOutlineCheckpointMaterialization|NovaOutlineDraftCheckpointCard|NovaOutlineGenerationPanel|outlineGenerationState|OutlineGenerationRunner|outline-checkpoint|outline checkpoint|outlineDraftCheckpoints|outline/checkpoints" src tests dev-docs novellum-docs`
- `rg -n "vibe-author\\.outline|AUTHOR_OUTLINE|AuthorOutline|outline_scope" src/lib src/modules tests/nova tests/ai dev-docs/03-ai dev-docs/04-modules novellum-docs/user`
- `find src/routes/api -path '*outline*' -type f`
- `find src/modules/nova src/lib/ai src/lib/server -iname '*outline*' -type f`
- `find tests -iname '*outline*' -type f`

## Legacy Direct-Apply Surface

These are the Plan-043 retirement or redirect targets.

| File | Current responsibility | Classification | Recommended next action |
| --- | --- | --- | --- |
| `src/routes/api/nova/outline/apply/+server.ts` | Directly applies an `AuthorOutline` payload by deleting existing `stages`, `beats`, `scenes`, `chapters`, `milestones`, `acts`, and `arcs`, then inserting replacement hierarchy rows. | Legacy destructive materialization | Retire or hard-disable. Replace tests with assertions that this route cannot materialize outline hierarchy outside checkpoint accept. |
| `src/modules/nova/services/outline-artifact-apply.ts` | Client helper that posts `AuthorOutline` payloads to `/api/nova/outline/apply`. | Legacy direct-apply client | Remove with `NovaOutlineCard` or convert to a no-op/unsupported compatibility path if persisted artifacts must render. |
| `src/modules/nova/components/NovaOutlineCard.svelte` | Renders `vibe-author.outline` artifacts and exposes `Apply To Outline`, which calls the direct-apply helper. | Legacy user-facing apply UI | Retire apply action. Prefer removing the card from active message rendering; if retained for old in-memory artifacts, make it read-only/copy-only. |
| `src/modules/nova/components/NovaMessageLog.svelte` | Renders `NovaOutlineCard` when `message.artifact.kind === 'author-outline'`. | Legacy artifact render path | Redirect away from `author-outline` artifacts or remove this branch after Write mode stops producing them. |
| `src/modules/nova/services/chat-service.ts` | In Write mode, `isOutlineBuildRequest()` routes outline prompts to `runAuthorPipelineTask({ taskKey: PIPELINE_TASK_KEYS.AUTHOR_OUTLINE })`. | Legacy generation entrypoint | Redirect outline-build intent to the canonical checkpoint generation flow instead of producing `author-outline` artifacts. |
| `src/modules/nova/services/author-pipeline-runner.ts` | Maps `vibe-author.outline` parsed output to Nova artifact kind `author-outline`. | Legacy artifact producer for outline | Stop using for outline generation. Keep scene-draft/revision paths intact. |
| `src/modules/nova/types.ts` | Includes `author-outline` in `NovaArtifact`. | Legacy type surface | Remove once message rendering and tests no longer need `author-outline`; otherwise mark compatibility-only. |
| `src/modules/nova/index.ts` | Publicly exports `NovaOutlineCard`. | Legacy barrel export | Remove after card retirement; verify module boundary tests and consumers. |

## Legacy Tests To Update

| File | Current coverage | Classification | Recommended next action |
| --- | --- | --- | --- |
| `tests/routes/nova-outline-apply-route.test.ts` | Proves `/api/nova/outline/apply` applies payloads and replaces existing hierarchy rows. | Legacy destructive-route test | Replace with hard-disabled/410/404 behavior, or delete with route removal. |
| `tests/nova/nova-artifact-cards.test.ts` | Mounts `NovaOutlineCard` and expects `Apply To Outline` copy. | Legacy UI test | Remove or convert to read-only compatibility card expectations. |
| `tests/nova/services/author-pipeline-runner.test.ts` | Expects `runAuthorPipelineTask('vibe-author.outline')` to attach `author-outline`. | Legacy artifact producer test | Update after Write mode no longer uses author-pipeline outline artifacts. |
| `tests/nova/mode-routing.test.ts` | Expects Write mode outline prompts to call `runAuthorPipelineTask(AUTHOR_OUTLINE)`. | Legacy routing test | Update to canonical checkpoint-generation routing behavior. |
| `tests/nova/nova-panel-chat.test.ts` | Mocks `runAuthorPipelineTask`; inspect when changing Write mode routing. | Potential legacy test support | Update only if assumptions become stale. |
| `tests/ai/pipeline/author-agent.test.ts`, `tests/ai/pipeline/contracts.test.ts` | Cover lower-level `vibe-author.outline` parsing/task contracts. | Parser/task contract, not direct materialization | Decide in Stage 003 whether to retire these contracts or keep them as internal/non-UI parser coverage. |

## Canonical Checkpoint Flow To Preserve

These files are the supported outline generation and materialization path.

| File | Responsibility | Classification | Notes |
| --- | --- | --- | --- |
| `src/routes/api/ai/outline/generate/+server.ts` | Builds outline context, calls the AI provider, validates `OutlineDraft`, and persists only an `outlineDraftCheckpoints.v1` review checkpoint. | Canonical generation route | Keep as the only active outline generation endpoint. |
| `src/modules/nova/services/outline-generation-runner.ts` | Client runner around `POST /api/ai/outline/generate`, with typed success/failure/cancel states. | Canonical client generation service | Candidate target for redirected Write-mode outline prompts. |
| `src/modules/nova/stores/outline-generation-state.svelte.ts` | Owns outline generation state, pending checkpoint loading, retries, cancellation, and action-result state updates. | Canonical UI state | Preserve and potentially expose as the Write-mode redirect surface. |
| `src/modules/nova/components/NovaOutlineGenerationPanel.svelte` | Checks `outline_scope` readiness and displays Generate/Retry/Refresh plus checkpoint review UI. | Canonical UI entrypoint | Currently nested through `NovaAuthorDraftEngine` on editor/chapter routes. |
| `src/modules/nova/components/NovaAuthorDraftEngine.svelte` | Embeds `NovaOutlineGenerationPanel` before the chapter draft runner. | Canonical UI host | Keep, but consider whether Write mode should open or trigger this panel. |
| `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte` | Renders review checkpoint payload and explicit accept/reject controls. | Canonical review card | Preserve as the only materialization UI. |
| `src/modules/nova/services/outline-checkpoint-actions.ts` | Accepts via `/api/outline/checkpoints/{checkpointId}/accept`; reviews/rejects through project metadata lifecycle route. | Canonical UI action client | Preserve stale/version precondition behavior. |
| `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts` | Dedicated accept route that delegates to `acceptOutlineCheckpointMaterialization()`. | Canonical accept route | Preserve as the only hierarchy write route for outline generation. |
| `src/lib/server/outline/outline-materialization-service.ts` | Validates checkpoint/project/lifecycle/version/conflict state and writes hierarchy rows transactionally. | Canonical materialization service | Preserve conflict, stale, rollback, and audit behavior. |
| `src/lib/server/outline/outline-materialization-map.ts` | Pure mapper from accepted `OutlineDraft` to hierarchy rows and scene intent metadata. | Canonical mapper | Preserve pure/no-DB boundary. |
| `src/lib/server/outline/outline-conflict-preflight.ts` | Detects existing outline hierarchy before accept/materialization. | Canonical safety check | Preserve conflict-blocked accept semantics. |
| `src/lib/ai/pipeline/outline-checkpoint-contract.ts` | Typed operation/body helpers and lifecycle guards for outline checkpoints. | Canonical contract | Preserve `expectedUpdatedAt`/`expectedVersion` accept preconditions. |
| `src/lib/ai/pipeline/outline-checkpoint-service.ts` | Persists/reviews/rejects outline checkpoints in `project_metadata`. | Canonical checkpoint storage | Preserve owner isolation. |
| `src/lib/project-metadata.ts` | Client metadata wrappers, including outline checkpoint listing. | Canonical support API | Preserve list/read helpers used by outline generation state. |
| `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts` | Generic keyed metadata route that dispatches outline upsert/review/reject lifecycle operations. | Canonical lifecycle route | Keep generic accept blocked for outline; accept stays dedicated. |

## Canonical Tests To Preserve

- `tests/routes/outline-generation.test.ts`
- `tests/routes/outline-no-silent-write-regression.test.ts`
- `tests/routes/outline-accept.test.ts`
- `tests/routes/outline-checkpoint-audit.test.ts`
- `tests/routes/outline-checkpoints.test.ts`
- `tests/nova/outline-generation-runner.test.ts`
- `tests/nova/outline-generation-state.test.ts`
- `tests/nova/NovaOutlineGenerationPanel.test.ts`
- `tests/nova/NovaOutlineDraftCheckpointCard.test.ts`
- `tests/nova/outline-checkpoint-actions.test.ts`
- `tests/nova/outline-generation-ux-states.test.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `tests/ai/pipeline/outline-checkpoint-contract.test.ts`
- `tests/ai/pipeline/outline-context-builder.test.ts`
- `tests/ai/pipeline/outline-context-sufficiency.test.ts`
- `tests/ai/pipeline/outline-draft-contract.test.ts`
- `tests/ai/pipeline/outline-generation-prompt.test.ts`
- `tests/server/outline/outline-conflict-preflight.test.ts`
- `tests/server/outline/outline-materialization-map.test.ts`

## Documentation Findings

| File | Current state | Classification | Recommended next action |
| --- | --- | --- | --- |
| `dev-docs/03-ai/pipeline.md` | Still documents Write outline as `runAuthorPipelineTask(AUTHOR_OUTLINE)` with a pipeline artifact card. | Stale after consolidation | Update during docs sync after Write mode redirects to checkpoint flow. |
| `dev-docs/04-modules/nova.md` | Documents both legacy Write outline routing and canonical `NovaOutlineGenerationPanel`. | Mixed/stale | Update to say outline generation is checkpoint-only. |
| `dev-docs/03-ai/outline-generation.md` | Documents canonical route/checkpoint/accept flow. | Canonical | Preserve; update only if route names change. |
| `dev-docs/03-ai/agents-map.md` | Lists outline draft checkpoint review card and accept routes. | Canonical | Preserve, but remove any stale legacy surface language if encountered later. |
| `dev-docs/02-architecture/data-model.md`, `dev-docs/04-modules/outline.md` | Describe checkpoint accept materialization. | Canonical | Preserve. |
| `novellum-docs/user/nova.md`, `novellum-docs/user/ai-setup.md` | No direct legacy apply hit in current search. | No immediate action | Re-scan during docs-sync phase. |
| `dev-docs/plans/archive/**` and `dev-docs/plans/plan-040-outline-generation/**` | Historical plan evidence references legacy route discovery and Plan-040 migration context. | Historical | Do not rewrite unless inaccurate current docs are surfaced outside plan history. |

## Risk Notes For Next Phase

- The active user-facing legacy path is Write mode outline request -> `runAuthorPipelineTask(AUTHOR_OUTLINE)` -> `author-outline` artifact -> `NovaOutlineCard` -> `/api/nova/outline/apply`.
- The highest-risk artifact is `/api/nova/outline/apply/+server.ts` because it replaces outline hierarchy rows directly and bypasses checkpoint conflict/stale/audit guards.
- The canonical flow already has strong no-silent-write and review-gate coverage; consolidation should prefer redirecting callers to it over duplicating materialization logic.
- If old `author-outline` messages can persist in the Nova session, `NovaOutlineCard` may need a temporary read-only compatibility state instead of immediate removal.
- Archive plan documents should remain historical; current docs that still point to `runAuthorPipelineTask(AUTHOR_OUTLINE)` should be updated in Stage 004 docs sync.
