---
part: part-001-define-per-mode-system-prompts
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: Agent Name`

---

### [2026-05-28 00:00] Agent: Planner Agent

Scaffolded this part as `draft` for plan-031 stage-002. No implementation work has started.

### [2026-05-28 20:30] Agent: Implementation Agent (Claude Sonnet 4.6)

Added `ask`, `write`, and `agent` task definitions to `src/lib/ai/task-resolver.ts`. Added `write` and `agent` constraints to `CONSTRAINTS_BY_TYPE` and task descriptions to `TASK_DESCRIPTIONS` in `src/lib/ai/constants.ts`. Added `write` and `agent` to `MODEL_MAP` and `TaskType`. Ask mode: same conversational role as legacy `chat`. Write mode: structured proposal role, `outline_scope` context policy, no-auto-apply constraint. Agent mode: feature-guarded description, honest about tool dispatch being unavailable.
