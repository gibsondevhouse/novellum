# Project Agents Configuration

This file lists and describes the agents involved in the Novellum project's development lifecycle. Each agent is configured via its respective `.agent.md` file in the `.github/agents/` directory.

## Agent Definitions

- **Planner Agent:** Orchestrates task breakdown and plan generation. (`.github/agents/planner.agent.md`)
- **Frontend Agent:** Handles UI and client-side development. (`.github/agents/frontend.agent.md`)
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

## VS Code Integration

All agents are designed to leverage VS Code's native tools for efficient development, debugging, and quality assurance.
