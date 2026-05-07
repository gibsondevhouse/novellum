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
- **Shipped agents**: `ContinuityAgent`, `EditAgent`, `RewriteAgent`, `StyleAgent`.
- **Planned agents**: `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, `SummaryAgent`.
- **Infrastructure**: `ContextEngine`, `PromptBuilder`, `ModelRouter`, `OpenRouterClient` (streaming HTTP via the `/api/ai` proxy).
- **See also**: [`AGENTS.md`](./AGENTS.md) for the dual-layer agent reference.

### 3. Documentation & Planning (`dev-docs/`)
The canonical developer reference. New IA (2026-05):
- `01-project/` — overview, roadmap, **journey** (chronological history).
- `02-architecture/` — system, frontend, backend, routing, data-model, modular-boundaries, tauri-shell.
- `03-ai/` — pipeline, agents-map, context-engine, prompt-system.
- `04-modules/` — one page per module.
- `05-workflow/` — dev-workflow, planning-conventions, testing, portability-runbook, release.
- `plans/` — active and archived plans (Plan → Stage → Phase → Part).

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

- **Plan-013 (Workspace Hierarchy Flow)**: Arc → Act → Chapter → Scene → Beat fully wired across all workspace modes.
- **Plan-017 (World-Building Consolidation)**: Personae, Atlas, Archive, Threads, Chronicles unified under a single shell; legacy Story Bible deprecated with redirects.
- **AI Pipeline (shipped)**: Server-side OpenRouter provider, `/api/ai` proxy with streaming, four runtime agents (Continuity, Edit, Rewrite, Style).
- **Portability**: `.novellum.zip` import/export round-trip with snapshots and assets; Dexie scoped to portability only.
- **Visual Consistency**: Token enforcement (`pnpm check:tokens`) and `eslint-plugin-boundaries` running in CI.
- **Documentation Refactor (this pass)**: Full IA reset under `dev-docs/`, user/developer split under `novellum-docs/`, archive snapshots preserved.

## Current Focus (Active Plans)

- **Plan-018 (V1 Product Experience)** — drafting.
- **Plan-019 (Pre-Release Hardening)** — drafting.
- **Plan-020 (UI/UX Polish)** — drafting.
- **Plan-021 (Reader Surface)** — drafting.
- **Plan-022 (Settings IA)** — drafting.
- **Plan-023 (Hub Dashboard)** — drafting.

See [`dev-docs/plans/MASTER-PLAN.md`](./dev-docs/plans/MASTER-PLAN.md) for the canonical status board.

## Vulnerabilities and Fragilities

- **Legacy Persistence**: Dexie remains in `src/lib/db` and `src/modules/export` strictly for portability snapshots. Do not use for new live reads/writes.
- **Sidebar/active-project detection**: Path parsing is brittle on routes outside `/projects/<id>/...`. Verified gotcha — see `dev-docs/02-architecture/routing.md`.
- **`+server.ts` export discipline**: ESLint restricts to handlers / `config` / `_`-prefixed exports. Helpers must live in sibling files.

## Plan Completion and Continuity Checklist

- [ ] All plan parts marked complete with evidence links.
- [ ] Required quality gates (`lint`, `check`, `test`, `check:tokens`) passed.
- [ ] Documentation (`dev-docs/`) synchronized with code changes.
- [ ] `GEMINI.md` and `AGENTS.md` updated if architectural shifts occurred.
- [ ] Next candidate plan identified and queued.
