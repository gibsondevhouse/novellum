# Project Configuration

- **Language**: TypeScript (v6+)
- **Package Manager**: pnpm (v9+)
- **UI Framework**: Svelte 5 (Runes)
- **Database**: SQLite (via `better-sqlite3`) & Dexie (Migration/Portability)

---

## GEMINI.md for Novellum Project

## Project Overview

Novellum is an AI-assisted novel production system designed to be integrated with the Gemini CLI. Its primary purpose is to empower users to leverage AI capabilities for novel writing and related tasks directly from their terminal and a modern web interface. The project utilizes a structured system of agents, skills, and workflows, with a strong emphasis on documentation and modular architecture.

## Key Components and Structure

The project is organized into two distinct layers: the **Meta-Agent Layer** (for development) and the **Product Agent Layer** (for user features).

### 1. Meta-Agent Layer (`.github/`)
This directory houses critical configuration and definitions for the Gemini CLI and its development agents.
- **`agents/`**: Defines specialized AI agents for development tasks (Planner, Reviewer, Architect, Stylist, Backend, AI).
- **`skills/`**: Reusable modules or capabilities for dev-agents (e.g., `ai-context/`, `svelte5-runes/`, `modular-boundaries/`).
- **`instructions/`**, **`prompts/`**, **`workflows/`**: High-level guidance for agent interactions.

### 2. Product Agent Layer (`src/lib/ai/`)
Runtime agents that power the Novellum application features.
- **Core Agents**: `ContinuityAgent`, `EditAgent`, `RewriteAgent`, `StyleAgent`, `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, `SummaryAgent`.
- **Infrastructure**: `ContextEngine`, `PromptBuilder`, `ModelRouter`, `OpenRouterClient` (Streaming HTTP implementation).
- **See also**: [`AGENTS.md`](./AGENTS.md) for a comprehensive breakdown of all agents.

### 3. Documentation & Planning (`dev-docs/`)
- **`plans/`**: Holds strategic plans (Plan -> Stage -> Phase -> Part).
- **Core Docs**: `architecture.md`, `agents-map.md`, `ai-pipeline.md`, `context-engine.md`, `modular-boundaries.md`, `prompt-system.md`.

## Development Conventions and Workflow

### Modular Architecture
Functionality is organized by **vertical domain slices** (e.g., `project`, `world-building`, `outline`, `editor`, `continuity`).
- **Strict Boundaries**: Import boundaries are enforced via ESLint (`eslint-plugin-boundaries`) to prevent cross-module leakage.
- **Rules**: Every module owns its components, services, and stores. Read `dev-docs/modular-boundaries.md` before coding.

### Technical Stack Standards
- **Svelte 5 Runes**: All new UI components MUST use `$state`, `$derived`, and `.svelte.ts` patterns. Old Svelte 4 patterns are deprecated.
- **Linearization UI**: All UI components must adhere to the Linear-inspired UI design system. Use `SurfaceCard`, `SurfacePanel`, `SectionHeader`, and standard buttons (`PrimaryButton`, `GhostButton`). Use `--space-*` tokens for all layout.
- **SQLite Persistence**: The primary data store is a server-side SQLite database accessed via `/api/db/*`. Dexie is used only for legacy migration and portability snapshots.
- **AI Pipeline**: Follows the `ROLE -> TASK -> CONTEXT -> CONSTRAINTS -> OUTPUT FORMAT` prompt pattern.

## Building and Running

- **Package Manager**: pnpm ≥ 9
- **Node**: ≥ 20 (required for `better-sqlite3`)
- **Dev server**: `pnpm run dev` → <http://localhost:5173>
- **Lint**: `pnpm run lint` (checks boundaries, types, and visual tokens)
- **Tests**: `pnpm test` (Vitest), `pnpm run test:visual` (Playwright)

### Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `NOVELLUM_DB_PATH` | `./novellum.db` | File path for the SQLite database |
| `NOVELLUM_APP_DATA_DIR` | `~/.novellum` | Directory for the credential secure store |
| `NOVELLUM_AI_MOCK` | `0` | When `1`, `/api/ai` returns mock responses |

> AI provider credentials are no longer read from environment variables.
> They are stored server-side via the credential service (see
> `src/lib/server/credentials/`) and configured through the Settings UI.

## Recent Accomplishments

- **Plan-012 (Codebase Extraction)**: Major refactor of duplicated repository patterns and store CRUD boilerplate (~840 lines reduced).
- **Refactor-010 (Visual Consistency)**: Enforced visual consistency across route families through baseline rulebooks and automated token checks.
- **AI Engine Implementation**: Browser proxies to `/api/ai`; server-side OpenRouter provider in `src/lib/ai/providers/openrouter-provider.ts` with streaming support.
- **Frontend Hardening**: Production-grade error boundaries, accessibility improvements, and design system enforcement.

## Current Focus (Active Plans)

- **Plan-013 (Workspace Hierarchy Flow)**: Wiring the full Arc → Act → Chapter → Scene parent-child data flow across all workspace modes.

## Vulnerabilities and Fragilities

- **Legacy Persistence**: Dexie code still exists in `src/lib/db`, `src/lib/migration`, and `src/modules/export` for migration and snapshotting. Be careful not to use it for new features.
- **Transition State**: While Svelte 5 usage is high, some older components or patterns might still linger in less-frequented routes.
- **Data Model Complexity**: The deep hierarchy (Arc/Act/Chapter/Scene) being implemented in Plan-013 requires careful foreign key management and UI filtering.

## Plan Completion and Continuity Checklist

- [ ] All plan parts marked complete with evidence links.
- [ ] Required quality gates (`lint`, `check`, `test`, `check:tokens`) passed.
- [ ] Documentation (`dev-docs/`) synchronized with code changes.
- [ ] `GEMINI.md` and `AGENTS.md` updated if architectural shifts occurred.
- [ ] Next candidate plan identified and queued.
