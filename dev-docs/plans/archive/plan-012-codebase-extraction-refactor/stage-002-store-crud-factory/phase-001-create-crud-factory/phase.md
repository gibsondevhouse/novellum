---
title: Create CRUD Factory & Migrate Bible Store
slug: phase-001-create-crud-factory
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-002-store-crud-factory
parts:
  - part-001-crud-factory-impl
  - part-002-migrate-bible-crud
estimated_duration: 0.75d
---

## Goal

> Create a generic entity CRUD store factory using Svelte 5 runes and migrate `bible-crud.svelte.ts` to use it.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
|---|------|--------|-------------|---------------|
| 001 | [CRUD Factory Implementation](part-001-crud-factory-impl/part.md) | `review` | Architect | 0.25d |
| 002 | [Migrate Bible CRUD Store](part-002-migrate-bible-crud/part.md) | `review` | Architect | 0.5d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Factory generates reactive state, getters, and CRUD actions
- [ ] `bible-crud.svelte.ts` reduced from ~420 lines to ~60 lines
- [ ] All 6 entity types (Character, Relationship, Location, LoreEntry, PlotThread, TimelineEvent) work
