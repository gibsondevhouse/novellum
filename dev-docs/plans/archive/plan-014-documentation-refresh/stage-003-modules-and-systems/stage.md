---
title: Module & System Docs
slug: stage-003-modules-and-systems
stage_number: 3
status: draft
owner: Planner Agent
plan: plan-014-documentation-refresh
phases:
  - phase-001-module-docs
  - phase-002-ai-system-docs
estimated_duration: 2d
risk_level: medium
---

## Goal

Refresh module-level docs (`dev-docs/modules/*`) and the AI system docs (`ai-pipeline.md`, `context-engine.md`, `prompt-system.md`, `agents-map.md`) so they match shipped source under `src/modules/**` and `src/lib/ai/**`.

## Phases

| #   | Phase                                                         | Status  | Est. Duration |
| --- | ------------------------------------------------------------- | ------- | ------------- |
| 001 | [Module Docs](phase-001-module-docs/phase.md)                 | `draft` | 1d            |
| 002 | [AI System Docs](phase-002-ai-system-docs/phase.md)           | `draft` | 1d            |

## Entry Criteria

- Stage 002 `complete` (context docs stabilize terminology for module docs).

## Exit Criteria

- Every module doc describes the shipped module structure, boundaries, and public surface.
- AI system docs match the runtime agent roster in `AGENTS.md` and the directory layout under `src/lib/ai/`.
- `pnpm run lint` passes.

## Notes

Module docs must be cross-checked against `eslint.config.js` boundary rules and `src/modules/<name>/index.ts` barrels.
