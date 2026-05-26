---
title: Documentation Alignment
slug: stage-002-documentation-alignment
stage_number: 2
status: draft
owner: Planner Agent
plan: plan-019-naming-consistency
phases:
  - phase-001-update-context-docs
  - phase-002-update-module-and-agents-docs
estimated_duration: 1d
risk_level: low
---

## Goal

Land the canonical name map in every authoritative dev-doc and
in `AGENTS.md` / `GEMINI.md` **before** any code is renamed, so
that during Stages 003–005 the docs are the source of truth and
diffs are verifiable.

## Phases

| #   | Phase                                                                                                  | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------------------------------------ | ------- | ------------- |
| 001 | [Update context docs](phase-001-update-context-docs/phase.md)                                          | `draft` | 0.5d          |
| 002 | [Update module & agents docs](phase-002-update-module-and-agents-docs/phase.md)                        | `draft` | 0.5d          |

## Entry Criteria

- Stage 001 complete and `evidence/name-map.md` user-approved.

## Exit Criteria

- `dev-docs/repo-structure.md`, `dev-docs/routing-context.md`,
  `dev-docs/frontend-context.md`, `dev-docs/architecture.md`,
  `dev-docs/modular-boundaries.md`,
  `dev-docs/agents-map.md`, all files under
  `dev-docs/modules/`, `AGENTS.md`, and `GEMINI.md` reference
  only canonical names.
- Old names appear nowhere except a "Renamed in plan-019" footnote
  where historical traceability matters.

## Notes

- This stage is text-only. It must not touch any `.svelte`,
  `.ts`, `.css`, or config file.
- After this stage, `grep -RIn 'workspace/' dev-docs/` (and
  equivalent for every retired name) must return zero hits in
  active prose. Hits inside `dev-docs/plans/archive/**` are
  acceptable (historical record).
