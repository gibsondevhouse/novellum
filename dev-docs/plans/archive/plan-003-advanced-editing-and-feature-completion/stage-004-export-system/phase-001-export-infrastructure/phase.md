---
title: Export Infrastructure
slug: phase-001-export-infrastructure
phase_number: 1
status: complete
owner: Backend Agent
stage: stage-004-export-system
parts:
  - part-001-export-service-and-markdown
  - part-002-docx-export
estimated_duration: 2d
---

## Goal

Build the export module foundation: an assembler that reads all chapters and scenes for a project in correct order, and the first two output format drivers — Markdown and DOCX.

## Parts

| #   | Part                                                                      | Status  |
| --- | ------------------------------------------------------------------------- | ------- |
| 001 | [Export Service & Markdown](part-001-export-service-and-markdown/part.md) | `draft` |
| 002 | [DOCX Export](part-002-docx-export/part.md)                               | `draft` |

## Entry Criteria

- stage-001 complete: `ChapterRepository` and `SceneRepository` have `getByProject(projectId)` method
- No existing `src/modules/export/` directory

## Exit Criteria

- `src/modules/export/services/export-service.ts` exports `exportProject(projectId, format, options): Promise<Blob | string>`
- Markdown assembler: chapters in `order` sequence, scenes concatenated with `---` separator, front matter includes title, author, genre
- DOCX assembler: uses `docx` package; chapter headings as Heading 1 style; scene separator as horizontal rule
- Both formats available from a "Export" button in Project Hub
- Unit tests cover: chapter ordering, empty project guard, front matter generation
