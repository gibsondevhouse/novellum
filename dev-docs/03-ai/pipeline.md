# AI Pipeline

> Last verified: 2026-05-07

Every AI feature in Novellum follows the same pipeline. The pipeline lives in [src/lib/ai/](../../src/lib/ai/) and is consumed by feature modules through orchestrator factories.

## Pipeline diagram

```text
User action
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

## Server boundary

The browser never holds the OpenRouter API key. All model calls go through `/api/ai` ([src/routes/api/ai/+server.ts](../../src/routes/api/ai/+server.ts)), which:

1. Reads the key from the OS keyring via [credential-service.ts](../../src/lib/ai/credential-service.ts).
2. Builds the OpenRouter request.
3. Streams the response back to the client.

## Constraints (always)

- **Author-in-the-loop.** Agents never auto-apply edits. They emit suggestions; the user accepts.
- **Scoped context.** No agent receives the full manuscript. The smallest viable context wins.
- **Schema-validated output.** Every agent has a parser; non-conforming output is rejected.
- **No silent retries with bigger context.** If an agent fails, surface the failure rather than escalate context size.

## See also

- [agents-map.md](./agents-map.md) — shipped vs planned agents.
- [context-engine.md](./context-engine.md) — scoping policies.
- [prompt-system.md](./prompt-system.md) — prompt construction details.
