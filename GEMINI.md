# Project Configuration

- **Language**: TypeScript (v6+)
- **Package Manager**: pnpm (v9+)
- **UI Framework**: Svelte 5 (Runes)
- **Database**: SQLite (via `better-sqlite3`) & Dexie (Migration/Portability)

---

## GEMINI.md for Novellum Project

## Agent Startup Protocol (Gemini, Claude, Copilot)

All assistants should bootstrap context consistently before implementing work:

- Read [`AGENTS.md`](./AGENTS.md) first for the canonical agent ecosystem and resumption rules.
- Read [`GEMINI.md`](./GEMINI.md) for active project conventions, priorities, and known fragilities.
- If no explicit task is provided, run the active-plan discovery process from [`AGENTS.md`](./AGENTS.md#0-resuming-work--active-plan-discovery).
- Load relevant instruction files from [`.github/instructions/`](./.github/instructions/) for the files being modified.
- Load relevant skill docs from [`.github/skills/`](./.github/skills/) to follow domain-specific implementation patterns.
- Reuse prompt templates in [`.github/prompts/`](./.github/prompts/) and workflow guidance in [`.github/workflows/`](./.github/workflows/) where applicable.

This protocol is mandatory to keep Gemini, Claude, and Copilot behavior aligned.

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
- **Cut from internal V1 (2026-05-13, plan-025):** `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, `SummaryAgent` were declared TaskTypes but never wired to a parser. Re-introducing any is a new feature plan (see plan-040 for Outline). See [`AGENTS.md`](./AGENTS.md).
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

- **Plan-049 progress (Runtime Hardening)**: Completed runtime inventory/contract, durable run ledger schema, typed server ledger repository, read-only Nova run routes, SQLite-backed queue claiming/stale-recovery mechanics, and local worker lifecycle/cancel/retry support (Active 2026-06-14).
- **Plan-040 (Outline Generation)**: Worldbuilding-to-Outline review-gated proposal flow (Closed 2026-06-04).
- **Plan-047 (Worldbuilding Canon Merge Diff)**: Reviewable worldbuilding canon diff/merge acceptance with audit metadata (Closed 2026-06-14).
- **Plan-046 (Pipeline Reconciliation)**: Canonical checkpoint route/schema/docs/test reconciliation with full E2E closure (Closed 2026-06-14).
- **Plan-045 (Agent Mutation Boundary)**: Separated model-callable Agent tools from UI/app mutation commands and closed review-gated validation (Closed 2026-06-12).
- **Plan-039 (Manuscript Export UI)**: Chapter subset selector and delivery helper for browser/desktop (Closed 2026-06-03).
- **Plan-041 (Docs Rebaseline)**: Reframed milestones and reconciled dev-docs (Closed 2026-06-01).
- **Plan-038 (Novel Engine v1)**: Draft-from-Outline agentic pipeline (Closed 2026-06-01).
- **Plan-037 (Agentic Worldbuild Scan)**: Review-gated scan + proposal flow for worldbuilding (Closed 2026-06-01).
- **Plan-031 (Nova VS Code Parity)**: Sidebar copilot with Ask/Write/Agent modes and bounded tool loop (Closed 2026-05-28).
- **Plan-029 (V1.1 Closeout)**: Retired legacy plans (019, 021) and finalized v1.1 scoping (Closed 2026-05-27).
- **Plan-013 through Plan-028**: Foundational V1/V1.1 features (SQLite, UI refactor, Nova identity, settings IA) — see [`dev-docs/01-project/journey.md`](./dev-docs/01-project/journey.md).

## Current Focus (Active Plans)

Active plan: **Plan-049 (Runtime Hardening)**. Current focus: Stage 004 / Phase 001 / Part 001, Model Capability Registry. Completed so far: Stage 001 runtime contract, Stage 002 durable run ledger, and Stage 003 local job execution.

### Roadmap Execution Order (Draft Queue)

To ensure system stability and logical dependency management, execute pending plans in the following sequence:

1.  **Phase 1: Context & Safety Foundations**
    - [x] **Plan-044 (Active Context Routing)**: Resolved Nova/AI context from routes; fixed brittle query-param detection (Closed 2026-06-11).
    - [x] **Plan-045 (Agent Mutation Boundary)**: Enforce strict separation between AI reading and manuscript mutation. (Closed 2026-06-12)

2.  **Phase 2: Pipeline Standardization**
    - [x] **Plan-043 (Outline Consolidation)**: Retire legacy direct apply paths; make checkpoints the sole materialization path. (Closed 2026-06-12)
    - [x] **Plan-046 (Pipeline Reconciliation)**: Align schemas and routes across all generation pipelines. (Closed 2026-06-14)
    - [x] **Plan-047 (Worldbuilding Canon Merge Diff)**: Upgrade worldbuilding from "insert-only" to a full diff/merge flow. (Closed 2026-06-14)

3.  **Phase 3: Infrastructure & Coherence**
    - [ ] **Plan-049 (Runtime Hardening)**: SQLite job queue, durable runs, token budgeting, and AI traces. (Active)
    - [ ] **Plan-048 (Frontend Coherence)**: Final UX pass for navigation, review gates, and visual state unification.

4.  **Phase 4: Release Engineering**
    - [ ] **Release Engineering**: Code signing, notarization, brand icons, and production smoke tests.

## Planning Standards
- Define the required plan hierarchy: Plan -> Stage -> Phase -> Part.
- Require YAML frontmatter in every plan artifact.
- Require measurable acceptance criteria per part.
- Require quality gates before closure: lint, typecheck, tests, docs sync.
- Require explicit evidence links: commits, PRs, test output, QA notes.
- Follow [`.github/instructions/plan-conventions.instructions.md`](./.github/instructions/plan-conventions.instructions.md) for any edits under `dev-docs/plans/**`.

## Development Paths
- Path 1: UI and interaction model evolution.
- Path 2: Service-layer and state architecture hardening.
- Path 3: Domain feature deepening and workflow parity.
- Path 4: Local-first data, indexing, and retrieval capabilities.
- Path 5: Observability, reliability, and model-budget optimization.

## Vulnerabilities and Fragilities
- **Type Safety**: `pnpm check` is clean as of Plan-049 Stage 003 implementation closeout. Keep running it before plan closure.
- **Visual Drift**: Pre-existing cross-surface snapshot drift in Playwright tests. Impact: Unreliable visual regression testing. Detection: `pnpm run test:visual`.
- **Linting**: `pnpm lint` and `pnpm lint:css` are clean as of Plan-047 implementation closeout. Treat new warnings/errors as regressions.
- **Legacy Persistence**: Dexie remains in `src/lib/db` and `src/modules/export` strictly for portability snapshots. Do not use for new live reads/writes.
- **Sidebar/active-project detection**: Path parsing is brittle on routes outside `/projects/<id>/...`. Verified gotcha — see `dev-docs/02-architecture/routing.md`.
- **`+server.ts` export discipline**: ESLint restricts to handlers / `config` / `_`-prefixed exports. Helpers must live in sibling files.

## Plan Completion and Continuity Checklist
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
