---
title: Interactive Story Bible Workspace
slug: plan-054-story-bible-workspace
version: 1.0.0
status: in-progress
owner: Planner Agent
created: 2026-06-25
last_updated: 2026-06-25
target_completion: 2026-07-15
stages:
  - stage-001-wiki-database-queries
  - stage-002-dossier-crud-forms
  - stage-003-navigation-hyperlinks
  - stage-004-quality-closure
dependencies:
  - plan-053-worldbuilding-outline-review-flow-closure
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
---

## Objective

Replace the existing [StoryBiblePlaceholder.svelte](file:///Users/gibdevlite/dev/novellum/src/modules/story-bible/components/StoryBiblePlaceholder.svelte) with a complete, production-grade interactive wiki workspace. This will enable authors to view, search, link, and manually manage characters, locations, factions, glossary terms, themes, and lore entries inside a unified dashboard.

## Scope

**In scope:**
- Consolidating reading queries for all worldbuilding tables (`characters`, `locations`, `factions`, `themes`, `glossary_terms`, `lore_entries`, `timeline_events`, `character_relationships`) into the Story Bible domain repository.
- A central navigation sidebar/filter panel to browse lore items by kind, tag, and search query.
- Full CRUD UI forms for manual entry of characters, factions, landmarks, realms, lore entries, and glossary terms.
- Hyperlinking system in dossier descriptions (e.g., parsing `@character:character-id` or `#location-id` references to render interactive links to detail views).

**Out of scope:**
- AI worldbuilding proposal scanning (already implemented under plan-037/plan-053).
- Inline scene-generation mechanics (handled by `vibe-author`).

## Stages

| #   | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Database Queries & Repositories](stage-001-wiki-database-queries/stage.md) | `draft` | 1d |
| 002 | [Dossier CRUD Forms & Grid](stage-002-dossier-crud-forms/stage.md) | `draft` | 2d |
| 003 | [Wiki Hyperlinking & Cross-References](stage-003-navigation-hyperlinks/stage.md) | `draft` | 1d |
| 004 | [Verification & Quality Gate Closure](stage-004-quality-closure/stage.md) | `draft` | 1d |

## Quality Gates

- [ ] **lint** — zero ESLint or CSS warnings
- [ ] **typecheck** — zero compilation warnings in `pnpm check`
- [ ] **tests** — unit coverage of the wiki query service and routing
- [ ] **docs_sync** — update `dev-docs/04-modules/story-bible.md`

## Risks & Mitigations
- **Risk:** High database latency when rendering hundreds of cross-linked entities.
- **Mitigation:** Implement paginated search, virtualized scrolling for lists, and memoized name-indexing in Svelte stores.
