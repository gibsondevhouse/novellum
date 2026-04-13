# Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: none

---

## GEMINI.md for Novellum Project

## Project Overview

Novellum is an AI-assisted novel production system designed to be integrated with the Gemini CLI. Its primary purpose is to empower users to leverage AI capabilities for novel writing and related tasks directly from their terminal. The project utilizes a structured system of agents, skills, and workflows, with a strong emphasis on documentation to ensure clarity, maintainability, and ease of use.

## Key Components and Structure

The project is organized to facilitate the development and management of AI agents and their functionalities.

- **`.github/`**: This directory houses critical configuration and definitions for the Gemini CLI and its agents.
  - `agents/`: Defines specialized AI agents responsible for distinct tasks. Key agents include:
        -   `ai.agent.md`: Manages AI models, prompts, context, and AI-specific tasks.
        -   `planner.agent.md`: Orchestrates development tasks, interprets requests, and generates detailed plans from `dev-docs/plans/`.
        -   `backend.agent.md`: (Assumed) Handles backend-related operations.
        -   `frontend.agent.md`: (Assumed) Handles frontend-related operations.
        -   `reviewer.agent.md`: (Assumed) Handles code or content review.
    - `skills/`: Contains reusable modules or capabilities that agents can leverage (e.g., `ai-context/`, `editor/`, `story-bible/`).
    - `instructions/`: Provides high-level guidance and conventions for agent development.
    - `prompts/`: Stores pre-defined prompts for various agent tasks.
    - `workflows/`: Defines sequences of agent interactions for complex operations (e.g., `feature-flow.md`).
- **`dev-docs/`**: Contains all project documentation and developer planning artifacts.
  - `plans/`: Holds strategic plans and execution templates for multi-tier development.
  - Core docs: `architecture.md`, `agents-map.md`, `ai-pipeline.md`, `context-engine.md`, `data-model.md`, `design-system.md`, `dev-workflow.md`, `feature-spec-template.md`, `project-overview.md`, `prompt-system.md`, `repo-structure.md`, `roadmap.md`, `modules/`.

## Development Conventions and Workflow

The project follows an agent-centric development model, where distinct AI agents are responsible for specific functionalities. These agents collaborate using defined skills and workflows. Key conventions include:

- **Modular Design:** Functionality is broken down into agents and skills for reusability and maintainability. Source code is organized by vertical domain slice (not technical layer) — each module owns its components, services, and stores. Import boundaries between modules are strictly enforced. Full rules: `dev-docs/modular-boundaries.md`.

- **Clear Documentation:** Extensive Markdown documentation is maintained in `dev-docs/` and `.github/` to explain architecture, usage, and development practices.

- **CLI Integration:** The project is designed to integrate with and extend the Gemini CLI, leveraging its capabilities for task execution and interaction.

- **Structured Workflows:** Complex tasks are managed through defined workflows that orchestrate agent interactions.

- **AI Focus:** The core purpose revolves around AI-assisted novel production, with specific agents and skills dedicated to AI model integration, prompt engineering, and data processing for AI.

## Building and Running

- **Package Manager**: pnpm ≥ 9
- **Dev server**: `pnpm run dev` → <http://localhost:5173>
- **Lint**: `pnpm run lint`
- **Format**: `pnpm run format`
- **Type check**: `pnpm run check`
- **Build**: `pnpm run build`

## Planning Standards

- Define the required plan hierarchy: Plan -> Stage -> Phase -> Part.
- Require YAML frontmatter in every plan artifact.
- Require measurable acceptance criteria per part.
- Require quality gates before closure: lint, typecheck, tests, docs sync.
- Require explicit evidence links: commits, PRs, test output, QA notes.

## Development Paths

- [x] Path 1: UI and interaction model evolution.
- [x] Path 2: Service-layer and state architecture hardening.
- [ ] Path 3: Domain feature deepening and workflow parity.
- [ ] Path 4: Local-first data, indexing, and retrieval capabilities.
- [ ] Path 5: Observability, reliability, and model-budget optimization.

## Vulnerabilities and Fragilities

- Identify known reliability, UX, performance, or compliance risks.
- For each risk include: risk, impact, detection signal, mitigation owner.
- Track temporary workarounds and target removal milestones.

## Plan Completion and Continuity Checklist

Use markdown checkboxes so agents can mark progress:

- [ ] All plan parts marked complete with evidence links.
- [ ] Required quality gates passed.
- [ ] Documentation mirror synchronized.
- [ ] Security and data-boundary checks passed.
- [ ] Manual QA scenarios executed and captured.
- [ ] MASTER-PLAN updated with completion status.
- [ ] Next candidate plan identified and queued.

Continuity rule:

- When all checklist items are checked, revise planning artifacts to keep delivery flowing:
  - Mark completed work as closed or archived.
  - Promote or generate the next highest-priority plan.
  - Update dependencies and target milestones.
