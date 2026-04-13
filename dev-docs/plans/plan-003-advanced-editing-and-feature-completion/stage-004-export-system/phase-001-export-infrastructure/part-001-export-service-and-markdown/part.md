---
title: Export Service & Markdown
slug: part-001-export-service-and-markdown
part_number: 1
status: complete
owner: Backend Agent
phase: phase-001-export-infrastructure
estimated_duration: 1d
---

## Objective

Create the `src/modules/export/` module skeleton and implement the first format driver: Markdown. The export service assembles chapters and scenes from Dexie repositories in correct `order` sequence, prepends YAML front matter, and returns a string for file download.

## Context

- `dev-docs/data-model.md` §Chapter, §Scene, §Project
- `src/modules/outliner/services/chapter-repository.ts` — `getByProject()`
- `src/modules/outliner/services/scene-repository.ts` — `getByChapter()`

## Target Files

| File                                             | Action                                              |
| ------------------------------------------------ | --------------------------------------------------- |
| `src/modules/export/services/assembler.ts`       | Create — chapter/scene assembly logic               |
| `src/modules/export/services/markdown-driver.ts` | Create — Markdown formatter                         |
| `src/modules/export/types.ts`                    | Create — `ExportFormat`, `ExportOptions` interfaces |
| `src/modules/export/index.ts`                    | Create — barrel: `export { exportProject }`         |

## Interfaces

```ts
export type ExportFormat = 'markdown' | 'docx' | 'epub';

export interface ExportOptions {
	format: ExportFormat;
	titlePage: boolean;
	chapterStyle: 'heading' | 'chapter_number' | 'both';
	fontFamily: string; // used by DOCX/EPUB only
	fontSize: number; // pt, used by DOCX/EPUB only
	lineSpacing: number; // e.g. 1.5
}

export async function exportProject(
	projectId: string,
	options: ExportOptions,
): Promise<{ filename: string; blob: Blob }>;
```

## Markdown Format

```markdown
---
title: [project.title]
genre: [project.genre]
author: Unknown
---

# [Chapter Title]

[scene1.text]

---

[scene2.text]
```

Scenes within a chapter are separated by `---`. Chapters are separated by `\n\n---\n\n`.

## Acceptance Criteria

- [ ] `assembler.ts` fetches chapters by project in `order` sequence; fetches scenes per chapter in `order` sequence
- [ ] Empty project (no chapters) returns a Blob containing only front matter — does not throw
- [ ] Markdown output includes correct front matter fields
- [ ] Scenes separated by `---`; chapters separated with heading and `---`
- [ ] Export available from Project Hub "Export" button as `.md` file download
- [ ] Vitest: chapter ordering test; empty project test; front matter generation test

## Out of Scope

- DOCX driver (→ part-002)
- EPUB driver (→ phase-002)
- Formatting options UI (→ phase-002)
