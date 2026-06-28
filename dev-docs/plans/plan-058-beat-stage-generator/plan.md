---
title: Beat & Stage Generator
slug: plan-058-beat-stage-generator
version: 1.0.0
status: in-progress
owner: Planner Agent
created: 2026-06-25
last_updated: 2026-06-28
target_completion: 2026-08-12
stages:
  - stage-001-beat-schema-prompts
  - stage-002-outline-expansion-service
  - stage-003-beat-view-editor
  - stage-004-verification
dependencies:
  - plan-057-context-control-panel
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
---

## Objective

Bridge the gap between scene summaries and scene drafts by implementing the Beat & Stage Generator. This plan will generate and populate sub-scene narrative structures (the `beats` and `stages` tables in [schema.ts](file:///Users/gibdevlite/dev/novellum/src/lib/server/db/schema.ts#L53)) so authors can outline specific paragraph-level progressions before writing prose.

## Scope

**In scope:**
- Registering a new `vibe-outline.beats` pipeline task key and defining Zod output validation schemas for beats (sequence-specific narrative nodes).
- Establishing AI prompts that take a scene synopsis and decompose it into chronological narrative beats (e.g., "Intro/Hook -> Action -> Reversal -> Outcome").
- Populating the SQL `beats` and `stages` tables during checkpoint materialization.
- A visual sub-navigator in the outline view displaying beats/stages beneath their parent scene.

**Out of scope:**
- Generating scene prose directly from beats (this plan only covers building the beat planning structure; drafting is owned by `vibe-author.scene-draft`).

## Stages

| #   | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Beat Prompts and Schemas](stage-001-beat-schema-prompts/stage.md) | `review` | 1d |
| 002 | [Beat & Stage Database Mapping Service](stage-002-outline-expansion-service/stage.md) | `review` | 2d |
| 003 | [Beat Outline Tree UI Components](stage-003-beat-view-editor/stage.md) | `draft` | 2d |
| 004 | [Verification & Quality Gate Closure](stage-004-verification/stage.md) | `draft` | 1d |

## Quality Gates

- [ ] **lint** — zero ESLint or CSS warnings
- [ ] **typecheck** — zero compilation warnings in `pnpm check`
- [ ] **tests** — unit coverage of beat generation schema parsing
- [ ] **docs_sync** — update [outline-generation.md](../../03-ai/outline-generation.md)

## Risks & Mitigations
- **Risk:** Generation of too many beats could clutter the outline view.
- **Mitigation:** Cap generated beats at 3–5 per scene and provide a collapsible tree view to hide beat-level details by default.
