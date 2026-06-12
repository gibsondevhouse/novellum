# Registry Inventory Evidence — 2026-06-11

## Scope

Audited Nova Agent-mode tool registration and dispatch surfaces:

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/services/stub-tools.ts`
- `src/modules/nova/index.ts`
- `tests/nova/tool-registry.test.ts`
- `tests/nova/tool-router.test.ts`
- `tests/nova/agent-loop.test.ts`
- `tests/nova/chat-service.test.ts`
- `tests/nova/agent-source-contracts.test.ts`

## Advertisement Surfaces

- `runAgentLoop()` calls `listTools()`, maps every returned definition into an OpenRouter function tool, and sends the full set to `/api/nova/agent`.
- `sendNovaChat()` also attaches `tools = listTools()` to the streaming `/api/ai` payload when `isNovaAgenticEnabled()` is true. That path is marked experimental and does not parse tool-use blocks yet, but it is still an advertisement surface.
- `src/modules/nova/index.ts` imports `./services/agent-tools.js` for module-load registration and calls `registerStubTools()`.
- `registerStubTools()` is currently a no-op and `STUB_TOOLS` is an empty list.

## Handler Import Baseline

`agent-tools.ts` imports author-draft API helpers directly:

- `getSceneDraftContext`
- `generateSceneDraftCheckpoint`
- `listAuthorDraftCheckpoints`
- `acceptSceneDraftCheckpoint`
- `rejectSceneDraftCheckpoint`

The current source-contract test checks for editor/manuscript mutation import patterns, but it does not block these imported author-draft accept/reject helpers.

## Product Tool Inventory

| Tool ID | Required input | Handler reachability | Side effects | Mutation risk |
| --- | --- | --- | --- | --- |
| `project.get_summary` | `projectId` | `GET /api/db/projects/{projectId}` | None through handler; route also supports `PUT`/`DELETE` but handler only uses GET. | Low / read-only |
| `project.list_scenes` | `projectId` | `GET /api/db/scenes?projectId=...` | None through handler; route also supports `POST` but handler only uses GET. | Low / read-only |
| `project.list_characters` | `projectId` | `GET /api/db/characters?projectId=...` | None through handler; route also supports `POST` but handler only uses GET. | Low / read-only |
| `project.list_locations` | `projectId` | `GET /api/db/locations?projectId=...` | None through handler; route also supports `POST` but handler only uses GET. | Low / read-only |
| `project.get_scene` | `sceneId` | `GET /api/db/scenes/{sceneId}` | None through handler; route also supports `PUT`/`DELETE` but handler only uses GET. Returns scene content to the model. | Low / read-only |
| `propose.outline` | `projectId`, `instruction`, `projectContext` | `POST /api/ai` proxy with model messages | No local persistence. Returns a `ProposalEnvelope` for author review. | Low / proposal-only |
| `propose.scene_draft` | `projectId`, `instruction`, `projectContext` | `POST /api/ai` proxy with model messages | No local persistence. Returns a `ProposalEnvelope` for author review. | Low / proposal-only |
| `authorDraft.get_scene_draft_context` | `projectId`, `sceneId` | `GET /api/author-draft/scene-draft-context?projectId=...&sceneId=...` | None through handler. Server builds context from existing project data. | Low / read-only |
| `authorDraft.generate_scene_draft_checkpoint` | `projectId`, `sceneId`; optional `forceRegenerate` | `POST /api/author-draft/checkpoints/generate` | Creates or reuses a persisted author-draft checkpoint in `project_metadata`. On failure, may persist a rejected failure checkpoint. Does not update `scenes.content`. | Medium / review-artifact mutation |
| `authorDraft.list_checkpoints` | `projectId`; optional `chapterId`, `sceneId`, `lifecycle` | `GET /api/author-draft/checkpoints?...` | None through handler. | Low / read-only |
| `authorDraft.accept_checkpoint` | `projectId`, `checkpointId`, `sceneId`; optional `forceOverwrite` | `POST /api/author-draft/checkpoints/{checkpointId}/accept` | Updates `scenes.content`, `scenes.wordCount`, `scenes.updatedAt`, and marks the checkpoint `accepted`. `forceOverwrite` can bypass stale-target protection. | High / direct manuscript mutation |
| `authorDraft.reject_checkpoint` | `projectId`, `checkpointId`, `reason` | `POST /api/author-draft/checkpoints/{checkpointId}/reject` | Marks the persisted checkpoint `rejected` with `rejectReason` and `rejectedAt`. Does not update scene prose but is still an author decision. | High / review-decision mutation |

## Test-Only Registrations

The following IDs are registered only in tests and are not product tools:

- `sample.tool`
- `sample.other`
- `test.echo`
- `test.loop`
- `test.fake-tool`

These test registrations are useful for registry and dispatch behavior, but they do not affect the production module-load registry.

## Mutation-Suspect Tools

Must move behind a UI-issued command boundary:

- `authorDraft.accept_checkpoint`
- `authorDraft.reject_checkpoint`

Can remain candidate model-callable tools only if the next phase labels them explicitly as review-artifact generation and filters direct mutation capabilities:

- `authorDraft.generate_scene_draft_checkpoint`

No registered Nova Agent tool currently reaches the worldbuilding proposal accept/reject routes or outline checkpoint accept/reject routes directly.

## Follow-Up For Stage 001 / Phase 002

- Add an explicit capability class to tool definitions or a registry-side policy map.
- Distinguish read-only, proposal-only, review-artifact creation, and mutation commands.
- Make source-contract tests fail on imports or advertised IDs for `acceptSceneDraftCheckpoint`, `rejectSceneDraftCheckpoint`, `authorDraft.accept_checkpoint`, and `authorDraft.reject_checkpoint`.
- Preserve model-callable read and review-artifact tools while requiring explicit UI actions for accept/reject flows.
