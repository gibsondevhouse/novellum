---
part: part-001-export-service-and-markdown
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `src/modules/outliner/services/chapter-repository.ts` — confirm `getByProject()` returns chapters sorted by `order`
- [ ] Read `src/modules/outliner/services/scene-repository.ts` — confirm `getByChapter()` returns scenes sorted by `order`
- [ ] Read `dev-docs/modular-boundaries.md` — confirm export module placement at `src/modules/export/`
- [ ] Confirm Tauri file-save API: `@tauri-apps/api/dialog` `save()` + `@tauri-apps/api/fs` `writeFile()` — or use browser `<a download>` approach

## Post-Implementation

- [ ] `assembler.ts` produces chapters in correct order; scenes in correct order within chapters
- [ ] Empty project returns front-matter-only Blob; no error thrown
- [ ] Markdown format matches spec (front matter, chapter headings, scene `---` separators)
- [ ] Export button in Project Hub triggers download of `.md` file
- [ ] Vitest tests pass for all 3 test cases (attach evidence)
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
