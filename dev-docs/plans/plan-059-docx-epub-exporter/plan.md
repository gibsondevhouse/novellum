---
title: Robust Document Exporting
slug: plan-059-docx-epub-exporter
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-06-25
last_updated: 2026-06-25
target_completion: 2026-08-19
stages:
  - stage-001-docx-formatter
  - stage-002-epub-packager
  - stage-003-export-dialog-polish
  - stage-004-verification
dependencies:
  - plan-058-beat-stage-generator
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
---

## Objective

Polish Novellum's manuscript export workflow by implementing professional, industry-standard document formatting engine layouts. This plan will expand on plan-039 to generate valid Docx, standard ePub files, and styled PDFs.

## Scope

**In scope:**
- Standard manuscript styling templates for Docx exports (e.g., Shunn industry-standard submission format, 12pt Times New Roman/Courier Prime, double-spaced).
- Creating a packaging service for ePub format generation, including table of contents (TOC), structural metadata, and custom stylesheet support.
- Fully connecting the UI controls in the export dialog to these export templates.
- Integrating cover artwork and metadata (author name, synopsis, genre) into packaged files.

**Out of scope:**
- Direct self-publishing platform integrations (KDP, IngramSpark uploading).
- Complex print-on-demand layout creation (gutter margins, headers/footers for hardcover printing).

## Stages

| #   | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Docx Industry Formatting Template Engine](stage-001-docx-formatter/stage.md) | `draft` | 2d |
| 002 | [ePub Container Packaging System](stage-002-epub-packager/stage.md) | `draft` | 2d |
| 003 | [Export Settings Dialog UI Integration](stage-003-export-dialog-polish/stage.md) | `draft` | 1d |
| 004 | [Verification & Quality Gate Closure](stage-004-verification/stage.md) | `draft` | 1d |

## Quality Gates

- [ ] **lint** — zero ESLint or CSS warnings
- [ ] **typecheck** — zero compilation warnings in `pnpm check`
- [ ] **tests** — unit verification of ePub container structures and TOC files
- [ ] **docs_sync** — update `dev-docs/04-modules/export.md`

## Risks & Mitigations
- **Risk:** ePub validation often fails standard checks (like Epubcheck) due to subtle HTML nesting errors.
- **Mitigation:** Run standard programmatic linting checks on the generated XHTML files within our test suite to guarantee strict compliance.
