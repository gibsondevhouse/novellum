# Novellum Agent Ecosystem

> Last verified: 2026-05-13

Novellum is built around a dual-layer agent architecture. Rather than relying on a single general-purpose AI, the system delegates tasks to specialized, focused agents.

This document serves as the master reference for both the **Meta-Agents** (used during development) and the **Runtime Agents** (used within the application).

---

## 0. Resuming Work — Active Plan Discovery

Any agent (Codex CLI, Claude Code, Gemini CLI, GitHub Copilot Chat) starting a session **without an explicit task** must:

1. Read [`dev-docs/plans/ACTIVE-PLAN.md`](./dev-docs/plans/ACTIVE-PLAN.md) — its `## Current` section names the plan slug being worked on.
2. Open that plan's `plan.md`, find the first stage / phase / part whose `status` is not `complete`, and continue from there.
3. Follow the rules in [`.github/instructions/plan-conventions.instructions.md`](./.github/instructions/plan-conventions.instructions.md): pre-impl checklist → implementation → post-impl checklist → append-only `impl.log.md` → at least one file in `evidence/`.
4. Roll status upward only when all children are complete.
5. When a plan reaches `complete`, update both `ACTIVE-PLAN.md` (move it to `Recently completed`, advance the `Current` pointer) **and** `dev-docs/plans/MASTER-PLAN.md`.

The full prompt lives at [`.github/prompts/continue-plan.prompt.md`](./.github/prompts/continue-plan.prompt.md). It is the canonical entry point for "continue whatever plan is active" across every supported assistant.

---

## 1. System Meta-Agents (Development Layer)

Located in `.github/agents/`, these agents are designed to be invoked via the Gemini CLI to orchestrate the development, planning, and coding of the Novellum project itself.

### The Meta-Agent Roster

| Agent Name | Role | Core Responsibility |
| :--- | :--- | :--- |
| **Planner** | `planner.agent.md` | Orchestrates multi-tier development plans (Plan -> Stage -> Phase -> Part), interprets user requests, and manages the `dev-docs/plans/` directory. |
| **Reviewer** | `reviewer.agent.md` | Ensures code quality, enforces the strict vertical domain modular boundaries (`eslint-plugin-boundaries`), and validates PRs/commits. |
| **Architect** | `architect.agent.md` | Senior layout architect and structural systems lead. Owns route shells, layout composition, shell contracts, structural primitives, SvelteKit routing, and state management. |
| **Stylist** | `stylist.agent.md` | Senior UI stylist, design system steward, and component quality lead. Owns design tokens, accessibility, interaction states, dark theme, motion, and visual polish. |
| **Backend** | `backend.agent.md` | Server-side logic owner. Manages the SQLite database via `/api/db/*`, API routes, and data persistence layers. |
| **AI** | `ai.agent.md` | Manages the internal Prompt System, Context Engine logic, and OpenRouter integration. |

**Developer Workflow:** Use the `planner` to break down a feature request, then delegate specific implementation tasks to the `architect` (layout/structure), `stylist` (styling/components), `backend`, or `ai` agents, finally using the `reviewer` to ensure the work meets project standards.

---

## 2. Runtime Agents (Product Layer)

Located in `src/lib/ai/`, these agents power the features that authors interact with in the Novellum UI. They are role-specific, context-scoped, and output-constrained.

### The Functional Roster

Status legend: **Shipped** = available in the app today. **Planned** = scoped, not yet implemented.

| Agent | Status | Purpose | Triggers & Use Cases | Output |
| :--- | :--- | :--- | :--- | :--- |
| **ContinuityAgent** | Shipped | Detects inconsistencies in the story. | Running checks against timeline, lore, and character traits. | Structured issue/warning list. |
| **EditAgent** | Shipped | Improves clarity, flow, and prose quality. | Sentence refinement, developmental editing. | Line edit suggestions. |
| **RewriteAgent** | Shipped | Provides alternative versions of existing text. | Adjusting pacing, shifting tone. | Multiple text options. |
| **StyleAgent** | Shipped | Ensures stylistic consistency. | Tone alignment, voice consistency checks. | Rewrite suggestions based on tone. |

> **Cut from V1 (2026-05-13, plan-025):** `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, and `SummaryAgent` were previously listed as Planned. They were never wired to a parser and have been removed from the V1 task-resolver surface. Re-introducing any of them is a new feature plan, not a follow-up.

Shipped agents live under `src/lib/ai/<agent>-agent.ts`. See [dev-docs/03-ai/agents-map.md](./dev-docs/03-ai/agents-map.md) for the canonical breakdown.

---

## 3. The AI Pipeline Architecture

All Runtime Agents operate through a standardized pipeline to ensure predictable, structured, and hallucination-free outputs.

```text
User Action -> Context Engine -> Prompt Builder -> Model Router -> OpenRouter
```

### Prompt Engineering Standards
Every prompt generated by the `PromptBuilder` must strictly adhere to this format:

1.  **ROLE**: Defines the agent's identity (e.g., "You are the Novellum ContinuityAgent").
2.  **TASK**: A clear, single-responsibility objective.
3.  **CONTEXT**: Highly scoped, serialized JSON data (e.g., *only* the current scene and active characters).
4.  **CONSTRAINTS**: Explicit negative bounds (e.g., "Do not invent facts outside the provided context").
5.  **OUTPUT FORMAT**: A strict schema definition (usually JSON) that the parser expects.

---

## 4. Developer Guide: Extending the Ecosystem

### Creating a New Runtime Agent

1.  **Define the Role**: Update `dev-docs/agents-map.md` with the new agent's purpose, inputs, outputs, and constraints.
2.  **Add Types**: Add the new task type and output interfaces to `src/lib/ai/types.ts`.
3.  **Implement the Agent**: Create a new file (e.g., `src/lib/ai/dialogue-agent.ts`). It should primarily consist of parsing logic for the expected output schema.
4.  **Update Resolvers**: Wire the new agent into `task-resolver.ts` and ensure the `PromptBuilder` knows how to construct its specific prompt format.
5.  **Write Tests**: Every agent MUST have a corresponding Vitest suite (e.g., `tests/ai/dialogue-agent.test.ts`) that tests its parsing logic and context handling.

### Agent Interoperability (Chaining)

Agents are designed to be composable. When designing complex features, chain them together rather than creating a "do-everything" agent.

*Example: "Fix a Scene" Workflow*
1.  **ContinuityAgent** analyzes the scene and outputs a list of conflicts.
2.  **RewriteAgent** takes the scene text AND the conflicts list as context, outputting a corrected draft.
3.  **EditAgent** performs a final stylistic polish on the output.

### Guardrails & Safety
-   **No Silent Edits**: Agents must never auto-apply changes to the user's manuscript. They generate *suggestions* or *drafts* that the user must explicitly accept.
-   **Context Discipline**: Do not send the entire manuscript to an agent. Use the `ContextEngine` to dynamically build the minimum required context (e.g., `scene_plus_adjacent` policy).
