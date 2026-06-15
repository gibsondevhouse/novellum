# Plan-046 Route Inventory Evidence

Date: 2026-06-12
Part: Stage 001 / Phase 001 / Part 001

## Method

- Searched `src/routes/api`, `src/lib/project-metadata.ts`, `src/modules/**/services`, `src/modules/**/stores`, `tests/routes`, `tests/e2e`, and `tests/nova` for checkpoint, proposal, outline, author-draft, worldbuild, and project-metadata routes.
- Read the active route handlers and client helpers directly.
- No runtime source changed for this evidence-only part.

## Route Ownership Map

| Family | Route | Methods | Owner / Storage | Lifecycle Operations | Current Role |
| --- | --- | --- | --- | --- | --- |
| Generic project metadata list | `/api/db/project-metadata/{projectId}/{scope}/{ownerId}` | `GET` | `project_metadata` rows by scope/owner | list only | Compatibility list surface for `scene`, `chapter`, `project`, and `pipeline` scopes. |
| Generic project metadata item | `/api/db/project-metadata/{projectId}/{scope}/{ownerId}/{key}` | `GET`, `PUT`, `DELETE` | `project_metadata` row | non-pipeline `PUT { value }`; pipeline `PUT { operation }`; delete | Compatibility item surface. Pipeline behavior dispatches by owner and operation. |
| Worldbuild checkpoint lifecycle | generic metadata item with owner `vibe-worldbuild` | `PUT` | `WorldbuildCheckpointRecord` in `project_metadata` | `upsert`, `review`, `accept`, `reject` | Current route for older staged worldbuild checkpoints and e2e checkpoint console coverage. |
| Worldbuilding scan proposal generation | `/api/worldbuilding/scan` | `POST` | `WorldbuildProposalRecord` persisted under owner `vibe-worldbuild-scan` | create pending proposals | Canonical proposal generation route for scan suggestions. |
| Worldbuilding proposal review | `/api/worldbuilding/proposals/{proposalId}/accept`, `/api/worldbuilding/proposals/{proposalId}/reject` | `POST` | `WorldbuildProposalRecord`; fallback to legacy worldbuild checkpoint service | accept / reject | Canonical route for scan proposal accept/reject, with a legacy checkpoint fallback. |
| Author draft context | `/api/author-draft/scene-draft-context` | `GET` | derived from project/chapter/scene/canon | read only | Context route for scene draft generation. |
| Author draft checkpoints | `/api/author-draft/checkpoints` | `GET` | `AuthorDraftCheckpoint` records under owner `authorDraftCheckpoints.v1` | list with filters | Canonical list route for author draft checkpoints. |
| Author draft generation | `/api/author-draft/checkpoints/generate` | `POST` | `AuthorDraftCheckpoint` records | create review checkpoint, reuse active review unless forced | Canonical generation route. |
| Author draft review actions | `/api/author-draft/checkpoints/{checkpointId}/accept`, `/api/author-draft/checkpoints/{checkpointId}/reject` | `POST` | `AuthorDraftCheckpoint` service | accept / reject | Canonical visible-card mutation routes. |
| Outline generation | `/api/ai/outline/generate` | `POST` | `OutlineDraftCheckpointRecord` under owner `outlineDraftCheckpoints.v1` | creates draft then moves to review | Canonical outline generation route. |
| Outline checkpoint metadata lifecycle | generic metadata item with owner `outlineDraftCheckpoints.v1` | `GET`, `PUT`, `DELETE` | `OutlineDraftCheckpointRecord` | `upsert`, `review`, `reject`; `accept` blocked with 409 | Compatibility metadata route for listing, fixture upsert, review, and reject. |
| Outline checkpoint materialization | `/api/outline/checkpoints/{checkpointId}/accept` | `POST` | `acceptOutlineCheckpointMaterialization()` | accept with preconditions and hierarchy materialization | Canonical outline accept route. |
| Legacy Nova outline apply | `/api/nova/outline/apply` | `POST` | none | none | Retired route; returns `410 outline_apply_retired`. |
| Worldbuilding entity draft generation | `/api/worldbuilding/generate` | `POST` | non-checkpoint generated entity draft flow | create generated entity draft | Adjacent generation route, not a checkpoint lifecycle owner. |

## Source Anchors

- Generic metadata list: `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/+server.ts:10`.
- Generic metadata item methods and pipeline dispatch: `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts:102`, `:110`, `:125`, `:157`, `:170`, `:179`, `:186`, `:193`, `:221`.
- Project metadata client helpers: `src/lib/project-metadata.ts:93`, `:99`, `:147`, `:166`, `:192`.
- Author draft client and route helpers: `src/modules/nova/services/author-draft-api.ts:53`, `:69`, `:96`, `:117`, `:138`; `src/routes/api/author-draft/checkpoints/+server.ts:13`; `src/routes/api/author-draft/checkpoints/generate/+server.ts:99`; `src/routes/api/author-draft/checkpoints/[checkpointId]/accept/+server.ts:25`; `src/routes/api/author-draft/checkpoints/[checkpointId]/reject/+server.ts:22`.
- Outline generation and actions: `src/modules/nova/services/outline-generation-runner.ts:15`; `src/routes/api/ai/outline/generate/+server.ts:227`, `:350`, `:354`; `src/modules/nova/services/outline-checkpoint-actions.ts:93`, `:99`, `:147`, `:166`, `:192`; `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts:33`; `src/routes/api/nova/outline/apply/+server.ts:4`.
- Worldbuilding scan/proposal routes: `src/routes/api/worldbuilding/scan/+server.ts:584`; `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts:21`, `:36`, `:42`, `:58`; `src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts:21`, `:39`, `:45`, `:61`.
- Worldbuilding clients/stores: `src/modules/world-building/services/worldbuilding-proposal-service.ts:11`, `:25`; `src/modules/world-building/stores/world-building-store.svelte.ts:87`, `:98`, `:114`, `:126`.

## Tests And Clients By Route Family

| Family | Tests / Clients |
| --- | --- |
| Generic metadata worldbuild checkpoints | `tests/routes/project-metadata-pipeline-scope.test.ts`; `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`; `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts`; `src/modules/world-building/stores/world-building-store.svelte.ts`. |
| Worldbuilding scan proposals | `tests/routes/worldbuilding-scan.test.ts`; `tests/routes/worldbuilding-proposals.test.ts`; `src/modules/world-building/services/worldbuilding-proposal-service.ts`; proposal UI callbacks. |
| Author draft checkpoints | `tests/ai/pipeline/author-draft-checkpoint-service.test.ts`; Nova checkpoint card and mutation-boundary tests; `src/modules/nova/services/author-draft-api.ts`. |
| Outline checkpoints | `tests/routes/outline-checkpoints.test.ts`; `tests/routes/outline-accept.test.ts`; `tests/routes/outline-checkpoint-audit.test.ts`; `tests/routes/outline-no-silent-write-regression.test.ts`; `tests/e2e/outline-generation-review.spec.ts`; `tests/nova/outline-checkpoint-actions.test.ts`; `tests/nova/NovaOutlineDraftCheckpointCard.test.ts`. |
| Retired Nova outline apply | `tests/routes/nova-outline-apply-route.test.ts`; `tests/nova/nova-artifact-cards.test.ts`. |

## Duplicate Or Legacy Responsibilities

- Generic metadata remains a mixed compatibility route: it handles ordinary metadata writes, worldbuild checkpoint lifecycle, and outline upsert/review/reject.
- Outline accept is intentionally not generic. `operation: "accept"` for owner `outlineDraftCheckpoints.v1` returns `409 invalid_transition`; materialization is only through `/api/outline/checkpoints/{checkpointId}/accept`.
- Worldbuilding proposal accept/reject routes first try new-style proposal records only when `projectId` is present in the request body, then fall back to legacy `worldbuildCheckpointService`.
- The current `worldbuilding-proposal-service.ts` client calls proposal accept/reject with only `proposalId` and does not include `projectId`, which means the new-style persisted proposal path is skipped by the route. This should be classified before Stage 003 chooses an adapter or route update.
- `/api/nova/outline/apply` remains present only as a retired compatibility route returning `410`.

## Result

Acceptance criteria are satisfied for route inventory. The next stage work should use this map to choose which generic metadata lifecycle operations remain compatibility contracts and which task-specific routes are canonical.
