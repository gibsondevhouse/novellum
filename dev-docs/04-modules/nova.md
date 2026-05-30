# Module: `nova`

> Last verified: 2026-05-28 (plan-031 stage-005 docs sync)
> Source: [src/modules/nova/](../../src/modules/nova/)

## Purpose

Dedicated conversational copilot surface and panel state for Nova, including retrieval-context disclosure, message streaming, tool-call/result rendering, and the bounded Agent-mode tool loop.

## Canonical Runtime

The embedded editor sidepanel (`src/modules/nova/*`) is the canonical Nova runtime for plan-031 and forward. `/nova` remains a legacy fullscreen surface; do not add new Nova capabilities there without a dedicated migration plan.

## Structure

```text
src/modules/nova/
├── components/    # NovaPanel, message log, composer, mode picker, attachment popover, model picker
├── stores/        # panel open/close, session messages, nova mode
├── services/      # chat-service, context-hooks, tool-registry, tool-router,
│                  # agent-loop, agent-tools, author-pipeline-runner
├── utils/         # attachment-validator, classify-nova-error
├── types.ts
└── index.ts
```

## Mode and Review-Gate Boundaries

`NovaMode = 'ask' | 'write' | 'agent'` (replaces old `chat | scribe`).

- **Ask** — conversational and grounded; routes through the `ask` task resolver. Single-shot streaming via `OpenRouterClient`. No tools advertised.
- **Write** — structured proposal generation. Outline requests route to `runAuthorPipelineTask(AUTHOR_OUTLINE)`; other concrete write requests render an explicit limitation card (`unsupported_action`). Supported sub-actions: `outline`, `scene`, `revision` (`WriteSubAction`). No tool calling.
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

## Ownership Guardrails

- New Nova capability work lands in `src/modules/nova/*` first.
- Do not add sidepanel-only features to `ChatInterface.svelte` unless explicitly deferred and documented.
- Agents must never auto-apply changes to manuscript, editor state, or project entities. All generated content requires explicit user acceptance.

## Key Tests

- `tests/nova/*`
- `tests/visual/editor-nova-panel*.test.ts`
