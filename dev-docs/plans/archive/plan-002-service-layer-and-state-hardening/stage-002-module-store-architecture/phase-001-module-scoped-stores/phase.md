---
title: Module-Scoped Stores
slug: phase-001-module-scoped-stores
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-002-module-store-architecture
parts:
  - part-001-editor-module-store
  - part-002-bible-module-store
  - part-003-outliner-module-store
estimated_duration: 2d
---

## Goal

For each of the three primary domain modules (Editor, Story Bible, Outliner), create a canonical Svelte 5 rune store at `src/modules/<domain>/stores/<domain>.svelte.ts`. Move all reactive state that currently lives in route files into these stores.

## Parts

| #   | Part                                                            | Status  |
| --- | --------------------------------------------------------------- | ------- |
| 001 | [Editor Module Store](part-001-editor-module-store/part.md)     | `draft` |
| 002 | [Story Bible Module Store](part-002-bible-module-store/part.md) | `draft` |
| 003 | [Outliner Module Store](part-003-outliner-module-store/part.md) | `draft` |

## Entry Criteria

- `stage-001-dexie-schema-and-repository-layer` is `complete`
- Path 1 route files identified for state extraction

## Exit Criteria

- Three store files created; each uses only `$state` / `$derived` runes
- Route files import from store files; no raw `let` reactive state in route files (except loop variables and local UI flags)
- `pnpm run check` exits clean
