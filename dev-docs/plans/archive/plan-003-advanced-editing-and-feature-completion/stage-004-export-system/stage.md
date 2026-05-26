---
title: Export System
slug: stage-004-export-system
stage_number: 4
status: complete
owner: Backend Agent
plan: plan-003-advanced-editing-and-feature-completion
phases:
  - phase-001-export-infrastructure
  - phase-002-epub-and-formatting
estimated_duration: 4d
---

## Goal

Build a complete, production-ready export pipeline that assembles a manuscript from Dexie data and converts it to Markdown, DOCX, and EPUB formats, with configurable formatting controls for title page, chapter headings, font selection, and line spacing.

## Phases

| #   | Phase                                                             | Status  |
| --- | ----------------------------------------------------------------- | ------- |
| 001 | [Export Infrastructure](phase-001-export-infrastructure/phase.md) | `draft` |
| 002 | [EPUB & Formatting](phase-002-epub-and-formatting/phase.md)       | `draft` |

## Entry Criteria

- stage-001 complete: all chapter/scene data accessible through repositories
- All Scene entities have populated `text` fields (written or imported)
- No existing `src/modules/export/` — this stage creates it from scratch

## Exit Criteria

- User can export a project to `.md`, `.docx`, and `.epub` from the Project Hub
- Each format produces a correctly structured file with all chapters in order
- User can configure: title page on/off, chapter heading style, font family, font size, line spacing
- Export runs entirely client-side (no server round-trip for Markdown/DOCX; EPUB may use a service worker or Node process in Tauri context)
- `pnpm run test` covers the assembler (chapter ordering, scene concatenation, front matter generation)

## Technical Notes

- Export module: `src/modules/export/` — exposes `exportProject(projectId, format, options)` via `index.ts`
- Markdown: pure string assembly, save via Tauri fs API
- DOCX: use `docx` npm package (`pnpm add docx`)
- EPUB: use `epub-gen-memory` npm package (`pnpm add epub-gen-memory`) — runs in Node/Tauri context
- Formatting options interface lives in `src/modules/export/types.ts`; persisted to a `ExportSettings` Dexie table (new version bump)
- No XSS risk: scene text is treated as plain text during assembly, not evaluated as HTML
