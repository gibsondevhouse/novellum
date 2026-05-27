# Agents Map

> Last verified: 2026-05-26 (plan-028 UI shipped)

Authoritative status of all Novellum runtime agents. Anchored to [src/lib/ai/](../../src/lib/ai/).
The V1.1 staged pipeline (`vibe-worldbuild` / `vibe-author`) is
documented separately below — those are pipeline *stages*, not runtime
agents.

## Shipped (4)

| Agent | TaskType | File | Output |
| --- | --- | --- | --- |
| **ContinuityAgent** | `continuity_check` | [continuity-agent.ts](../../src/lib/ai/continuity-agent.ts) | `ContinuityIssue[]` — structured issues for triage in the Continuity surface. |
| **EditAgent** | `edit` | [edit-agent.ts](../../src/lib/ai/edit-agent.ts) | `EditSuggestion[]` — line-level edits with rationale. |
| **RewriteAgent** | `rewrite` | [rewrite-agent.ts](../../src/lib/ai/rewrite-agent.ts) | `RewriteOption[]` — alternative versions of a passage. |
| **StyleAgent** | `style_check` | [style-agent.ts](../../src/lib/ai/style-agent.ts) | `StyleDeviation[]` — tone/voice consistency findings. |

## Cut from V1 (2026-05-13)

`BrainstormAgent`, `OutlineAgent`, `DraftAgent`, and `SummaryAgent` were
declared as planned TaskTypes but never shipped a parser. They were
removed from [types.ts](../../src/lib/ai/types.ts) and
[task-resolver.ts](../../src/lib/ai/task-resolver.ts) under plan-025 so
the V1 surface only advertises what actually works. The Nova chat
service falls back to `continue` for legacy callers. Re-introducing any
of these agents post-V1 means going through the "How to add a new
agent" checklist below.

## How to add a new agent

1. **Define the role and output schema.** Update [types.ts](../../src/lib/ai/types.ts) with the `TaskType` and output interfaces.
2. **Create the agent module.** New file at `src/lib/ai/<name>-agent.ts` with a parser that validates and shapes the LLM response.
3. **Register the prompt template.** Add ROLE/TASK/CONSTRAINTS/OUTPUT_FORMAT entries to [constants.ts](../../src/lib/ai/constants.ts) and wire them in [prompt-builder.ts](../../src/lib/ai/prompt-builder.ts).
4. **Wire the resolver.** Map the TaskType to the agent in [task-resolver.ts](../../src/lib/ai/task-resolver.ts).
5. **Add tests.** A parser test under [tests/ai/](../../tests/ai/) covering happy path and at least one malformed response.
6. **Update docs.** Promote the entry to "Shipped" in this file with the same date you ship.

## Pipeline stages (V1.1)

Distinct from the runtime agents above. Pipeline stages are stateful,
gated by reviewer checkpoints, and persist artifacts in
`project_metadata` (scope `'pipeline'`). Schema version: **`1.0.0`**.

### `vibe-worldbuild` family (shipped — plan-027 stage-002, UI — plan-028)

| Stage key | Output format | Canon projection |
| --- | --- | --- |
| `vibe-worldbuild.premise` | `json_worldbuild_premise` | None — artifact only. |
| `vibe-worldbuild.worldspec` | `json_worldbuild_worldspec` | None — artifact only. |
| `vibe-worldbuild.research` | `json_worldbuild_research_briefs` | None — deferred to `lore_entries` per ADR-0027. |
| `vibe-worldbuild.populated-world-bible` | `json_worldbuild_populated_bible` | Atomic insert into `characters`, `factions`, `locations`, `themes`, `glossary_terms`, `lore_entries`, `plot_threads`, `timeline_events`. |

Checkpoint lifecycle: `draft → review → accepted | rejected`. Rejected
checkpoints preserve their `reason`; re-upserting the same id resets
the record to `draft`. See [pipeline.md](./pipeline.md) for HTTP surface
and contract details.

**Outline UI (plan-028):** The worldbuild run/review/decision workflow
is surfaced at `/projects/[id]/outline` via a seven-layer hierarchy
navigator and stage detail panel. The run adapter is
[`worldbuild-pipeline-runner.ts`](../../src/modules/outline/services/worldbuild-pipeline-runner.ts);
runtime state is managed in
[`outline-store.svelte.ts`](../../src/modules/outline/stores/outline-store.svelte.ts).
The checkpoint review console includes queue filters, artifact review
detail, and explicit accept/reject controls. `vibe-author` UI parity
is deferred.

### `vibe-author` family (shipped — plan-027 stage-003)

| Stage key | Output format | Canon projection |
| --- | --- | --- |
| `vibe-author.premise` | `json_author_premise` | None — artifact only. |
| `vibe-author.outline` | `json_author_outline` | None — artifact only. |
| `vibe-author.scene-draft` | `json_author_scene_draft` | None — surfaced via [`NovaSceneDraftCard`](../../src/modules/nova/components/NovaSceneDraftCard.svelte). Accept emits the envelope; the manuscript is never auto-mutated. |
| `vibe-author.revision-pack` | `json_author_revision_pack` | None — surfaced via [`NovaRevisionPackCard`](../../src/modules/nova/components/NovaRevisionPackCard.svelte) with per-issue Acknowledge. |

Delivery surface:

- Runner: [`runAuthorPipelineTask`](../../src/modules/nova/services/author-pipeline-runner.ts) — resolves the task, builds RAG context, calls OpenRouter, parses the response, attaches a `NovaArtifact` to the originating Nova message.
- Cards: [`NovaSceneDraftCard`](../../src/modules/nova/components/NovaSceneDraftCard.svelte) and [`NovaRevisionPackCard`](../../src/modules/nova/components/NovaRevisionPackCard.svelte) render parsed envelopes with explicit user-driven controls only.
- Review gates: persisted via the shared `/api/db/project-metadata/{projectId}/pipeline/vibe-author/{key}/{id}` lifecycle (`upsert | review | accept | reject`). End-to-end coverage lives in [`tests/e2e/vibe-author-review-gates.spec.ts`](../../tests/e2e/vibe-author-review-gates.spec.ts).

Author-in-the-loop guarantee: every accept path emits a typed callback;
no card component imports the editor store or calls `insertText` /
`applyEdit`. The contract is enforced by source-string tests under
[`tests/ai/pipeline/`](../../tests/ai/pipeline/).

## Cross-references

- AGENTS.md at the repo root reflects the same status. Keep both in sync.
- [pipeline.md](./pipeline.md) — how agents are invoked.
- [prompt-system.md](./prompt-system.md) — prompt construction.
- [context-engine.md](./context-engine.md) — what context each agent receives.
