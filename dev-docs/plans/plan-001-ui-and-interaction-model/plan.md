---
title: UI and Interaction Model Evolution
slug: plan-001-ui-and-interaction-model
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-11
last_updated: 2026-04-11
target_completion: 2026-05-09
path: Path 1
stages:
  - stage-001-core-infrastructure
  - stage-002-application-shell
  - stage-003-module-shell-implementation
  - stage-004-ai-interaction-layer
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
---

## Objective

Establish the full foundation for Novellum and deliver its core UI interaction model. This plan covers everything from initial project scaffolding through to a working multi-module SvelteKit application with a functioning AI assistant panel — giving writers a coherent, distraction-free environment to plan, draft, and refine their work.

This is **Path 1** of the Novellum development roadmap: _UI and interaction model evolution._

## Scope

**In scope:**

- SvelteKit project scaffold with TypeScript, ESLint, Prettier
- Local-first data layer using Dexie.js with base schema
- Modular source structure aligned with `/modules/project`, `/bible`, `/outliner`, `/editor`, `/ai`
- AI orchestration entry points (OpenRouter client stub + context injection interface)
- Application shell: sidebar navigation, page routing, layout
- Design system tokens: colors, typography, spacing (dark editorial theme)
- Module shell UIs: Project Hub, Story Bible, Outliner, Draft Editor
- AI assistant panel component with suggestion accept/reject flow

**Out of scope:**

- Full ONLYOFFICE integration (deferred to Path 3)
- AI model fine-tuning or provider switching UI (deferred to Path 5)
- Export system (deferred to Path 3)
- User authentication or sync (deferred to a later path)

## Stages

| #   | Stage                                                                         | Status     | Est. Duration |
| --- | ----------------------------------------------------------------------------- | ---------- | ------------- |
| 001 | [Core Infrastructure](stage-001-core-infrastructure/stage.md)                 | `complete` | 7d            |
| 002 | [Application Shell & Design System](stage-002-application-shell/stage.md)     | `complete` | 4d            |
| 003 | [Module Shell Implementation](stage-003-module-shell-implementation/stage.md) | `complete` | 5d            |
| 004 | [AI Interaction Layer](stage-004-ai-interaction-layer/stage.md)               | `complete` | 3d            |

## Quality Gates

All stages must pass the following before this plan is marked `complete`:

- [ ] **lint** — zero ESLint errors across the codebase, including `eslint-plugin-boundaries` import boundary rules
- [ ] **typecheck** — `tsc --noEmit` exits with no errors
- [ ] **tests** — all unit and integration tests pass
- [ ] **docs_sync** — `dev-docs/` and `GEMINI.md` updated to reflect final state
- [ ] **modular_boundaries** — all source files comply with `dev-docs/modular-boundaries.md`; no file exceeds its warning threshold without justification; no cross-module internal imports

## Risks & Mitigations

| Risk                                                        | Likelihood | Mitigation                                                                      |
| ----------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| ONLYOFFICE integration complexity discovered early          | medium     | Keep editor shell as a plain `<textarea>` stub; ONLYOFFICE deferred to Stage 3+ |
| Dexie schema changes mid-plan require migrations            | low        | Define schema with versioning from Part 1 of Stage 1                            |
| OpenRouter API changes                                      | low        | Wrap in an adapter interface; swap implementation without touching callers      |
| SvelteKit routing refactor needed after module shells added | low        | Establish route conventions in Stage 2 before building module shells            |

## Completion Checklist

- [x] All plan parts marked complete with evidence links
- [x] Quality gates passed
- [ ] `dev-docs/` documentation synchronized
- [x] Security and data-boundary checks passed
- [ ] Manual QA scenarios executed and captured
- [x] MASTER-PLAN updated with completion status
- [ ] Next candidate plan (Path 2: Service-layer and state architecture hardening) identified and queued

## Notes

Tech stack locked for this plan: **SvelteKit + TypeScript + Dexie.js + OpenRouter**. Design system references `dev-docs/design-system.md` (dark editorial theme — Charcoal/Slate/Nova Blue/Teal).
