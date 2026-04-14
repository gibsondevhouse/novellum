# Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: none

---

## GEMINI.md for Novellum Project

## Project Overview

Novellum is an AI-assisted novel production system designed to be integrated with the Gemini CLI. Its primary purpose is to empower users to leverage AI capabilities for novel writing and related tasks directly from their terminal and a modern web interface. The project utilizes a structured system of agents, skills, and workflows, with a strong emphasis on documentation and modular architecture.

## Key Components and Structure

The project is organized into two distinct layers: the **Meta-Agent Layer** (for development) and the **Product Agent Layer** (for user features).

### 1. Meta-Agent Layer (`.github/`)
This directory houses critical configuration and definitions for the Gemini CLI and its development agents.
- **`agents/`**: Defines specialized AI agents for development tasks.
  - `planner.agent.md`: Orchestrates development tasks and generates multi-tier plans.
  - `backend.agent.md`: Manages server-side logic, SQLite, and services.
  - `frontend.agent.md`: Senior UI architect for SvelteKit and component systems.
  - `reviewer.agent.md`: Ensures code quality and modular boundary compliance.
  - `ai.agent.md`: Manages AI models, prompts, and context logic.
- **`skills/`**: Reusable modules or capabilities for dev-agents (e.g., `ai-context/`, `svelte5-runes/`, `modular-boundaries/`).
- **`instructions/`**, **`prompts/`**, **`workflows/`**: High-level guidance for agent interactions.

### 2. Product Agent Layer (`src/lib/ai/`)
Runtime agents that power the Novellum application features.
- **Core Agents**: `ContinuityAgent`, `EditAgent`, `RewriteAgent`, `StyleAgent`, etc.
- **Infrastructure**: `ContextEngine`, `PromptBuilder`, `ModelRouter`, `Orchestrator`.
- **See also**: [`AGENTS.md`](./AGENTS.md) for a comprehensive breakdown of all agents.

### 3. Documentation & Planning (`dev-docs/`)
- **`plans/`**: Holds strategic plans (Plan -> Stage -> Phase -> Part).
- **Core Docs**: `architecture.md`, `agents-map.md`, `ai-pipeline.md`, `context-engine.md`, `modular-boundaries.md`, `prompt-system.md`.

## Development Conventions and Workflow

### Modular Architecture
Functionality is organized by **vertical domain slices** (e.g., `bible`, `workspace`, `editor`).
- **Strict Boundaries**: Import boundaries are enforced via ESLint to prevent cross-module leakage.
- **Rules**: Every module owns its components, services, and stores. Read `dev-docs/modular-boundaries.md` before coding.

### Technical Stack Standards
- **Svelte 5 Runes**: All new UI components MUST use `$state`, `$derived`, and `.svelte.ts` patterns.
- **SQLite Persistence**: The live data store is a server-side SQLite database accessed via `/api/db/*`.
- **AI Pipeline**: Follows the `ROLE -> TASK -> CONTEXT -> CONSTRAINTS -> OUTPUT FORMAT` prompt pattern.

## Building and Running

- **Package Manager**: pnpm ≥ 9
- **Node**: ≥ 20 (required for `better-sqlite3`)
- **Dev server**: `pnpm run dev` → <http://localhost:5173>
- **Lint**: `pnpm run lint` (checks boundaries and types)
- **Tests**: `pnpm test` (Vitest)

### Environment Variables

| Variable           | Default         | Description                       |
| ------------------ | --------------- | --------------------------------- |
| `NOVELLUM_DB_PATH` | `./novellum.db` | File path for the SQLite database |
| `VITE_OPENROUTER_API_KEY` | (none) | Required for AI features (OpenRouter) |

## Planning & Quality Gates

- **Hierarchy**: Plan -> Stage -> Phase -> Part.
- **Verification**: Every part requires explicit evidence (commits, test output, lint status).
- **Quality Gates**: No plan closure without passing `lint`, `typecheck`, and `tests`.

## Vulnerabilities and Fragilities

- **AI Implementation Stub**: `OpenRouterClient` in `src/lib/ai/openrouter.ts` is currently a stub. AI features require the HTTP layer and real API keys.
- **Transition State**: The project is migrating from Svelte 4 to Svelte 5 and from Dexie to SQLite. Be vigilant about reactivity and persistence patterns.
- **Data Model Complexity**: Large projects with many entities (Beats, Lore) may hit performance bottlenecks; use scoped context loading.

## Plan Completion and Continuity Checklist

- [ ] All plan parts marked complete with evidence links.
- [ ] Required quality gates (`lint`, `check`, `test`) passed.
- [ ] Documentation (`dev-docs/`) synchronized with code changes.
- [ ] `GEMINI.md` and `AGENTS.md` updated if architectural shifts occurred.
- [ ] Next candidate plan identified and queued.
