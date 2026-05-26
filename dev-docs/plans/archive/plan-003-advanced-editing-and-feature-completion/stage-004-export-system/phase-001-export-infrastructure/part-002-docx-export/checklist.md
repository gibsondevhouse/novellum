---
part: part-002-docx-export
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Install `docx` package: `pnpm add docx`; confirm it is the latest stable major version
- [ ] Read `docx` package README — confirm `HorizontalRule`, `Paragraph`, `HeadingLevel`, `AlignmentType` API
- [ ] Read `assembler.ts` from part-001 — confirm `AssembledProject` data shape

## Post-Implementation

- [ ] `docx-driver.ts` produces a valid Blob
- [ ] Exported file opens in LibreOffice / Word with correct heading styles and scene separators
- [ ] Title page present when `titlePage: true`; absent when `false`
- [ ] Font, size, and spacing from `ExportOptions` applied to Normal paragraphs
- [ ] DOCX option in Project Hub export UI triggers download of `.docx`
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
- [ ] Attach sample `.docx` output to `evidence/` folder
