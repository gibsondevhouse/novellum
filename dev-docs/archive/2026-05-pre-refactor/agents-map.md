# Novellum — Agents Map

> Last updated: 2026-05-04

## Overview

Novellum uses a system of specialized AI agents instead of a single general-purpose model. Each agent is role-specific, context-scoped, task-bound, and output-constrained. Agents do not act autonomously — they are invoked in response to user actions, produce suggestions, and require author approval before anything is applied.

## Implementation Status

The `src/lib/ai/` directory houses the runtime agent roster. Not every agent listed in `AGENTS.md` is shipped yet; this map marks each agent's status.

- **Shipped (4):** `ContinuityAgent`, `EditAgent`, `RewriteAgent`, `StyleAgent`.
- **Planned (4):** `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, `SummaryAgent`. Task types exist in `src/lib/ai/types.ts` (`brainstorm`, `outline`, `draft`, `summarize`) but the dedicated parsing/agent modules have not yet been implemented.

Task types declared in [`src/lib/ai/types.ts`](../src/lib/ai/types.ts):

```ts
export type TaskType =
  | 'brainstorm'
  | 'outline'
  | 'draft'
  | 'continue'
  | 'rewrite'
  | 'continuity_check'
  | 'summarize'
  | 'edit'
  | 'style_check';
```

## Design Principles

- **Single responsibility** — each agent does one thing.
- **Predictable I/O** — structured input, structured output, strict constraints.
- **Composability** — agents chain together rather than growing into a single "do-everything" agent.
- **Author control** — agents suggest only; every output is reviewed before it touches the manuscript.

## Shipped Agents

### ContinuityAgent

- **Source:** [`src/lib/ai/continuity-agent.ts`](../src/lib/ai/continuity-agent.ts)
- **Task:** `continuity_check`
- **Context policy:** `continuity_scope` (scene + characters + lore + timeline + plot threads).
- **Inputs:** scene/chapter text, relevant characters, timeline events, lore rules, plot threads.
- **Output:** structured issue list (`type`, `severity`, `description`, `spanStart/End`). Persisted to `consistency_issues`.
- **Constraints:** no rewriting; no speculation beyond context; flag only verifiable issues.

### EditAgent

- **Source:** [`src/lib/ai/edit-agent.ts`](../src/lib/ai/edit-agent.ts)
- **Task:** `edit`
- **Context policy:** `scene_only` or `scene_plus_adjacent`.
- **Inputs:** text span + optional style rules + `EditMode` (`developmental` | `line_edit` | `proofread`).
- **Output:** `EditSuggestion[]` — span replacements with reason + mode.
- **Constraints:** preserve meaning; surface suggestions, never overwrite.

### RewriteAgent

- **Source:** [`src/lib/ai/rewrite-agent.ts`](../src/lib/ai/rewrite-agent.ts)
- **Task:** `rewrite`
- **Context policy:** `scene_only`.
- **Inputs:** original text + rewrite goal (tone, pacing, clarity).
- **Output:** three `RewriteOption` entries (`index: 1|2|3`, `text`).
- **Constraints:** preserve core meaning; introduce no new facts.

### StyleAgent

- **Source:** [`src/lib/ai/style-agent.ts`](../src/lib/ai/style-agent.ts)
- **Task:** `style_check`
- **Context policy:** `scene_only`.
- **Inputs:** text sample, target style preset (from `style-presets.ts`).
- **Output:** `StyleDeviation[]` — span-based deviation + suggestion + reason.
- **Constraints:** no plot changes; style-only commentary.

## Planned Agents

These appear in `AGENTS.md` and have task types declared; they do not yet have dedicated modules and parsers.

### BrainstormAgent (planned)

- **Purpose:** generate creative ideas (loglines, hooks, character concepts).
- **Outputs:** list of structured ideas.
- **Constraints:** breadth over depth; no full prose.

### OutlineAgent (planned)

- **Purpose:** generate or refine hierarchical outlines (acts, chapters, scene beats).
- **Constraints:** follow existing story structure; do not contradict known facts.

### DraftAgent (planned)

- **Purpose:** generate narrative prose for scenes or chapters.
- **Constraints:** respect character voice; remain within scene scope; no new facts.

### SummaryAgent (planned)

- **Purpose:** condense content into structured summaries (chapter recaps, key events).
- **Constraints:** faithful to source; no interpretation.

## Agentic Tools (scaffolded — not yet wired)

> Introduced by plan-023 stage-006. The Nova module ships a tool registry, dispatcher, and four stubbed tool slots. The model is permitted to *emit* tool calls only when the experimental flag `experimental.nova.agentic` is enabled (default off; reads `import.meta.env.PUBLIC_NOVELLUM_NOVA_AGENTIC`). Stubs return `not-yet-supported`; the chat loop does NOT yet thread tool calls back through `dispatchTool`.

Source files:

- [`src/modules/nova/services/tool-registry.ts`](../src/modules/nova/services/tool-registry.ts) — module-local `Map<id, { definition, handler }>`.
- [`src/modules/nova/services/tool-router.ts`](../src/modules/nova/services/tool-router.ts) — `dispatchTool(invocation)` looks up the registry; unregistered → `unimplemented`; handler throws → `error`.
- [`src/modules/nova/services/stub-tools.ts`](../src/modules/nova/services/stub-tools.ts) — registers the four slots below at module load.
- [`src/modules/nova/services/feature-flags.ts`](../src/modules/nova/services/feature-flags.ts) — `isNovaAgenticEnabled()`, `setNovaAgenticFlag()`.

### Stub roster

| Tool id | Description | Input schema (summary) | Planned |
| :--- | :--- | :--- | :--- |
| `worldbuilding.create-character` | Create a character entry in the project world bible. | `{ name: string; role?: string; summary?: string }` | plan-XXX |
| `worldbuilding.update-location` | Patch fields on an existing location. | `{ locationId: string; patch: object }` | plan-XXX |
| `continuity.scan-scene` | Run a continuity check on the named scene. | `{ sceneId: string }` | plan-XXX |
| `outline.suggest-beat` | Suggest a new beat under the named chapter. | `{ chapterId: string; afterBeatId?: string }` | plan-XXX |

Each stub handler returns `{ status: 'not-yet-supported', output: null, error: 'Tool <id> is registered but not yet wired (planned for plan-XXX).' }`.

### Status semantics

`ToolStatus` (extended in stage-006) distinguishes:

- `not-yet-supported` — tool **is** registered; the handler intentionally declines to act.
- `unimplemented` — tool id is **not** registered with the router.
- `pending` / `success` / `error` — usual lifecycle.

## Agent Trigger Map

- "Brainstorm ideas" → BrainstormAgent (planned).
- "Create outline" → OutlineAgent (planned).
- "Draft scene" / "Continue writing" → DraftAgent (planned).
- "Check continuity" → ContinuityAgent.
- "Improve writing" → EditAgent.
- "Adjust tone/style" → StyleAgent.
- "Summarize chapter" → SummaryAgent (planned).
- "Rewrite passage" → RewriteAgent.

## Agent Chaining Examples

### Fix a scene

1. ContinuityAgent identifies issues.
2. RewriteAgent generates a corrected draft from the text + issues.
3. EditAgent polishes the prose.

### Polish a draft

1. EditAgent — line edits.
2. StyleAgent — tone/voice consistency.
3. SummaryAgent (when shipped) — recap generation.

## Pipeline Integration

All agents share a common pipeline:

```text
User Action → task-resolver.ts → context-engine.ts → prompt-builder.ts → model-router.ts → openrouter.ts → agent parser → UI
```

See [`ai-pipeline.md`](ai-pipeline.md) and [`prompt-system.md`](prompt-system.md) for pipeline and prompt contract details.

## Agent Configuration Shape

```ts
interface AgentConfig {
  name: string;
  role: string;
  contextPolicy: ContextPolicy;
  outputFormat: string;
  modelPreference: string;
}
```

Model selection is abstracted through `model-router.ts`, so models can be swapped without changing agent logic.
