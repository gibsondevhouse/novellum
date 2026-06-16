# AI Pipeline

> Last verified: 2026-06-15 (plan-052 Nova/editor trust closure)

Every AI feature in Novellum follows the same review-gated pipeline.
The runtime agents (continuity / edit / rewrite / style) live in
[src/lib/ai/](../../src/lib/ai/), the V1.1 staged-pipeline scaffolding
lives in [src/lib/ai/pipeline/](../../src/lib/ai/pipeline/), and the
server-side governed controller runtime lives in
[src/lib/server/ai/controller/](../../src/lib/server/ai/controller/).
The controller centralizes intent resolution, policy checks, context
packet construction, workflow routing, model gateway calls, output
validation, artifact lifecycle, and redacted run logging.

## Pipeline diagram

```text
User action
   │
   ▼
AI Controller       (server/ai/controller)      intent → policy → context → workflow
   │
   ├─ blocks unsupported or unsafe operations before model/provider calls
   │
   └─ persists reviewable artifacts instead of applying mutations directly
   │
   ▼
TaskResolver         (task-resolver.ts)         picks an agent for a TaskType
   │
   ▼
ContextBuilder       (context-builder.ts)       selects + serializes minimal context
   │
   ▼  (uses context-engine.ts policies)
PromptBuilder        (prompt-builder.ts)        ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT
   │
   ▼
ModelRouter          (model-router.ts)          chooses an OpenRouter model for the task
   │
   ▼
/api/ai (server)     (src/routes/api/ai)        proxies to OpenRouter, hides API key
   │
   ▼
Agent parser         (continuity-agent.ts, …)   validates response against output schema
   │
   ▼
Suggestion surface   (module UI)                author reviews and explicitly accepts
```

## Governed controller runtime

Plan-051 introduces the controller as the server-side control plane for
AI execution. New workflow work should start by adding or updating a
controller workflow definition instead of calling providers directly.

| File | Purpose |
| --- | --- |
| `contracts.ts` | Request/response envelopes, task statuses, target/source taxonomy, artifact status, and structured error codes. |
| `intents.ts` / `intent-resolver.ts` | Deterministic author-action to controller-intent classification. Unsupported or source-mismatched actions become `unsupported`. |
| `permissions.ts` / `policy-guard.ts` | Read-only, proposal-only, review-decision, and mutation permission metadata. Direct mutation workflows are blocked unless a trusted human review route supplies explicit approval. |
| `context-packet.ts` / `context-builder.ts` | Bounded context packet construction with source disclosure, token estimates, truncation metadata, and context hashing. |
| `workflow-contracts.ts` / `workflow-registry.ts` | Workflow definitions for Nova ask/agent, prose assistance, continuity, outline, author draft, worldbuilding scan/generate, and artifact accept/reject. |
| `model-gateway.ts` | Provider abstraction that builds controller prompts, applies workflow model settings, and attaches JSON-schema response formats where required. |
| `output-schemas.ts` | Zod-backed output validation for text, tool responses, artifact references, proposal lists, and draft lists. |
| `artifact-lifecycle.ts` / `artifact-service.ts` | Review artifact state transitions and SQLite-backed `project_metadata` persistence under `aiControllerArtifacts.v1`. |
| `run-log.ts` | Redacted run/audit logs under `aiControllerRuns.v1`; prompt/message-like fields are redacted by default. |
| `controller.ts` | Orchestrates request → intent → policy → context → workflow → model → validation → artifact/log response. |

The new `/api/ai-controller` endpoint exposes the governed runtime for
controller-native workflows. Existing shipped synchronous routes
(`/api/ai`, `/api/nova/agent`, `/api/ai/outline/generate`,
`/api/author-draft/checkpoints/generate`, `/api/worldbuilding/scan`,
and `/api/worldbuilding/generate`) are wrapped with safe controller
audit logging so they remain behavior-compatible while still producing
controller run evidence. Further endpoint-by-endpoint migration can move
their model calls fully into `controller.execute()` without changing the
review-gate contract.

## Prompt schema

All prompts conform to:

1. **ROLE.** Identity. ("You are the Novellum ContinuityAgent.")
2. **TASK.** Single-responsibility objective.
3. **CONTEXT.** Scoped, serialized JSON. Never the full manuscript.
4. **CONSTRAINTS.** Explicit negatives. ("Do not invent facts outside CONTEXT.")
5. **OUTPUT FORMAT.** Strict schema. The agent's parser will reject anything else.

The literal templates live in [src/lib/ai/constants.ts](../../src/lib/ai/constants.ts) and [src/lib/ai/prompt-builder.ts](../../src/lib/ai/prompt-builder.ts).

## Files in `src/lib/ai/`

| File | Purpose |
| --- | --- |
| `orchestrator.ts` | High-level entry point + factory used by modules. |
| `task-resolver.ts` | TaskType → agent dispatcher. |
| `context-builder.ts` | Builds the CONTEXT JSON for a given task + project state. |
| `context-engine.ts` | Scoping policies (`scene_only`, `scene_plus_adjacent`, `continuity_scope`, …). |
| `context-files.ts` | Reads/serializes optional context files. |
| `prompt-builder.ts` | Assembles the final prompt string from template + parts. |
| `model-router.ts` | Picks an OpenRouter model based on task profile. |
| `constants.ts` | Roles, system prompts, default schemas. |
| `serializer.ts` | JSON encoder/decoder for context payloads. |
| `markdown.ts` | Markdown parsing for AI responses. |
| `style-presets.ts` | Tone/style templates used by StyleAgent. |
| `credential-service.ts` | OpenRouter key access (server-side only via keyring). |
| `openrouter.ts` | HTTP client for OpenRouter. |
| `providers/` | Provider-specific adapters. |
| `types.ts` | Task types, output interfaces, context policy enum. |
| `continuity-agent.ts` | ContinuityAgent parser. |
| `edit-agent.ts` | EditAgent parser. |
| `rewrite-agent.ts` | RewriteAgent parser. |
| `style-agent.ts` | StyleAgent parser. |
| `index.ts` | Public barrel. |

## Files in `src/lib/ai/pipeline/` (V1.1 staged pipeline)

Introduced in plan-027-v1.1-scoping. The staged pipeline runs alongside
the runtime agents — it does not replace them. It owns the multi-stage
`vibe-worldbuild` and `vibe-author` families gated by reviewer
checkpoints.

| File | Purpose |
| --- | --- |
| `contracts.ts` | `OUTLINE_HIERARCHY` 7-tuple, `PipelineTaskContract`, `PipelineArtifactEnvelope<T>`, `createPipelineArtifactEnvelope()`. |
| `index.ts` | Public barrel for pipeline contracts introduced by plan-040. |
| `task-catalog.ts` | `PIPELINE_TASK_KEYS`, `PIPELINE_TASK_CATALOG`, `PIPELINE_TASK_FAMILIES`, `resolvePipelineAction()`. |
| `prompt-library.ts` / `prompt-library-seeds.ts` | Per-stage prompt scaffolds (ROLE / TASK / CONSTRAINTS / OUTPUT). |
| `outline-context-builder.ts` / `outline-context-sufficiency.ts` | Deterministic context packet and readiness gate for plan-040 outline generation. |
| `outline-generation-prompt.ts` | ROLE / TASK / CONTEXT / CONSTRAINTS / OUTPUT prompt bundle and bounded repair prompt for outline generation. |
| `outline-draft-contract.ts` | `OutlineDraft`, `OutlineDraftCheckpointRecord`, `outlineDraftSchema`, and validation helpers for plan-040 outline generation checkpoints. |
| `outline-checkpoint-service.ts` / `outline-checkpoint-contract.ts` | Metadata-route lifecycle helpers and typed client actions for outline draft checkpoints. |
| `worldbuild-schemas.ts` | Zod schemas for the four `vibe-worldbuild.*` payloads (premise / worldspec / research / populated-bible). |
| `worldbuild-agent.ts` | `parseWorldbuildOutput()`, `createWorldbuildArtifactFromModelOutput()`, populated-bible normalizer. |
| `checkpoint-contract.ts` | `PIPELINE_CHECKPOINT_SCHEMA_VERSION='1.0.0'`, `WorldbuildCheckpointRecord`, lifecycle guards. |
| `checkpoint-service.ts` | `createWorldbuildCheckpointService(database)` — `upsert / review / accept / reject / list / get`. All mutations atomic. |

### vibe-worldbuild checkpoint flow

Four pipeline tasks ship today (`vibe-worldbuild.premise`,
`.worldspec`, `.research`, `.populated-world-bible`). Each artifact
envelope is stored in `project_metadata` under scope `'pipeline'` with
owner `'vibe-worldbuild'` and the artifact id as the key. The
lifecycle is `draft → review → accepted | rejected`.

Only `vibe-worldbuild.populated-world-bible` writes to canon. On
`accept`, `checkpoint-service.ts` opens a single SQLite transaction and
inserts into `factions`, `characters` (with `factionId` resolved by
name match), `locations`, `themes`, `glossary_terms`, `lore_entries`,
`plot_threads`, and `timeline_events`. A second `accept` on the same
checkpoint is idempotent. `reject` requires a non-empty `reason` and
preserves it on the record without touching canon.

The HTTP surface is
`/api/db/project-metadata/{projectId}/pipeline/{ownerId}/{key}` with a
discriminated `operation` payload (`upsert | review | accept | reject`).
The vibe-author review-gate surface ships separately from this
worldbuild checkpoint flow.

### vibe-author review-gate flow

Stage-003 phase-003 ships the author drafting + revision surface:

- `src/lib/ai/pipeline/author-agent.ts` parses model output into
  `AuthorSceneDraftPayload` (prose + sidecar) and the revision pack
  schema.
- `src/lib/ai/pipeline/author-schemas.ts` exposes the Zod schemas and
  `AUTHOR_SEVERITY_ORDER` (`critical → high → medium → low`).
- `src/modules/nova/services/author-pipeline-runner.ts` —
  `runAuthorPipelineTask()` resolves the task, builds RAG context,
  streams via `OpenRouterClient.complete`, parses the result, and
  attaches a `NovaArtifact` to the Nova message via
  `novaSession.attachArtifact()`. Result variants surface
  `invalid_task | parse_failed | transport_failed | aborted` reasons.
- `vibe-author.outline` artifacts are compatibility-only after plan-043:
  supported Write-mode outline requests use the checkpoint flow described
  below, and legacy outline artifact cards render read-only JSON/copy output.
- `src/modules/nova/components/NovaSceneDraftCard.svelte` renders the
  scene-draft envelope with explicit `Accept` / `Reject` / `Copy`
  controls. `Accept` saves the inline artifact as a durable author-draft
  checkpoint before the UI offers `Confirm apply`; confirmed apply uses
  the existing checkpoint accept route with dirty-editor and stale-target
  safeguards. `Reject` stages and rejects the saved checkpoint. `Copy`
  remains a local clipboard utility.
- `src/modules/nova/components/NovaRevisionPackCard.svelte` renders
  the revision-pack envelope as a severity-sorted issue list with a
  per-issue `Acknowledge` action. Acknowledgements are durable review
  progress only; they do not modify manuscript or canon content.
- `src/modules/nova/components/NovaMessageLog.svelte` branches on
  `message.artifact?.kind` to pick the right card.
- `src/modules/nova/services/inline-scene-draft-actions.ts` stages
  inline scene drafts through
  `POST /api/author-draft/checkpoints/stage-inline` and maps missing
  context, stale targets, failed persistence, and successful checkpoint
  creation into typed Nova artifact action results.
- `src/modules/nova/services/revision-pack-acknowledgements.ts` stores
  acknowledged revision issue ids in project metadata under owner
  `novaRevisionPackAcknowledgements.v1`, keyed by stable artifact
  identity.

The review-gate guardrail is enforced at three layers:

1. **Component contract** — source-string tests
   (`tests/ai/pipeline/scene-draft-sidecar.test.ts`,
   `tests/ai/pipeline/revision-pack.test.ts`) forbid any
   manuscript-write import (`insertText`, `applyEdit`,
   `manuscriptStore`, `editorStore`).
2. **Runner contract** — Vitest coverage
   (`tests/nova/services/author-pipeline-runner.test.ts`) asserts the
   runner only attaches an artifact; it never reaches into the editor.
3. **HTTP contract** — Playwright spec
   (`tests/e2e/vibe-author-review-gates.spec.ts`) drives
   draft → review → accept for the scene-draft key and
   draft → reject for the revision-pack key, then verifies that
   `/api/db/scenes` and `/api/db/chapters` are still empty for the
   project. Manuscript content is never auto-mutated by the
   review-gate.

Inline scene-draft action results carry artifact action audit vocabulary
(`artifact.accept`, `artifact.reject`, target ids, checkpoint id, and
optional controller run/job ids) so future controller-native ledgers can
reuse the same semantics. The current shipped mutation boundary remains
the author-draft checkpoint route; Nova chat cards never apply manuscript
prose without explicit confirmation.

### vibe-outline generation flow (plan-040)

Plan-040 ships AI-assisted outline generation as a review-gated
pipeline surface. Generated outlines are proposals, not canon, until
the author explicitly accepts them.

- `OUTLINE_DRAFT_TASK_KEY` is `vibe-outline.draft`.
- Outline checkpoints use owner id `outlineDraftCheckpoints.v1` and
  lifecycle `draft | review | accepted | rejected`.
- `POST /api/ai/outline/generate` builds an `OutlineContextPacket`,
  blocks low-context requests with `context_not_ready`, calls the
  selected provider with a strict JSON schema response format, validates
  `OutlineDraft`, performs one bounded repair attempt on schema failure,
  and stores the valid result as a `review` checkpoint.
- `OutlineDraft` requires nested Arc -> Act -> Chapter -> Scene nodes.
  Every node has a stable `id`, `slug`, `title`, and `order`.
- Every generated scene includes intent fields: `goal`, `conflict`,
  `turn`, and `outcome`. These are stored on accept for downstream
  `SceneDraftContext` compatibility.
- `sourceContext` records the summarized worldbuilding context, included
  domains, entity counts, context hash, and prompt version.
- The generic project metadata route supports outline upsert, review,
  and reject. It deliberately rejects outline accept operations.
- Canon materialization is only available through
  `POST /api/outline/checkpoints/{checkpointId}/accept` with
  `expectedUpdatedAt` and `expectedVersion` stale preconditions.
- Accept writes hierarchy rows and scene intent metadata in one
  transaction, then updates checkpoint lifecycle as the final write.
  Failed materialization rolls back and returns safe
  `materialization_failed` copy.
- Existing hierarchy rows return `outline_conflict`; plan-040 does not
  merge, overwrite, or regenerate existing outlines in place.

See [outline-generation.md](./outline-generation.md) for the complete
contract, route surface, Nova states, and limitations.

### Nova mode/workflow boundaries (plan-031)

Plan-031 ships three explicit modes and a real bounded Agent-mode tool loop.

**Mode routing** (`sendNovaChat` → `chat-service.ts`):

| Mode | Route | Tools | Output |
| --- | --- | --- | --- |
| `ask` | `OpenRouterClient.streamComplete` | None | Streamed nova message |
| `write` (outline) | `outlineGenerationState.generate()` -> `POST /api/ai/outline/generate` | None | Outline checkpoint review card |
| `write` (unsupported) | Explicit limitation card | None | `unsupported_action` message |
| `agent` | `runAgentLoop` → `/api/nova/agent` | Registered agent tools | Tool chips + proposal envelope |

**Agent loop** (`agent-loop.ts`, max 8 steps):

1. `POST /api/nova/agent` with system prompt, message history, and `ToolDefinition[]` in OpenRouter tool format.
2. Parse `{ content, tool_calls, finish_reason }`.
3. For each tool call: dispatch via `dispatchTool`, append tool-call and tool-result chips, push `{ role: 'tool' }` message to history.
4. Repeat until no tool calls or `MAX_AGENT_STEPS` reached.
5. Cap exhaustion appends a visible nova message; user abort exits cleanly.

**Attachment context scope** (`'user-attached'`):

User-attached entities and files are appended to the system prompt as `# User-Attached Context` after the RAG-derived context. They are counted separately in the context disclosure pill. Attachment scope is additive; it does not replace or truncate the RAG context. Files are validated at client (`validateAttachmentFile`) and server (`validateAttachment`) before inclusion.

**No-mutation guarantee**:

- Agent read tools are pure functions over existing DB API endpoints.
- Proposal tools return `ProposalEnvelope { kind: 'agent-proposal', proposalType, content }` and never write to manuscript, editor, or project entities.
- Source-contract tests (`tests/nova/agent-source-contracts.test.ts`) statically assert that tool handler files contain no editor/manuscript mutation imports.

Key enforcement tests:

- `tests/nova/agent-loop.test.ts` — loop terminal states, tool dispatch, cap, abort
- `tests/nova/agent-source-contracts.test.ts` — no-mutation import contracts
- `tests/nova/attachments.test.ts` — attachment validation, session lifecycle
- `tests/nova/mode-routing.test.ts` — ask/write/agent routing contracts

See [ADR-0027](../02-architecture/adr/adr-0027-pipeline-entity-scope.md)
for the V1.1 scope decision.

Legacy outline artifact apply is retired. `/api/nova/outline/apply`
returns `410 outline_apply_retired`; the only hierarchy materialization
route for generated outlines is
`POST /api/outline/checkpoints/{checkpointId}/accept`.

### Outline-first worldbuild UI (plan-028)

Plan-028 ships the hierarchical pipeline UI at `/projects/[id]/outline`.
The outline page renders a seven-layer hierarchy navigator
(Arc → Act → Milestone → Chapter → Scene → Beat → Stage) and a stage
detail panel that drives the worldbuild run/review/decision workflow.

**Run flow:** Stage selection + "Run Stage Pipeline" button →
`worldbuild-pipeline-runner.ts` validates the `PipelineHierarchyPath`,
sends task payload to `/api/ai`, parses via `createWorldbuildArtifactFromModelOutput`,
stages result as a `draft` checkpoint via project-metadata API. Runtime
states (`idle → ready → queued → running → completed_pending_checkpoint | failed`)
are managed in `outline-store.svelte.ts`.

**Review console:** The stage detail panel includes a checkpoint queue
with lifecycle filters (all / pending / accepted / rejected), an
artifact review detail panel (metadata grid, hierarchy references,
collapsible payload viewer), and explicit accept/reject decision
controls. Accept requires `review` lifecycle; reject requires a
non-empty reason.

**Canon safety:** No entity table writes occur during run or staging.
Canon projection happens only when `checkpoint-service.ts` processes an
`accept` operation on a `populated-world-bible` checkpoint. Source-contract
tests enforce this guarantee (89 tests across 6 test files). E2E specs
cover traversal, run/review/accept, reject/failure, and
invalid-transition handling.

**Deferred:** `vibe-author` UI parity is explicitly out of scope for
plan-028.

## Server boundary

The browser never holds the OpenRouter API key. Model calls use server-side routes only:

- **`/api/ai`** ([src/routes/api/ai/+server.ts](../../src/routes/api/ai/+server.ts)) — streaming completions for Ask/Write modes and proposal generation.
- **`/api/nova/agent`** ([src/routes/api/nova/agent/+server.ts](../../src/routes/api/nova/agent/+server.ts)) — non-streaming tool-capable completions for Agent mode. Returns `{ content, tool_calls, finish_reason }`.
- **`/api/ai-controller`** ([src/routes/api/ai-controller/+server.ts](../../src/routes/api/ai-controller/+server.ts)) — governed controller endpoint for controller-native workflows.

These routes:
1. Read the key from the OS keyring via [credential-service.ts](../../src/lib/ai/credential-service.ts).
2. Build the OpenRouter request.
3. Return the response to the client.

## Constraints (always)

- **Author-in-the-loop.** Agents never auto-apply edits. They emit suggestions; the user accepts.
- **Scoped context.** No agent receives the full manuscript. The smallest viable context wins.
- **Schema-validated output.** Every agent has a parser; non-conforming output is rejected.
- **No silent retries with bigger context.** If an agent fails, surface the failure rather than escalate context size.

## See also

- [agents-map.md](./agents-map.md) — shipped agents and the agents cut from internal V1.
- [context-engine.md](./context-engine.md) — scoping policies.
- [prompt-system.md](./prompt-system.md) — prompt construction details.
