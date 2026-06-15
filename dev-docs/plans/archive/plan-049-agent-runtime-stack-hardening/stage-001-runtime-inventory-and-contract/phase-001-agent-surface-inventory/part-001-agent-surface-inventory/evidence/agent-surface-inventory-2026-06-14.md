# Agent Surface Inventory - 2026-06-14

Plan: `plan-049-agent-runtime-stack-hardening`  
Stage: `stage-001-runtime-inventory-and-contract`  
Phase: `phase-001-agent-surface-inventory`  
Part: `part-001-agent-surface-inventory`

## Method

Source sweep covered `src/lib/ai`, `src/lib/server`, `src/modules/nova`, `src/modules/outline`, `src/modules/world-building`, `src/modules/continuity`, and `src/routes/api`.

Primary searches:

- `rg --files src/lib/ai src/lib/server src/modules/nova src/modules/outline src/modules/world-building src/routes/api tests | rg '(ai|nova|agent|checkpoint|proposal|outline|worldbuilding|continuity|provider|model-router|openrouter|ollama|metadata|export|diagnostic)'`
- `rg -n "checkpoint|proposal|authorDraft|outlineDraft|worldbuild|worldbuilding|agent|tool|OpenRouter|Ollama|modelRouter|continuity|metadata|trace|token|cost|AbortSignal|retry|cancel|stream" src/lib/ai src/lib/server src/modules/nova src/modules/outline src/modules/world-building src/routes/api`
- `rg -n "executeContinuityCheck|runAuthorPipelineTask|runWorldbuildPipelineTask|generateWorldbuildingEntities|outlineGenerationState.generate|generateSceneDraftCheckpoint|acceptSceneDraftCheckpoint|rejectSceneDraftCheckpoint" src tests`

## Classification Legend

- `read_only`: Reads project/runtime data without producing a mutation artifact.
- `generation_only`: Calls a model and returns text or drafts without persisting canon/manuscript changes.
- `review_artifact_generation`: Produces a checkpoint, proposal, or reviewable artifact that requires explicit user action.
- `review_gated_mutation`: Applies or rejects a previously generated artifact after explicit user action.
- `direct_mutation`: Writes app state directly without a model-created review artifact.
- `diagnostics`: Reports health, credentials, provider availability, or model metadata.

## Runtime Surfaces

| Surface | Entrypoints | Callers | Class | Persistence today | Cancellation / retry / status today | Gaps for durable runtime |
| --- | --- | --- | --- | --- | --- | --- |
| Nova Ask/Write chat stream | `src/modules/nova/services/chat-service.ts`, `src/lib/ai/openrouter.ts`, `src/routes/api/ai/+server.ts` | `NovaPanel` / composer | `generation_only` | `novaSession.messages` in browser memory only | Per-message `AbortController`; failed turn can be removed for retry; statuses are `streaming`, `complete`, `error`, `aborted` | No durable run id, step ledger, prompt snapshot, streamed usage, cost, provider metadata, or replayable trace |
| Nova Agent loop | `src/modules/nova/services/agent-loop.ts`, `src/routes/api/nova/agent/+server.ts` | Agent mode in Nova | `read_only` plus `review_artifact_generation` | Browser memory message/tool chips only | Hard cap `MAX_AGENT_STEPS = 8`; active request can abort; no persisted retry | No run/step/tool-call rows, no resumable loop state, no durable tool inputs/outputs, no token/cost accounting, OpenRouter-specific route bypasses provider abstraction |
| Nova model-callable read tools | `src/modules/nova/services/agent-tools.ts`, `src/modules/nova/services/tool-registry.ts`, `src/modules/nova/services/tool-router.ts` | `runAgentLoop()` through `listModelCallableTools()` | `read_only` | None; results only appended to session as tool-result chips | Tool handler errors become in-memory `ToolResult`; no per-tool cancellation | Need `agent_tool_calls` rows with input/output redaction, status, elapsed time, and source route metadata |
| Nova proposal-only tools | `propose.outline`, `propose.scene_draft` in `src/modules/nova/services/agent-tools.ts` | Model-callable Agent tools | `review_artifact_generation` but not durable | Returns in-memory `ProposalEnvelope`; not stored as checkpoint/proposal | Tool-level errors only | Either route to canonical checkpoint/proposal services or mark as transient draft artifacts in `agent_artifacts` |
| Nova author-draft generation tools | `authorDraft.get_scene_draft_context`, `authorDraft.generate_scene_draft_checkpoint`, `authorDraft.list_checkpoints` in `src/modules/nova/services/agent-tools.ts`; `src/modules/nova/services/author-draft-api.ts` | Agent mode and author draft UI | `read_only` / `review_artifact_generation` | Scene draft checkpoints in `project_metadata` scope `pipeline`, owner `AUTHOR_DRAFT_CHECKPOINT_OWNER_ID` | HTTP request signal accepted by client helper; server route has timeout signal; active review checkpoint may be reused | Needs durable parent run/job row linked to produced checkpoint id and failure checkpoint if generation fails |
| Nova mutation commands | `src/modules/nova/services/agent-mutation-tools.ts`, `dispatchTool(..., { allowMutationCommands })` | Trusted UI/app commands only | `review_gated_mutation` / `direct mutation command` | Accept writes scene content and updates author draft checkpoint; reject updates checkpoint | Not model-callable by default; route errors map to UI | Runtime contract must keep `mutation_command` excluded from model-callable tools and record user-originated decision events separately from model steps |
| Generic AI proxy, proxy shape | `src/routes/api/ai/+server.ts`, `src/lib/ai/providers/*`, `src/lib/ai/openrouter.ts` | Nova chat, proposal tools, legacy callers | `generation_only` / provider transport | None; non-streaming proxy returns `tokensUsed`; streaming does not persist usage | Request signal passed to provider; max output token clamp | No provider-agnostic run trace, no model capability lookup, no cost ledger, no prompt/context byte counts |
| Generic AI task mode | `src/routes/api/ai/+server.ts`, `src/lib/ai/task-resolver.ts`, `src/lib/ai/context-engine.ts`, `src/lib/ai/prompt-builder.ts` | Worldbuild pipeline runner, continuity executor, legacy task callers | `generation_only` | None at route level; callers may persist parsed results | Request signal passed; no route-level retry | No durable task run record, no prompt/context hash, no usage returned to caller, no schema/family artifact link |
| Provider catalogue and selection | `src/routes/api/ai/models/+server.ts`, `src/lib/ai/model-router.ts`, `src/lib/ai/providers/types.ts`, `src/routes/api/settings/ai-ollama/+server.ts` | Settings/model picker, provider loading | `diagnostics` | In-memory models cache for OpenRouter; selected provider/model in `app_preferences`; OpenRouter key in secure credential store | Models cache TTL is 60 seconds; no persistent capability metadata | Need local model capability registry with context length, JSON schema/tool support, streaming support, pricing, and confidence/source timestamp |
| Worldbuild staged pipeline run | `src/modules/outline/services/worldbuild-pipeline-runner.ts`, `/api/ai` task mode, `upsertWorldbuildCheckpoint()` | Outline page stage run button | `review_artifact_generation` | Draft checkpoint in `project_metadata` via `WORLDBUILD_CHECKPOINT_OWNER_ID` | Module-local `activeRunKey` prevents duplicate run in the current browser session; no abort signal; retry is reset/re-run only | Needs durable job/run lock, cancellable request, retry policy, and link from run to checkpoint id |
| Worldbuild checkpoint review | `src/modules/world-building/stores/world-building-store.svelte.ts`, generic project metadata route, `src/lib/ai/pipeline/checkpoint-service.ts` | Outline/worldbuilding review UI | `review_gated_mutation` | Checkpoint lifecycle and audit in `project_metadata`; accept can project populated bible rows into canon tables | Transactional accept/reject; no durable user decision event outside checkpoint record | Need `agent_artifacts` or decision event rows linked to checkpoint lifecycle, author id/source, and projection counts |
| Worldbuilding entity generation | `src/modules/world-building/stores/generation-draft.svelte.ts`, `src/modules/world-building/services/worldbuilding-generation-service.ts`, `src/routes/api/worldbuilding/generate/+server.ts` | Worldbuilding pre-generation dialog/modal | `generation_only` | Drafts live in browser store until the user saves selected drafts through normal DB/entity flows | Client abort controller; route uses `request.signal`; status in store is `idle/generating/reviewing/error` | No persisted run, no draft artifact id, no trace or retry after page unload, no cost/usage capture |
| Worldbuilding scan proposal generation | `src/routes/api/worldbuilding/scan/+server.ts`, `src/modules/world-building/stores/worldbuild-suggestion-state.svelte.ts` | Worldbuilding scan actions and proposal tile | `review_artifact_generation` | Proposals persisted in `project_metadata`, owner `WORLDBUILD_PROPOSAL_OWNER_ID`; state rehydrates from metadata | Provider request uses `request.signal`; no explicit cancelled/failed run record | Need durable run/job row linked to proposal ids, dedupe decisions, validation failures, and provider response metadata |
| Worldbuilding proposal accept/reject | `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts`, `reject/+server.ts`, `acceptProposalAtomically()`, `rejectProposalAtomically()` | Proposal cards/services and E2E route tests | `review_gated_mutation` | Atomic proposal status, audit metadata, and canon projection in SQLite/project metadata | Transactional; projectId required when proposal exists; legacy checkpoint fallback remains | Need user decision event, rollback/error trace, and explicit links from proposal to target canon rows |
| Outline generation | `src/modules/nova/services/outline-generation-runner.ts`, `outline-generation-state.svelte.ts`, `src/routes/api/ai/outline/generate/+server.ts` | Nova Write mode and outline generation panel | `review_artifact_generation` | Review checkpoint in `project_metadata`, owner `OUTLINE_CHECKPOINT_OWNER_ID`; route stores draft then review state | Client runner can cancel; route combines request signal with 90 second timeout; runner supports retry from last input | Needs durable run/job row, attempt records for repair prompt, provider usage/cost, context hash as first-class link |
| Outline checkpoint review/reject | `src/modules/nova/services/outline-checkpoint-actions.ts`, generic project metadata route, `src/lib/ai/pipeline/outline-checkpoint-service.ts` | Outline generation review card/panel | `review_gated_mutation` | Checkpoint lifecycle and review/rejection metadata in `project_metadata` | Fetch signal accepted; transactional lifecycle transitions | Needs durable decision event linked to checkpoint and UI origin |
| Outline checkpoint accept/materialization | `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`, `src/lib/server/outline/outline-materialization-service.ts` | Outline checkpoint review UI | `review_gated_mutation` | Atomic hierarchy rows, scene intent metadata, and accepted checkpoint in SQLite | Requires `expectedUpdatedAt` and `expectedVersion`; rejects stale/conflicting hierarchy; rollback on materialization failure | Needs run artifact link to materialized row ids and materialization trace; no job retry semantics yet |
| Retired outline direct apply | `src/routes/api/nova/outline/apply/+server.ts` | Compatibility route only | `diagnostics` / retired mutation path | None; returns `410 outline_apply_retired` | Not applicable | Keep as explicit unsupported runtime surface until all clients prove deletion-safe |
| Author scene draft generation route | `src/routes/api/author-draft/checkpoints/generate/+server.ts`, `src/lib/ai/pipeline/author-draft-checkpoint-service.ts` | Nova author draft engine and Agent tool | `review_artifact_generation` | Author draft checkpoint in `project_metadata`; generation failure can persist a rejected failure checkpoint when no active review checkpoint exists | Existing active checkpoint reused unless `forceRegenerate`; route has 60 second timeout; two parse attempts | Need durable parent job, attempt-level parse failure records, cancellation state, and usage/cost capture |
| Author scene draft accept/reject | `src/routes/api/author-draft/checkpoints/[checkpointId]/accept/+server.ts`, `reject/+server.ts`, `NovaAuthorDraftCheckpointCard.svelte` | Author draft review card | `review_gated_mutation` | Accept writes `scenes.content` and checkpoint audit; reject writes checkpoint reason | Accept checks scene timestamp/hash stale guard; `forceOverwrite` is explicit | Need decision event row, scene mutation audit link, and replay-safe stale guard metadata |
| Author chapter draft runner | `src/modules/nova/components/NovaAuthorDraftEngine.svelte`, `author-draft-api.ts` | Draft chapter button | `review_artifact_generation` batch | Multiple author draft checkpoints in `project_metadata` | Component-local `AbortController`; skips existing review checkpoints unless regenerating; progress state in component only | Needs `agent_jobs` batch orchestration, per-scene child jobs, resumable progress, and partial completion recovery |
| Continuity check | `src/modules/continuity/services/run-check-service.ts`, `src/lib/ai/continuity-agent.ts`, `/api/db/consistency_issues` | Continuity panel | `generation_only` then `direct_mutation` of issue rows | Created issues in `consistency_issues` table | No explicit abort/retry beyond request lifecycle; parser returns empty list on malformed JSON | Needs run record linked to created issue ids, parse failure trace, and duplicate/suppression policy |
| Edit/Rewrite/Style agents | `src/lib/ai/edit-agent.ts`, `rewrite-agent.ts`, `style-agent.ts`, task resolver entries | Tests and future callers; no runtime service caller found in source sweep | Parser contracts only / `generation_only` if called through generic `/api/ai` | None | No current durable runtime owner | Later contract should reserve agent family/artifact types but not add tables around uncalled surfaces yet |
| Settings and provider diagnostics | `src/routes/api/settings/ai-key/+server.ts`, `ai-status/+server.ts`, `ai-ollama/+server.ts`, credential service | Settings UI | `diagnostics` / `direct_mutation` for preferences and credential metadata | Provider status in secure credential metadata; Ollama config and active provider in `app_preferences` | Key validation has provider signal support in provider layer but routes do not pass request signal everywhere | Diagnostics export must redact keys, credential paths, raw prompts, manuscript text, and provider errors |

## Cross-Cutting Persistence Map

- `project_metadata` is the current durable review-artifact store for worldbuild checkpoints, outline draft checkpoints, author draft checkpoints, and worldbuilding scan proposals.
- `consistency_issues` is the current durable store for continuity check outputs.
- `app_preferences` stores selected provider/model preferences and Ollama configuration.
- `novaSession`, `outlineGenerationState`, worldbuilding generation draft state, `activeRunKey`, and author chapter draft progress are browser/component memory only.
- Provider usage is available in `CompletionResponse.usage`, but only some proxy paths expose `tokensUsed`; no path persists usage or cost.

## Durable Runtime Requirements Found

1. Add `agent_runs` as the stable parent for Nova chat, Agent loops, outline generation, author draft generation, worldbuilding staged pipeline, worldbuilding scan, worldbuilding entity generation, and continuity checks.
2. Add `agent_run_steps` for model calls, context build, parse/validation, checkpoint/proposal persistence, and user-visible transitions.
3. Add `agent_tool_calls` for model-requested tools and trusted app mutation commands, with capability, caller source, redacted input/output, and status.
4. Add `agent_jobs` for long-running or batch work: outline generation, chapter draft generation, worldbuild staged runs, and worldbuilding scans.
5. Add `agent_artifacts` or link rows from runs to existing checkpoint/proposal/issue ids instead of copying domain payloads.
6. Track `estimated_usage` separately from provider-reported usage. Persist model id, provider id, max token cap, response format/tool support, and usage confidence.
7. Treat `waiting_for_review` as a successful generation terminal state for jobs, distinct from `completed` after an author decision.
8. Preserve mutation boundaries: model-callable tools can create review artifacts or read state; only trusted UI/app actions can accept/reject/apply.
9. Record cancellation and failure even when no checkpoint/proposal is produced.
10. Redact credentials, raw manuscript text, large prompt context, and provider errors before diagnostics export.

## Proposed Ownership For Later Plan Stages

- Stage 002 Durable Run Ledger: `agent_runs`, `agent_run_steps`, artifact links, usage/cost fields.
- Stage 003 Local Job Execution: queued execution, locks, retries, cancellation, resumable chapter-scene batches.
- Stage 004 Model, Budget & Memory Capabilities: model capability registry, token/cost budgets, SQLite FTS memory.
- Stage 005 Observability, Evals & Diagnostics: traces, eval fixtures, support bundle export, redaction policy.

## Open Decisions

- Whether transient `propose.outline` and `propose.scene_draft` Agent tools should be retired in favor of canonical checkpoint routes, or represented as non-persistent `agent_artifacts`.
- Whether `/api/nova/agent` should be folded behind the provider abstraction before or during the tool-call ledger implementation.
- Whether generation failure checkpoints from author draft should become a generic failed-artifact policy across outline and worldbuilding.
