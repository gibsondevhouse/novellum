---
title: Service-Layer and State Architecture Hardening
slug: plan-002-service-layer-and-state-hardening
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-12
last_updated: 2026-04-12
target_completion: 2026-06-06
path: Path 2
stages:
  - stage-001-dexie-schema-and-repository-layer
  - stage-002-module-store-architecture
  - stage-003-ai-pipeline-implementation
  - stage-004-testing-and-quality-hardening
dependencies:
  - plan-001-ui-and-interaction-model
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
  - modular_boundaries
---

## Objective

Path 1 delivered a working application shell with module stubs, a basic AI panel, and a single-shot OpenRouter proxy. Path 2 replaces every placeholder and stub with production-quality infrastructure:

1. **A complete, versioned Dexie schema** covering all story entities with typed repositories exposing clean CRUD APIs
2. **A coherent Svelte 5 store architecture** where every module owns its reactive state and app-level stores are tightly scoped
3. **A full AI pipeline** implementing the Task Resolver → Context Engine → Prompt Builder → Model Router chain defined in `dev-docs/ai-pipeline.md` and `dev-docs/context-engine.md`
4. **A testing baseline** with Vitest covering the service layer, context engine, and prompt builder before any further features are built on top

This plan is the foundation that all Phase 2 roadmap features (continuity checking, scoped AI agents, full entity editing) depend on.

## Scope

**In scope:**

- Dexie schema v2 with all entities: `Project`, `Chapter`, `Scene`, `Character`, `Location`, `LoreEntry`, `PlotThread`, `TimelineEvent`, `Beat`
- Schema versioning and upgrade path from v1
- Typed repository pattern for every entity (create, read, update, delete, query-by-project)
- Module-scoped Svelte 5 rune stores for Editor, Story Bible, Outliner
- App-level store hardening: `active-project`, `ai-panel`
- `eslint-plugin-boundaries` installation and enforcement
- Task Resolver (`taskType → role + contextPolicy + outputFormat`)
- Context Engine: all four named policies (`scene_only`, `scene_plus_adjacent`, `chapter_scope`, `continuity_scope`)
- Prompt Builder: structured 5-section template per `prompt-system.md`
- Model Router: task-type to model mapping (configurable, not hardcoded)
- Vitest + jsdom setup
- Unit tests for repository layer, context engine, prompt builder (≥80% line coverage for each)

**Out of scope:**

- Full CRUD UI for entities (deferred to Path 3)
- ContinuityAgent, SummaryAgent, RewriteAgent (deferred to Path 3)
- Consistency Engine UI (deferred to Path 3)
- ONLYOFFICE integration (deferred to Path 3)
- Export system (deferred to Path 3)
- Observability / logging infrastructure (deferred to Path 5)

## Stages

| #   | Stage                                                                                   | Status  | Est. Duration |
| --- | --------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Dexie Schema & Repository Layer](stage-001-dexie-schema-and-repository-layer/stage.md) | `draft` | 5d            |
| 002 | [Module Store Architecture](stage-002-module-store-architecture/stage.md)               | `draft` | 4d            |
| 003 | [AI Pipeline Implementation](stage-003-ai-pipeline-implementation/stage.md)             | `draft` | 6d            |
| 004 | [Testing & Quality Hardening](stage-004-testing-and-quality-hardening/stage.md)         | `draft` | 4d            |

## Quality Gates

All stages must pass the following before this plan is marked `complete`:

- [ ] **lint** — zero ESLint errors, including `eslint-plugin-boundaries` import boundary violations
- [ ] **typecheck** — `pnpm run check` (`tsc --noEmit`) exits with zero errors
- [ ] **tests** — `pnpm run test` exits with zero failures; repository, context engine, and prompt builder each have ≥80% line coverage
- [ ] **docs_sync** — `dev-docs/ai-pipeline.md`, `dev-docs/context-engine.md`, `dev-docs/data-model.md`, and `GEMINI.md` reflect the implemented pipeline and schema
- [ ] **modular_boundaries** — all source files comply with `dev-docs/modular-boundaries.md`; no cross-module internal imports; no file exceeds its warning threshold without justification

## Risks & Mitigations

| Risk                                                            | Likelihood | Mitigation                                                                                            |
| --------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| Dexie schema v1→v2 migration corrupts existing development data | low        | Run migration in a `versionchange` transaction; add a dev-only seed reset script                      |
| Context Engine token budget exceeds OpenRouter model limit      | medium     | Enforce hard char/token limits per policy in `context-engine.md`; add truncation at the policy layer  |
| `eslint-plugin-boundaries` false positives on `$lib` alias      | low        | Configure alias resolution in ESLint settings; test with `pnpm run lint` before marking part complete |
| Store architecture refactor breaks Path 1 UI components         | medium     | Stage 002 is executed before Stage 003; integration tested at end of each phase                       |
| Vitest + Dexie mock setup is non-trivial in jsdom environment   | medium     | Use `fake-indexeddb` package for Dexie tests; document setup in `part-001-vitest-setup`               |

## Completion Checklist

- [ ] All plan parts marked `complete` with evidence links
- [ ] Quality gates passed
- [ ] `dev-docs/` documentation synchronized
- [ ] Security and data-boundary checks passed
- [ ] Manual QA scenarios executed and captured
- [ ] MASTER-PLAN updated with completion status
- [ ] Next candidate plan (Path 3: Domain feature deepening and workflow parity) identified and queued

## Notes

All code written in this plan must conform to `dev-docs/modular-boundaries.md`. Every repository function is pure TypeScript; no Svelte primitives. Every store file uses Svelte 5 `$state`/`$derived` runes only — no legacy `writable`/`readable` stores.
