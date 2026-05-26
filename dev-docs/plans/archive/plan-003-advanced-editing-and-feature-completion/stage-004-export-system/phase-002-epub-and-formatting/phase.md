---
title: EPUB & Formatting
slug: phase-002-epub-and-formatting
phase_number: 2
status: complete
owner: Backend Agent
stage: stage-004-export-system
parts:
  - part-001-epub-export
  - part-002-formatting-controls-ui
estimated_duration: 2d
---

## Goal

Add EPUB export as a third format driver and build the formatting controls UI that lets users configure title page, chapter heading style, font, and spacing — persisted per project in a new `ExportSettings` Dexie table.

## Parts

| #   | Part                                                              | Status  |
| --- | ----------------------------------------------------------------- | ------- |
| 001 | [EPUB Export](part-001-epub-export/part.md)                       | `draft` |
| 002 | [Formatting Controls UI](part-002-formatting-controls-ui/part.md) | `draft` |

## Entry Criteria

- phase-001 complete: export service base established; Markdown and DOCX working
- `epub-gen-memory` evaluated and installed (`pnpm add epub-gen-memory`)

## Exit Criteria

- EPUB assembler produces a valid `.epub` file readable in Calibre and Apple Books
- EPUB includes: NCX table of contents, cover placeholder, one HTML file per chapter
- `ExportSettings` Dexie table exists: `{ id, projectId, titlePage, chapterStyle, fontFamily, fontSize, lineSpacing }`
- Formatting controls UI: accessible from Export modal; settings load from Dexie, save on change
- All three formats respect active `ExportSettings` when generating output
