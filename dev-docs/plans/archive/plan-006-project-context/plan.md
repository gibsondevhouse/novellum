---
title: write-project-context-docs
slug: plan-006-project-context
version: 1.0.0
status: complete
owner: GitHub Copilot
created: 2026-04-14
last_updated: 2026-04-14
target_completion: 2026-04-14
stages:
  - stage-001-author-docs
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
---

## Objective

Create a complete guide to the files involved in the active project system, detailing routing, database design, state management, and UI logic for projects in Novellum.

## Scope

**In scope:**

- Writing `dev-docs/project-context.md`
- Documenting files in `src/modules/project/`
- Documenting routing `src/routes/projects/`
- Mapping `src/lib/stores/active-project.svelte.ts`
- Detailing `projectId` links in the database schema

**Out of scope:**

- Significant UI or feature changes
- Documentation for completely independent modules

## Stages

| #   | Stage                                     | Status     | Est. Duration |
| --- | ----------------------------------------- | ---------- | ------------- |
| 001 | [Author Project Context Docs](stage-001-author-docs/stage.md) | `complete` | 1d            |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [x] **lint** — zero lint errors
- [x] **typecheck** — zero type errors
- [x] **tests** — all tests pass
- [x] **docs_sync** — relevant docs updated

## Risks & Mitigations

| Risk         | Likelihood | Mitigation          |
| ------------ | ---------- | ------------------- |
| Documentation becomes outdated rapidly | low        | Keep focus on fundamental path conventions and entity names. |

## Notes

Documentation ensures that agents and engineers working on the system understand how the concept of the active project is propagated through the entire stack.