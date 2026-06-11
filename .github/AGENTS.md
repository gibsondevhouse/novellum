# Project Agents Configuration

This file lists and describes the agents involved in the Novellum project's development lifecycle. Each agent is configured via its respective `.agent.md` file in the `.github/agents/` directory.

## Agent Definitions

- **Planner Agent:** Orchestrates task breakdown and plan generation. (`.github/agents/planner.agent.md`)
- **Architect Agent:** Owns layout, structure, routing, shell contracts, and composition. (`.github/agents/architect.agent.md`)
- **Stylist Agent:** Owns styling, design tokens, accessibility, interaction states, and visual polish. (`.github/agents/stylist.agent.md`)
- **Backend Agent:** Manages server-side logic and APIs. (`.github/agents/backend.agent.md`)
- **AI Agent:** Integrates AI capabilities and manages AI interactions. (`.github/agents/ai.agent.md`)
- **Reviewer Agent:** Ensures code quality and production readiness. (`.github/agents/reviewer.agent.md`)

## Agent Interaction Model

Agents collaborate via:

- **Plans:** Detailed multi-tier plans in `dev-docs/plans/`.
- **Workflows:** Defined sequences of agent actions in `.github/workflows/`.
- **Skills:** Reusable functionalities in `.github/skills/`.
- **Prompts:** Templated instructions in `.github/prompts/`.
- **Shared Context:** `GEMINI.md` and `dev-docs` provide overarching project knowledge.

## Mandatory Bootstrap (All Agents)

Before planning or coding, every agent must load and follow this context chain:

1. Read [`AGENTS.md`](../AGENTS.md) and [`GEMINI.md`](../GEMINI.md).
2. If no explicit task is provided, execute active-plan discovery from [`AGENTS.md`](../AGENTS.md#0-resuming-work--active-plan-discovery).
3. Load instruction files in [instructions](./instructions/) that apply to the target files.
4. Load relevant skill docs from [skills](./skills/) based on domain.
5. Reuse templates from [prompts](./prompts/) and sequences from [workflows](./workflows/) when applicable.

Required instruction mapping:

- [instructions/svelte5-runes.md](./instructions/svelte5-runes.md) for Svelte reactivity/component work.
- [instructions/sqlite-best-practices.md](./instructions/sqlite-best-practices.md) for DB and `/api/db/*` work.
- [instructions/plan-conventions.instructions.md](./instructions/plan-conventions.instructions.md) for files in `dev-docs/plans/**`.

This keeps Gemini CLI, Claude Code, and Copilot behavior aligned.

## VS Code Integration

All agents are designed to leverage VS Code's native tools for efficient development, debugging, and quality assurance.
