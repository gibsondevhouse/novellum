---
title: Documentation Refresh (All Project Docs)
slug: plan-014-documentation-refresh
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-04-20
last_updated: 2026-04-20
target_completion: 2026-05-04
stages:
  - stage-001-audit-and-inventory
  - stage-002-context-and-architecture
  - stage-003-modules-and-systems
  - stage-004-user-facing-docs
  - stage-005-validation-and-master-plan
dependencies: []
quality_gates:
  - lint
  - docs_sync
---

## Objective

Refresh every authoritative documentation artifact in the repository so it accurately reflects the current Novellum system: Svelte 5 Runes UI, SvelteKit 2 routing, SQLite-primary persistence with Dexie portability, the unified `IndividualsWorkspaceShell` world-building surface, the current AI pipeline (ContextEngine → PromptBuilder → ModelRouter → OpenRouter), and the runtime agent roster defined in `AGENTS.md`.

Documentation currently drifts from the shipped product in several places (module names, data model, routing, agent roster, AI pipeline). This plan establishes a single refresh pass that brings every `.md` under `dev-docs/` and `novellum-docs/` into sync, validates cross-references, and records evidence.

## Scope

**In scope:**

- `dev-docs/` top-level context files (`architecture.md`, `data-model.md`, `repo-structure.md`, `tech-stack-docs.md`, `project-context.md`, `project-overview.md`, `frontend-context.md`, `backend-context.md`, `routing-context.md`, `design-system.md`, `modular-boundaries.md`, `dev-workflow.md`, `roadmap.md`).
- `dev-docs/modules/*.md` (story-bible, editor, outliner, editing-layer, consistency-engine, export, project-hub).
- `dev-docs/ai-pipeline.md`, `dev-docs/context-engine.md`, `dev-docs/prompt-system.md`, `dev-docs/agents-map.md`.
- `dev-docs/context-docs/frontend.md`, `dev-docs/audits/component-inventory.md`, `dev-docs/checklists/ui-review.md`, `dev-docs/portability-recovery-runbook.md`, `dev-docs/feature-spec-template.md`.
- `novellum-docs/docs/setup-guide.md`, `novellum-docs/docs/user-manual.md`, `novellum-docs/README.md`.
- Cross-reference pass against `AGENTS.md` and `GEMINI.md`.

**Out of scope:**

- `dev-docs/plans/**` (plan artifacts are historical records and not part of this refresh).
- `dev-docs/implementation-logs/**` (append-only; not rewritten).
- `.github/agents/**` (meta-agent specs are governed by their own refactors).
- Source code changes, new features, or schema changes.

## Stages

| #   | Stage                                                                              | Status  | Est. Duration |
| --- | ---------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Audit & Inventory](stage-001-audit-and-inventory/stage.md)                        | `draft` | 1d            |
| 002 | [Context & Architecture Docs](stage-002-context-and-architecture/stage.md)         | `draft` | 2d            |
| 003 | [Module & System Docs](stage-003-modules-and-systems/stage.md)                     | `draft` | 2d            |
| 004 | [User-Facing Docs](stage-004-user-facing-docs/stage.md)                            | `draft` | 1d            |
| 005 | [Validation & MASTER-PLAN](stage-005-validation-and-master-plan/stage.md)          | `draft` | 1d            |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` passes with zero errors (markdown + ESLint boundaries).
- [ ] **docs_sync** — every in-scope doc edited or explicitly verified current; cross-references resolve.
- [ ] **boundary_claims_verified** — any claim about modules/boundaries is verified against `eslint.config.js` and `src/modules/**`.
- [ ] **runtime_parity** — docs match `AGENTS.md` runtime agent roster and `src/lib/ai/**` structure.

## Risks & Mitigations

| Risk                                          | Likelihood | Mitigation                                                                         |
| --------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| Docs drift again between stages               | medium     | Run full cross-reference check in stage 005; record deltas in the audit inventory. |
| Source-of-truth ambiguity (dev-docs vs AGENTS)| medium     | Treat `AGENTS.md` + source code as ground truth; docs describe, never redefine.    |
| Module terminology mismatch (Personae/Atlas)  | medium     | Audit stage produces a terminology glossary used by all later edits.               |
| Markdown lint regressions (MD034, MD060)      | low        | Each part runs `pnpm run lint` before marking `review`.                            |

## Notes

- Ground truth order: running source code → `AGENTS.md` → `GEMINI.md` → `eslint.config.js` → shipped routes → existing docs.
- Refresh, don't rewrite: preserve existing structure and frontmatter when doc still reflects reality; edit surgically.
- Every part must add at least one evidence artifact (a lint log, diff summary, or cross-reference check) under `evidence/`.
