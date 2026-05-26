---
title: Context & Architecture Docs
slug: stage-002-context-and-architecture
stage_number: 2
status: draft
owner: Planner Agent
plan: plan-014-documentation-refresh
phases:
  - phase-001-top-level-context
  - phase-002-architecture-and-data
estimated_duration: 2d
risk_level: medium
---

## Goal

Refresh the top-level architectural and contextual documents so they describe the current Novellum system (SvelteKit 2, Svelte 5 Runes, SQLite-primary, Dexie-portability, unified world-building shell, runtime agent roster).

## Phases

| #   | Phase                                                                       | Status  | Est. Duration |
| --- | --------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Top-Level Context](phase-001-top-level-context/phase.md)                   | `draft` | 1d            |
| 002 | [Architecture & Data Model](phase-002-architecture-and-data/phase.md)       | `draft` | 1d            |

## Entry Criteria

- Stage 001 `complete`; terminology glossary available.

## Exit Criteria

- All files in scope for this stage are either edited or explicitly verified current.
- `pnpm run lint` passes.
- Cross-references between these docs resolve.

## Notes

`project-context.md`, `project-overview.md`, `frontend-context.md`, `backend-context.md`, `routing-context.md` are the most user-visible entry points and must be the highest-quality rewrites.
