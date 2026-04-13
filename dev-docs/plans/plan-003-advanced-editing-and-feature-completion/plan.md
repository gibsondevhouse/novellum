---
title: Advanced Editing & Feature Completion
slug: plan-003-advanced-editing-and-feature-completion
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-12
last_updated: 2026-04-12
target_completion: 2026-07-11
path: Path 3
stages:
  - stage-001-entity-crud-ui
  - stage-002-phase-2-ai-agents
  - stage-003-editing-layer-and-style-system
  - stage-004-export-system
  - stage-005-drafting-editor-integration
dependencies:
  - plan-002-service-layer-and-state-hardening
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
  - modular_boundaries
---

## Objective

Path 2 delivered a complete data and AI service layer with full Dexie schema, typed repositories, module stores, and the Task Resolver → Context Engine → Prompt Builder → Model Router pipeline. Path 3 surfaces all of that infrastructure in real UI and connects the remaining deferred agents to complete the Phase 2 roadmap, then drives forward into Phase 3.

Path 3 delivers in five focused stages:

1. **Entity CRUD UI** — full create/read/update/delete views for every entity in the data model (Project Hub, Story Bible, Outliner), giving users a real working application for the first time
2. **Phase 2 AI Agents** — ContinuityAgent and SummaryAgent implemented through the pipeline, plus the Consistency Engine UI to surface detected issues
3. **Editing Layer & Style System** — multi-pass EditAgent (developmental / line / proofread modes), StyleAgent with style presets, and RewriteAgent with multi-option selection UI
4. **Export System** — Markdown (polish), DOCX, and EPUB formats with configurable formatting controls
5. **Drafting Editor Integration** — ONLYOFFICE Document Server embedding for chapter-based prose writing, autosave, and version history

On completion of this path, Novellum satisfies all Phase 1 and Phase 2 roadmap success criteria and is in shipping condition for an initial release.

## Scope

**In scope:**

- Project Hub: project list, create, edit metadata, delete
- Story Bible: full CRUD for Character, CharacterRelationship, Location, LoreEntry, PlotThread, TimelineEvent
- Outliner: chapter/scene create/edit/delete/reorder; beat tracking per scene
- ContinuityAgent: timeline conflict detection, character inconsistency detection, lore violation detection
- SummaryAgent: scene summaries, chapter summaries, outline backfill
- Consistency Engine UI: issue panel, issue detail, resolution workflow
- EditAgent modes: developmental, line editing, proofreading via the existing pipeline
- Inline AI suggestion UI (accept / reject / request rewrite flow)
- StyleAgent: style analysis, tone presets, violation highlighting
- RewriteAgent: multi-option rewrite presentation UI
- Export service: Markdown, DOCX (docx.js), EPUB (epub-gen or equivalent)
- Formatting controls: title page, chapter headings, font/spacing settings
- ONLYOFFICE Document Server: local setup in Tauri context, chapter iframe binding
- Autosave: debounced write-back to Dexie on scene text change
- Version history: snapshot table in Dexie; snapshot viewer UI

**Out of scope:**

- Cloud sync / cross-device (Phase 5)
- Collaboration features (Phase 5)
- Multi-book / shared universes (Phase 5)
- Advanced analytics / pacing analysis (Phase 4)
- Plugin / extension system (Phase 4)
- Chained multi-agent workflows (Phase 4)

## Stage Summary

| #   | Stage                                                                             | Description                                                              | Est. |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---- |
| 001 | [Entity CRUD UI](stage-001-entity-crud-ui/stage.md)                               | Project Hub, Story Bible, and Outliner UI built on plan-002 repositories | 8d   |
| 002 | [Phase 2 AI Agents](stage-002-phase-2-ai-agents/stage.md)                         | ContinuityAgent, SummaryAgent, Consistency Engine UI                     | 6d   |
| 003 | [Editing Layer & Style System](stage-003-editing-layer-and-style-system/stage.md) | EditAgent modes, inline suggestions, StyleAgent, RewriteAgent            | 6d   |
| 004 | [Export System](stage-004-export-system/stage.md)                                 | Markdown, DOCX, EPUB export with formatting controls                     | 4d   |
| 005 | [Drafting Editor Integration](stage-005-drafting-editor-integration/stage.md)     | ONLYOFFICE embedding, autosave, version history                          | 4d   |

**Total estimated duration:** ~28d

## Quality Gates

All parts must pass before their parent phase is marked `complete`:

| Gate                 | Tool / Check               | Pass Condition                                                     |
| -------------------- | -------------------------- | ------------------------------------------------------------------ |
| `lint`               | `pnpm run lint`            | Zero ESLint errors                                                 |
| `typecheck`          | `pnpm run check`           | Zero TypeScript errors                                             |
| `tests`              | `pnpm run test`            | All Vitest tests pass; ≥80% line coverage for new services         |
| `docs_sync`          | Manual review              | All new modules have an entry in `dev-docs/modules/`               |
| `modular_boundaries` | `eslint-plugin-boundaries` | Zero boundary violations; all new files within file-length budgets |
