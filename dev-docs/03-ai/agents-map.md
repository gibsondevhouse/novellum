# Agents Map

> Last verified: 2026-05-13

Authoritative status of all Novellum runtime agents. Anchored to [src/lib/ai/](../../src/lib/ai/).

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

## Cross-references

- AGENTS.md at the repo root reflects the same status. Keep both in sync.
- [pipeline.md](./pipeline.md) — how agents are invoked.
- [prompt-system.md](./prompt-system.md) — prompt construction.
- [context-engine.md](./context-engine.md) — what context each agent receives.
