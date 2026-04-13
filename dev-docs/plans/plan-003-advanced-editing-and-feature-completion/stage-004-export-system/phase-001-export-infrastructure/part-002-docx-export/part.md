---
title: DOCX Export
slug: part-002-docx-export
part_number: 2
status: complete
owner: Backend Agent
phase: phase-001-export-infrastructure
estimated_duration: 1d
---

## Objective

Implement the DOCX driver using the `docx` npm package. The driver receives the assembled chapter/scene data from `assembler.ts` and produces a `.docx` Blob with chapter headings, scene text, and a horizontal rule scene separator.

## Context

- `src/modules/export/services/assembler.ts` (from part-001)
- `src/modules/export/types.ts` — `ExportOptions`
- Install: `pnpm add docx`

## Target Files

| File                                            | Action                                        |
| ----------------------------------------------- | --------------------------------------------- |
| `src/modules/export/services/docx-driver.ts`    | Create                                        |
| `src/modules/export/services/export-service.ts` | Update — add `'docx'` branch to format switch |

## DOCX Structure

- Title page (if `options.titlePage`): `project.title` as large centered heading, genre below
- Chapter headings: Heading 1 style; respects `options.chapterStyle` (`heading` / `chapter_number` / `both`)
- Scene text: Normal paragraph style; `options.fontFamily`, `options.fontSize`, `options.lineSpacing` applied
- Scene separator: Horizontal rule (`HorizontalRule` in `docx` package)
- Install: `pnpm add docx@latest`; confirm major version supports `HorizontalRule` and `Paragraph` APIs

## Acceptance Criteria

- [ ] `docx-driver.ts` exports `buildDocx(assembled: AssembledProject, options: ExportOptions): Promise<Blob>`
- [ ] Output `.docx` opens correctly in LibreOffice Writer and Microsoft Word
- [ ] Chapter headings use Word Heading 1 style
- [ ] Scene text uses Normal style with specified font/size/spacing
- [ ] Title page rendered when `options.titlePage === true`; omitted when `false`
- [ ] Export button in Project Hub includes "DOCX" option producing a `.docx` download
- [ ] `pnpm run check` exits clean
