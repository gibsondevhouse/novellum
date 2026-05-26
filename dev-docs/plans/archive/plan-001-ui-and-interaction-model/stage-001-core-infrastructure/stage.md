---
title: Core Infrastructure
slug: stage-001-core-infrastructure
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-001-ui-and-interaction-model
phases:
  - phase-001-project-scaffolding-and-configuration
  - phase-002-core-architecture-implementation
estimated_duration: 7d
risk_level: low
---

## Goal

Bootstrap the Novellum repository from an empty workspace into a fully configured SvelteKit + TypeScript project with a working local-first data layer, a defined modular source structure, and stubbed AI orchestration entry points — everything downstream stages need to build on.

## Phases

| #   | Phase                                                                                           | Status     | Est. Duration |
| --- | ----------------------------------------------------------------------------------------------- | ---------- | ------------- |
| 001 | [Project Scaffolding & Configuration](phase-001-project-scaffolding-and-configuration/phase.md) | `complete` | 2d            |
| 002 | [Core Architecture Implementation](phase-002-core-architecture-implementation/phase.md)         | `complete` | 3d            |

## Entry Criteria

- Workspace is clean: only `.github/` and `novellum-docs/` exist at the repo root
- Node.js ≥ 20 and pnpm ≥ 9 are available in the dev environment
- `GEMINI.md` and `dev-docs/architecture.md` have been reviewed

## Exit Criteria

- All parts in both phases reach `complete` status
- `pnpm install` succeeds with no errors
- `pnpm run check` (TypeScript) exits clean
- `pnpm run lint` exits clean
- `pnpm run dev` starts the SvelteKit dev server without errors
- Dexie DB initializes and schema version is logged to console on startup
- AI orchestrator stub is importable with no type errors

## Notes

All new source files live under `src/`. The monorepo-style module layout (`src/modules/`) is established here and must not be reorganized by later stages without a dedicated refactor part.
