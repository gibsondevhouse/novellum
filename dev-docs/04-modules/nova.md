# Module: `nova`

> Last verified: 2026-06-12 (plan-043 outline consolidation)
> Source: [src/modules/nova/](../../src/modules/nova/)

## Purpose

Dedicated conversational copilot surface and panel state for Nova, including retrieval-context disclosure, message streaming, tool-call/result rendering, and the bounded Agent-mode tool loop.

## Canonical Runtime

The embedded editor sidepanel (`src/modules/nova/*`) is the canonical Nova runtime for plan-031 and forward. `/nova` remains a legacy fullscreen surface; do not add new Nova capabilities there without a dedicated migration plan.

## Structure

```text
src/modules/nova/
├── components/    # NovaPanel, message log, composer, outline generation/review cards
├── stores/        # panel open/close, session messages, nova mode, outline generation state
├── services/      # chat-service, context-hooks, tool-registry, tool-router,
│                  # agent-loop, agent-tools, author-pipeline-runner, outline checkpoint/generation runners
├── utils/         # attachment-validator, classify-nova-error
├── types.ts
└── index.ts
```

## Mode and Review-Gate Boundaries

`NovaMode = 'ask' | 'write' | 'agent'` (replaces old `chat | scribe`).

- **Ask** — conversational and grounded; routes through the `ask` task resolver. Single-shot streaming via `OpenRouterClient`. No tools advertised.
- **Write** — structured proposal generation. Outline requests route to `outlineGenerationState.generate()` and persist review checkpoints through `POST /api/ai/outline/generate`; other concrete write requests render an explicit limitation card (`unsupported_action`). Supported sub-actions: `outline`, `scene`, `revision` (`WriteSubAction`). No tool calling.
- **Agent** — real bounded tool-calling loop (`runAgentLoop`). Calls `/api/nova/agent` (server-side, key-hidden). Dispatches tools through `dispatchTool`. Returns proposal envelopes; never auto-applies to manuscript or editor state. Hard cap: `MAX_AGENT_STEPS = 8`. User abort via `novaSession.abort()`.

Mode persists per-project via sessionStorage key `novellum.nova.mode.<projectId>`. Invalid persisted values fall back to `ask`. `Cmd+.` / `Ctrl+.` cycles modes in the composer.

## Agent Loop Contract

```text
while (stepCount < MAX_AGENT_STEPS):
  POST /api/nova/agent → { content, tool_calls, finish_reason }
  if tool_calls:
    append tool-call chip to session
    dispatchTool() → tool result
    append tool-result chip to session
    push tool message to history
    stepCount++
  else:
    stream final content → return
cap hit → append cap-exhaustion nova message → return
AbortError → return silently
transport error → novaSession.fail(id, msg)
```

Agent tools are registered at module load via `agent-tools.ts` (imported as a side effect in `index.ts`).

### Registered Agent Tools

| Tool ID | Type | Description |
| --- | --- | --- |
| `project.get_summary` | read | Fetches full project record from `/api/db/projects/{projectId}` |
| `project.list_scenes` | read | Lists all scenes for a project |
| `project.list_characters` | read | Lists all characters for a project |
| `project.list_locations` | read | Lists all locations for a project |
| `project.get_scene` | read | Fetches a single scene record |
| `propose.outline` | proposal | Generates an outline proposal via `/api/ai`; returns `ProposalEnvelope` |
| `propose.scene_draft` | proposal | Generates a scene draft proposal via `/api/ai`; returns `ProposalEnvelope` |

### No-Mutation Guarantee

Source-contract tests (`tests/nova/agent-source-contracts.test.ts`) statically assert that `agent-tools.ts` and `agent-loop.ts` do not import from editor mutation paths, manuscript write paths, `scene-store`, `editor-store`, or call `applyProposal`/`writeManuscript`/`mutateScene`.

## Attachments

Users can attach context to a Nova conversation via the `+` button in the composer:

- **Project tab** — attach scenes, characters, or locations as entity chips. Entities are fetched from existing DB API endpoints.
- **Upload tab** — attach `.md` or `.txt` files, maximum 100KB, parsed as plain text.

Attached items are serialized into the system prompt suffix (`buildAttachmentContext`) as a `# User-Attached Context` block. They are counted separately in the context disclosure pill (`attachedCount`). Attachments clear on new chat.

Invalid files (wrong extension, too large, empty content) are rejected at both client (`validateAttachmentFile`) and server (`validateAttachment`) boundaries.

## Context Grounding Contract

- When `projectId` exists, Nova includes a compact project summary baseline before scene/outline/world scopes.
- Baseline grounding is present even when `activeSceneId` is null (no-scene fallback).
- Baseline fields include project title, genre, status, project type, target word count, logline, synopsis, style preset id, updated timestamp, entity counts, and first story-frame summary when available.
- Full manuscript text is never sent by default.

### Context Resolution (Plan-044)

Nova relies on the `activeContext` store (`src/lib/stores/active-context.svelte.ts`) to stay synchronized with the active project, scene, and chapter. 

- **Resolution Order**: Query Params > Route Params > Page Data (`page.data`).
- **Visibility**: The `NovaAuthorDraftEngine` is automatically enabled on any route identifying an `activeChapterId` (including deep editor routes and chapter outline details).
- **Grounding**: The `ask` and `write` modes use the resolved `activeSceneId` to attach live editor intent and adjacent scene context even when navigating via route paths (e.g., `/projects/[id]/editor/[sceneId]`).

## Outline Generation Surface

Plan-040 adds the Nova outline generation panel:

- `NovaOutlineGenerationPanel.svelte` checks outline context readiness through `buildRagContext({ policy: 'outline_scope' })`, then drives generation through `outlineGenerationState`.
- `outline-generation-runner.ts` calls `POST /api/ai/outline/generate` and exposes safe result variants for success, low context, schema failure, provider/credential failure, abort, and conflict warnings.
- `NovaOutlineDraftCheckpointCard.svelte` renders the proposed Arc -> Act -> Chapter -> Scene tree with scene intent fields and source context metadata.
- `outline-checkpoint-actions.ts` uses the generic project-metadata route for reject and the dedicated materialization route for accept.
- Legacy `author-outline` artifact cards are compatibility-only. They render read-only payload/copy output and cannot apply hierarchy changes. `/api/nova/outline/apply` is retired with an explicit unsupported response.

Panel states:

| State | Meaning |
| --- | --- |
| `empty` | No project is selected. |
| `loading` | Nova is checking context readiness. |
| `blocked` | Required project/worldbuilding signals are missing. |
| `ready` | Context is sufficient; generation can run. |
| `running` | Provider request is in progress. |
| `failed` | Safe failure copy is shown and retry is available where possible. |
| `cancelled` | Abort completed without mutating project data. |
| `review-ready` | A proposed checkpoint is ready for author review. |
| `accepted` | The server accepted and materialized the checkpoint. |
| `rejected` | The checkpoint was rejected. |

Review-card guardrails:

- Accept is enabled only for `review` checkpoints.
- Accept sends `expectedUpdatedAt` and `expectedVersion` so stale checkpoints return `stale_checkpoint`.
- Existing outline hierarchy returns conflict copy and does not change the checkpoint lifecycle.
- `materialization_failed` is shown as rollback-safe copy and leaves the proposal pending review.
- Reject requires a reason and never writes hierarchy rows.

Nova does not merge generated outlines into existing outline data, regenerate in place, or auto-start manuscript drafting after accept.

## Ownership Guardrails

- New Nova capability work lands in `src/modules/nova/*` first.
- Do not add sidepanel-only features to `ChatInterface.svelte` unless explicitly deferred and documented.
- Agents must never auto-apply changes to manuscript, editor state, or project entities. All generated content requires explicit user acceptance.

## Key Tests

- `tests/nova/*`
- `tests/visual/editor-nova-panel*.test.ts`
