---
title: Story Planning Workspace Structural Refactor
slug: refactor-002-story-planning-workspace
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-13
last_updated: 2026-04-13
target_completion: 2026-06-05
track: Refactor
stages:
  - stage-001-discovery-and-naming-alignment
  - stage-002-story-frame-and-acts-foundation
  - stage-003-navigator-hierarchy-and-selection-ux
  - stage-004-planning-surface-shell-and-card-parity
  - stage-005-beat-model-and-overlay-interaction
  - stage-006-pacing-telemetry-and-signals
  - stage-007-arc-readiness-hooks
  - stage-008-migration-and-quality-hardening
dependencies:
  - plan-001-ui-and-interaction-model
  - plan-002-service-layer-and-state-hardening
  - refactor-001-ui_ux-polish
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
  - boundaries_guard
  - route_thinness
---

## Objective

Unblock application delivery by restructuring the Outline page into a modular Story Planning Workspace with explicit hierarchy (Story Frame -> Acts -> Chapters -> Scenes -> Beats), reusable planning surfaces, and migration-safe data evolution.

## Scope

**In scope:**

- Outline route decomposition into thin orchestration + module components
- Story Frame and Act-level planning entities aligned to chapter/scene structure
- Selector-first navigator hierarchy improvements for act/chapter/scene traversal
- Reusable planning surface shell with chapter/scene card parity
- Numbered beat workflow and focused beat overlay interaction
- Pacing telemetry signals and non-invasive arc-readiness hooks
- Migration scripts, regression tests, and performance checks for large projects

**Out of scope:**

- Rewriting editor module workflows outside handoff boundaries
- AI model or prompt-system redesign unrelated to planning structure
- Tauri packaging concerns

## Stages

- 001: [Discovery and Naming Alignment](stage-001-discovery-and-naming-alignment/stage.md) (`draft`, 2d)
- 002: [Story Frame and Acts Foundation](stage-002-story-frame-and-acts-foundation/stage.md) (`draft`, 4d)
- 003: [Navigator Hierarchy and Selection UX](stage-003-navigator-hierarchy-and-selection-ux/stage.md) (`draft`, 4d)
- 004: [Planning Surface Shell and Card Parity](stage-004-planning-surface-shell-and-card-parity/stage.md) (`draft`, 4d)
- 005: [Beat Model and Overlay Interaction](stage-005-beat-model-and-overlay-interaction/stage.md) (`draft`, 3d)
- 006: [Pacing Telemetry and Signals](stage-006-pacing-telemetry-and-signals/stage.md) (`draft`, 3d)
- 007: [Arc Readiness Hooks](stage-007-arc-readiness-hooks/stage.md) (`draft`, 2d)
- 008: [Migration and Quality Hardening](stage-008-migration-and-quality-hardening/stage.md) (`draft`, 4d)

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** - zero lint errors
- [ ] **typecheck** - zero TypeScript errors
- [ ] **tests** - unit/integration suites pass, including migration safety tests
- [ ] **docs_sync** - outliner and architecture docs mirror delivered behavior
- [ ] **boundaries_guard** - no module-boundary violations introduced
- [ ] **route_thinness** - outline route remains an orchestration surface

## Risks and Mitigations

- Route decomposition causes temporary UX regressions: likelihood `medium`; mitigation: deliver behind stage-scoped acceptance checks with parity snapshots.
- Data migration may lose or reorder outline entities: likelihood `medium`; mitigation: build idempotent migration with rollback strategy and fixture-based tests.
- New hierarchy may introduce accessibility and keyboard navigation debt: likelihood `medium`; mitigation: include keyboard and focus acceptance in each UI stage.
- Scope creep into unrelated modules: likelihood `high`; mitigation: enforce module boundaries and maintain strict out-of-scope constraints.

## Notes

This plan is derived from `dev-docs/plans/story-planning-workspace-plan.zip` and normalized to repository conventions (`plan -> stage -> phase -> part`) for immediate execution.
