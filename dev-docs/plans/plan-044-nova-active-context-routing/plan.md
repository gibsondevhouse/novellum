---
title: Nova Active Context Routing
slug: plan-044-nova-active-context-routing
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-06-09
last_updated: 2026-06-11
target_completion: 2026-06-11
stages:
  - stage-001-context-contract-audit
  - stage-002-route-derived-context
  - stage-003-editor-and-nova-integration
  - stage-004-regression-and-docs
dependencies:
  - plan-031-nova-vscode-copilot-parity
  - plan-038-novel-engine-v1
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - e2e
  - check:tokens
---

## Objective

Make Nova reliably know the active project, scene, and chapter on normal project/editor routes without depending on query-string context.

The author draft engine, scene-grounded Ask mode, and Agent mode should receive canonical route/page context whenever the user is already inside a project or editor surface.

## Scope

**In scope:**

- Audit current `NovaPanel`, `NovaComposer`, editor route, outline route, and root layout context wiring.
- Define a canonical active-context contract for `projectId`, `activeSceneId`, `activeChapterId`, and future active outline targets.
- Derive context from route params, page data, or a shared editor/project context store instead of only `page.url.searchParams`.
- Preserve URL query support as an optional deep-link override where useful.
- Add tests covering editor route context, chapter draft availability, and scene-grounded Nova prompts.

**Out of scope:**

- Redesigning the Nova panel UI.
- Adding new Nova modes.
- Changing AI prompt content except where current context omissions are corrected.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Context Contract Audit](stage-001-context-contract-audit/stage.md) | `draft` | TBD |
| 002 | [Route-Derived Context](stage-002-route-derived-context/stage.md) | `draft` | TBD |
| 003 | [Editor & Nova Integration](stage-003-editor-and-nova-integration/stage.md) | `draft` | TBD |
| 004 | [Regression & Docs](stage-004-regression-and-docs/stage.md) | `draft` | TBD |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors
- [ ] **lint:css** — zero CSS lint errors
- [ ] **typecheck** — zero type errors and zero warnings
- [ ] **tests** — Vitest suite passes
- [ ] **e2e** — editor/Nova smoke coverage proves active scene and chapter context are present
- [ ] **check:tokens** — zero token violations
- [ ] **docs_sync** — Nova/editor context docs describe the active-context source of truth

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Multiple route surfaces disagree on active context | medium | Create one small context-normalization helper or store and test it directly |
| Query-param deep links regress | low | Keep query params as explicit overrides and add focused tests |
| Draft engine appears outside valid editor contexts | low | Gate author draft controls on resolved project plus chapter readiness |

## Notes

The full draft plan tree has been scaffolded through stages, phases, parts, checklists, implementation logs, and evidence README files. Status remains `draft`; no implementation work has started and tracker files have not been changed.

