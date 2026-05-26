---
title: Export Quality and Manuscript Compilation
slug: stage-001-export-quality
stage_number: 1
status: complete
owner: Backend Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-types-and-profiles
  - phase-002-manuscript-assembler
  - phase-003-driver-upgrades
  - phase-004-export-modal-surface
estimated_duration: 7d
risk_level: high
---

## Goal

Promote export from a utility into a dependable manuscript compilation surface. Replace the current JSON-only `ExportModal` with a real manuscript compiler: four export profiles, per-project metadata (title, author, subtitle, synopsis, copyright, dedication), proper Markdown/DOCX/EPUB drivers with heading hierarchy and metadata frontmatter, and a UI surface that separates manuscript export from backup.

> **Absorbs.** plan-016 stage-007 phase-003 (Export Surface cosmetic refit) transferred here on 2026-04-28.

## Context (already in tree — do not duplicate)

- `src/modules/export/types.ts` — defines only `ExportFormat`, `ExportOptions`, `AssembledChapter`, `AssembledProject`. No profile, metadata, or compile-options types yet.
- `src/modules/export/services/assembler.ts` — `assembleProject(projectId)` returns a basic `AssembledProject` (title, genre, chapters). Already reads from SQLite via `project-repository`, `chapter-repository`, `scene-repository`. No front/back matter or metadata.
- `src/modules/export/services/markdown-driver.ts` — `buildMarkdown(assembled, options)`. Hardcodes `author: Unknown` in YAML frontmatter. No profile awareness.
- `src/modules/export/services/docx-driver.ts` — `buildDocx(assembled, options)`. Basic structure; no document styles, no paragraph indentation, no title page with real metadata.
- `src/modules/export/services/epub-driver.ts` — `buildEpub(assembled, options)`. Uses `author: 'Unknown'`, no HTML escaping of scene content (XSS risk in EPUB readers), no OPF metadata.
- `src/modules/export/components/ExportModal.svelte` — currently only builds a portability JSON snapshot (`.novellum.json`) via `buildPortabilitySnapshot`. Does **not** trigger Markdown/DOCX/EPUB export at all. This is the surface that needs to become the manuscript export UI.
- `src/modules/export/components/ImportBackupDialog.svelte` — import/restore dialog, currently lives in this module; flagged for eventual move to Settings → Backup & Restore (stage-004).
- `src/lib/db/domain-types.ts` — `Project` interface has `title`, `genre`, `synopsis`, `logline`, `systemPrompt`. No `author`, `subtitle`, `copyright`, or `dedication` fields.
- `tests/export/assembler.test.ts` — tests `buildMarkdown` with hardcoded `author: Unknown` assertion (will need updating). No assembler service tests yet.
- `src/modules/export/services/__tests__/` — portability/zip/snapshot tests only; no manuscript-driver or assembler tests.
- `src/lib/components/ui/` — existing primitives: `PrimaryButton`, `GhostButton`, `SecondaryButton`, `SurfaceCard`, `EmptyStatePanel`. No new primitives needed.

## Entry Criteria

- `assembleProject` in `src/modules/export/services/assembler.ts` reads manuscript data from SQLite repos (already true).
- `src/lib/db/domain-types.ts` is importable and typechecks clean (already true).
- `pnpm run check` and `pnpm run lint` pass on the current tree (verify before starting).

## Exit Criteria

- `src/modules/export/types.ts` exports: `ManuscriptProfileId` (`'standard_manuscript' | 'reader_copy' | 'ebook_draft' | 'plain_text_archive'`), `ManuscriptMetadata` (`title`, `author`, `subtitle`, `synopsis`, `copyright`, `dedication` — all optional strings), `ManuscriptCompileOptions` (`profileId`, `metadata`, `selectedChapterIds?: string[]`, `includeFrontMatter`, `includeBackMatter`), `AssembledScene` (`id`, `title`, `content`, `wordCount`, `order`), enriched `AssembledChapter` (adds `scenes: AssembledScene[]`), `AssembledManuscript` (`projectId`, `metadata`, `profileId`, `chapters`, `totalWordCount`, `compiledAt`). Legacy `AssembledProject` and `ExportOptions` remain exported for backward compatibility.
- `src/modules/export/services/manuscript-profiles.ts` defines and exports the four profiles as typed constants with their display names, recommended options, and include-flags for front/back matter.
- `src/modules/export/services/manuscript-assembler.ts` — `assembleManuscript(projectId, options: ManuscriptCompileOptions): Promise<AssembledManuscript>` — fetches chapters/scenes in `order` asc, respects `selectedChapterIds` filter when provided, computes per-scene `wordCount` via word-count helper, sums `totalWordCount`, stamps `compiledAt`.
- `markdown-driver.ts` accepts `AssembledManuscript` (new overload or replacement): YAML frontmatter uses real `metadata.author` (fallback `'Unknown'` only if `metadata.author` is empty), `metadata.title`, `metadata.subtitle`. Chapter headings are `##`, scene breaks are `---`. If `includeFrontMatter` is true, prepends a title-page block.
- `docx-driver.ts` accepts `AssembledManuscript`: uses `HeadingLevel.TITLE` for title, `HEADING_1` for chapters, `HEADING_2` for scene titles, paragraph indentation via `Word2013Style`, page break between chapters. `metadata.author` and `metadata.copyright` appear on the title page when `includeFrontMatter` is true.
- `epub-driver.ts` accepts `AssembledManuscript`: escapes `<`, `>`, `&`, `"` in scene HTML (via a dedicated `htmlEscape` utility); populates OPF `author`, `title`, `description` from `metadata`; TOC generated from chapter titles; `author: 'Unknown'` fallback replaced.
- `ExportModal.svelte` is refactored to be the manuscript export surface: renders a profile selector (four radio cards), a metadata form (title, author, subtitle, synopsis — pre-filled from project), a format selector (Markdown / DOCX / EPUB), an optional chapter-filter multi-select, a "Export" primary button, and an inline progress/error state. Uses only existing `src/lib/components/ui/*` primitives. The JSON portability action is demoted to a small secondary link ("Export raw backup…") or removed (decision logged in impl.log.md).
- Tests pass (new or updated):
  - `tests/export/manuscript-assembler.test.ts` — covers: chapters assembled in order, `selectedChapterIds` filter, empty project, `totalWordCount` sum, `compiledAt` is an ISO timestamp.
  - `tests/export/markdown-driver.test.ts` (replace existing `assembler.test.ts` assertions) — covers: author from metadata, `author: Unknown` fallback, frontmatter fields, `##` chapter heading, `---` scene break, front matter block when flag is true.
  - `tests/export/docx-driver.test.ts` — covers: Blob is returned, title page paragraph exists when `includeFrontMatter: true`, chapter heading level is `HEADING_1`.
  - `tests/export/epub-driver.test.ts` — covers: Blob is returned, `<script>` tags in scene content are escaped (no raw `<script>` in output), author field set from metadata.
- `pnpm run test` passes including all new tests.
- `pnpm run check` clean (zero TypeScript errors).
- `pnpm run lint` clean (`eslint-plugin-boundaries` passes; no module leakage).
- Existing portability/zip/snapshot tests in `src/modules/export/services/__tests__/` still pass.

## Phases

### Phase-001 — Types and profiles

**Goal:** Establish the full type surface for manuscript compilation — profiles, metadata, compile options, assembled shapes — before any implementation logic is written.

**Files:**
- `src/modules/export/types.ts` — add new types; keep legacy exports.
- `src/modules/export/services/manuscript-profiles.ts` — new file.

**Implementation:**

Add to `src/modules/export/types.ts` (append after existing exports — do not remove `AssembledProject` or `ExportOptions`):

```ts
export type ManuscriptProfileId =
  | 'standard_manuscript'
  | 'reader_copy'
  | 'ebook_draft'
  | 'plain_text_archive';

export interface ManuscriptMetadata {
  title?: string;
  author?: string;
  subtitle?: string;
  synopsis?: string;
  copyright?: string;
  dedication?: string;
}

export interface ManuscriptCompileOptions {
  profileId: ManuscriptProfileId;
  metadata: ManuscriptMetadata;
  selectedChapterIds?: string[];
  includeFrontMatter: boolean;
  includeBackMatter: boolean;
}

export interface AssembledScene {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
}

export interface AssembledManuscriptChapter {
  id: string;
  title: string;
  order: number;
  scenes: AssembledScene[];
}

export interface AssembledManuscript {
  projectId: string;
  metadata: ManuscriptMetadata;
  profileId: ManuscriptProfileId;
  chapters: AssembledManuscriptChapter[];
  totalWordCount: number;
  compiledAt: string; // ISO 8601
}
```

Create `src/modules/export/services/manuscript-profiles.ts`:

```ts
import type { ManuscriptProfileId, ManuscriptCompileOptions } from '../types.js';

export interface ManuscriptProfile {
  id: ManuscriptProfileId;
  label: string;
  description: string;
  defaults: Pick<ManuscriptCompileOptions, 'includeFrontMatter' | 'includeBackMatter'>;
}

export const MANUSCRIPT_PROFILES: Record<ManuscriptProfileId, ManuscriptProfile> = {
  standard_manuscript: { id: 'standard_manuscript', label: 'Standard Manuscript', description: 'Formatted for submission — title page, double-spaced, page numbers.', defaults: { includeFrontMatter: true, includeBackMatter: false } },
  reader_copy: { id: 'reader_copy', label: 'Reader Copy', description: 'Clean reading copy without submission formatting.', defaults: { includeFrontMatter: true, includeBackMatter: true } },
  ebook_draft: { id: 'ebook_draft', label: 'Ebook Draft', description: 'EPUB-optimized with metadata and TOC.', defaults: { includeFrontMatter: true, includeBackMatter: true } },
  plain_text_archive: { id: 'plain_text_archive', label: 'Plain Text Archive', description: 'Minimal Markdown with no formatting, suitable for archival.', defaults: { includeFrontMatter: false, includeBackMatter: false } },
};

export function getProfile(id: ManuscriptProfileId): ManuscriptProfile {
  return MANUSCRIPT_PROFILES[id];
}
```

**Acceptance checklist:**
- [ ] `ManuscriptProfileId`, `ManuscriptMetadata`, `ManuscriptCompileOptions`, `AssembledScene`, `AssembledManuscriptChapter`, `AssembledManuscript` are exported from `src/modules/export/types.ts`.
- [ ] Legacy `AssembledProject`, `ExportOptions`, `ExportFormat` still exported (no breaking changes).
- [ ] `MANUSCRIPT_PROFILES` record has exactly four entries matching `ManuscriptProfileId`.
- [ ] `pnpm run check` clean after changes.

---

### Phase-002 — Manuscript assembler

**Goal:** Build `manuscript-assembler.ts` — the service that reads project data from SQLite repos and returns a fully-formed `AssembledManuscript` with correct chapter/scene ordering, per-scene word counts, and chapter filtering.

**Files:**
- `src/modules/export/services/manuscript-assembler.ts` — new file.
- `tests/export/manuscript-assembler.test.ts` — new test file.

**Implementation:**

`manuscript-assembler.ts`:
- Import `getProjectById` from `$modules/project/services/project-repository.js`.
- Import `getChaptersByProjectId` from `$modules/project/services/chapter-repository.js`.
- Import `getScenesByChapterId` from `$modules/editor/services/scene-repository.js`.
- `countWords(html: string): number` — strips HTML tags, splits on whitespace, returns count.
- `assembleManuscript(projectId: string, options: ManuscriptCompileOptions): Promise<AssembledManuscript>`:
  1. Fetch project; throw `Error('Project not found: ${projectId}')` if null.
  2. Fetch chapters (already sorted by `order` from repo).
  3. If `options.selectedChapterIds` is non-empty, filter chapters to that subset.
  4. For each chapter: fetch scenes (sorted by `order`), map to `AssembledScene` (set `wordCount` using `countWords`).
  5. Compute `totalWordCount` by summing all scene word counts.
  6. Return `AssembledManuscript` with `compiledAt: new Date().toISOString()`.
  7. Metadata is taken as-is from `options.metadata` — the assembler does not read project fields; the caller is responsible for pre-populating metadata from the project if desired.

`tests/export/manuscript-assembler.test.ts` — mock the three repo imports using `vi.mock`. Tests:
- `assembleManuscript` returns chapters in order.
- When `selectedChapterIds` is provided, only matching chapters are included.
- Empty chapter array returns `totalWordCount: 0`.
- `totalWordCount` equals the sum of all scene word counts.
- `compiledAt` is a valid ISO 8601 string.
- Throws when project not found.

**Acceptance checklist:**
- [ ] `assembleManuscript` is exported from `manuscript-assembler.ts` with correct signature.
- [ ] `selectedChapterIds` filter works correctly.
- [ ] `totalWordCount` is accurate.
- [ ] All `tests/export/manuscript-assembler.test.ts` tests pass.
- [ ] `pnpm run check` clean; no `any` types added.

---

### Phase-003 — Driver upgrades

**Goal:** Upgrade all three drivers to accept `AssembledManuscript`, use real metadata (no hardcoded `'Unknown'`), produce proper heading structure, and escape HTML in EPUB output.

**Files:**
- `src/modules/export/services/markdown-driver.ts` — upgrade signature + logic.
- `src/modules/export/services/docx-driver.ts` — upgrade signature + logic.
- `src/modules/export/services/epub-driver.ts` — upgrade signature + logic + add HTML escape.
- `tests/export/markdown-driver.test.ts` — new; replaces the `assembler.test.ts` assertions about `buildMarkdown`.
- `tests/export/docx-driver.test.ts` — new.
- `tests/export/epub-driver.test.ts` — new.
- `tests/export/assembler.test.ts` — update assertions that check for `'author: Unknown'` (these will now expect the passed metadata value).

**Implementation:**

**`markdown-driver.ts`** — change signature to `buildMarkdown(manuscript: AssembledManuscript): string`:
- YAML frontmatter: `title`, `author` (fallback `'Unknown'` only when `manuscript.metadata.author` is empty/undefined), `subtitle` (omit line if empty), `synopsis` (omit if empty).
- If `manuscript.options.includeFrontMatter` — add a `# {title}` / `*{author}*` block after frontmatter.
- Chapter heading: `## {chapter.title}`.
- Scene heading: `### {scene.title}` (only if non-empty title).
- Scene break: `\n\n---\n\n`.
- Keep `buildMarkdown` as the exported name (no renaming).

**`docx-driver.ts`** — change signature to `buildDocx(manuscript: AssembledManuscript): Promise<Blob>`:
- Title page (when `manuscript.options.includeFrontMatter`): title in `HeadingLevel.TITLE`, author in centered paragraph, copyright on a third line, then page break.
- Chapter heading: `HeadingLevel.HEADING_1`.
- Scene title: `HeadingLevel.HEADING_2` (only if non-empty).
- Body paragraphs: first-line indent 720 twips (0.5"), 240 line spacing (double-space).
- Scene break: `ThematicBreak` paragraph.
- Remove hard-coded font/size from `ExportOptions` dependency; derive from profile if needed (use sensible defaults: `Times New Roman`, 24pt).
- Keep `buildDocx` as exported name.

**`epub-driver.ts`** — change signature to `buildEpub(manuscript: AssembledManuscript): Promise<Blob>`:
- Add `htmlEscape(s: string): string` helper (private, not exported): replaces `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`.
- Apply `htmlEscape` to every scene content string before wrapping in `<p>` tags.
- OPF metadata: `author` from `manuscript.metadata.author` (fallback `'Unknown'`), `title` from `manuscript.metadata.title`, `description` from `manuscript.metadata.synopsis`.
- Title page chapter when `manuscript.options.includeFrontMatter`: `beforeToc: true`, `excludeFromToc: true`.
- Keep `buildEpub` as exported name.

**Acceptance checklist:**
- [ ] `buildMarkdown` uses `metadata.author`; `'Unknown'` only as explicit fallback.
- [ ] `buildMarkdown` uses `##` for chapters, `###` for scene titles.
- [ ] `buildDocx` includes title page with real author and copyright when `includeFrontMatter`.
- [ ] `buildEpub` applies `htmlEscape` to scene content — `<script>` tags do not survive in output.
- [ ] `buildEpub` sets OPF author and title from metadata.
- [ ] All three driver test files pass with `pnpm run test`.
- [ ] Existing portability/zip/snapshot tests in `src/modules/export/services/__tests__/` still pass.
- [ ] `pnpm run check` clean.

---

### Phase-004 — Export modal surface

**Goal:** Refactor `ExportModal.svelte` from a backup-JSON portal into a full manuscript export surface: profile selector, metadata form, format chooser, export trigger, and inline progress/error feedback.

**Files:**
- `src/modules/export/components/ExportModal.svelte` — full refactor.
- `src/modules/export/index.ts` — ensure `ExportModal` is still exported; remove any backup-only exports that are no longer relevant.

**Implementation:**

`ExportModal.svelte` props: `projectId: string`, `projectTitle: string`, `projectAuthor?: string`, `open: boolean`, `onClose: () => void`.

Internal state:
- `selectedProfile: ManuscriptProfileId` — default `'standard_manuscript'`.
- `format: 'markdown' | 'docx' | 'epub'` — default `'markdown'`.
- `metadata: ManuscriptMetadata` — pre-populated from `projectTitle` / `projectAuthor` props on `$effect` when `open` changes to `true`.
- `exporting: boolean`, `error: string | null`, `success: boolean`.

Layout (no bespoke styling — use existing design tokens and `src/lib/components/ui/*` only):
1. **Profile section** — four labeled radio cards (one per `ManuscriptProfileId`) using `SurfaceCard variant="flat"`. Show profile `label` + `description`.
2. **Metadata section** — four text inputs: Title, Author, Subtitle, Synopsis. Pre-filled from props; user-editable.
3. **Format section** — three radio buttons: Markdown, Word (.docx), EPUB.
4. **Actions row** — `PrimaryButton` "Export" (calls `handleExport`), `GhostButton` "Cancel" (calls `onClose`).
5. **Progress/error area** — shows `exporting` spinner text, inline `error` message (role="alert"), or a "Download ready" success message.

`handleExport` flow:
1. Set `exporting = true`, `error = null`, `success = false`.
2. Call `assembleManuscript(projectId, { profileId: selectedProfile, metadata, includeFrontMatter: getProfile(selectedProfile).defaults.includeFrontMatter, includeBackMatter: getProfile(selectedProfile).defaults.includeBackMatter })`.
3. Based on `format`, call the appropriate driver.
4. Create a `Blob` URL and programmatically click a hidden `<a download>` element to trigger the browser download.
5. On success: `success = true`. On error: `error = e.message`.
6. `exporting = false`.

The existing JSON portability action (`buildPortabilitySnapshot`) is **removed** from this modal. Add a comment: `// Backup export moved to Settings → Data (plan-018 stage-004).`

**Acceptance checklist:**
- [ ] `ExportModal` renders profile selector with four profile cards.
- [ ] Metadata form fields pre-fill from `projectTitle` / `projectAuthor` props when modal opens.
- [ ] Format selector shows Markdown, DOCX, EPUB options.
- [ ] Clicking Export calls `assembleManuscript` then the correct driver.
- [ ] Error state displayed inline with `role="alert"`.
- [ ] `exporting` spinner shown while async operations run.
- [ ] No `buildPortabilitySnapshot` import in the refactored file.
- [ ] No new CSS primitives introduced — all styling via existing tokens/components.
- [ ] `pnpm run check` clean; `pnpm run lint` clean.
- [ ] `pnpm run test` passes (all new export tests + no regressions).

## Out of Scope

- Export validation service (`export-validation.ts`) — deferred; surface the raw assembler errors as inline text for now.
- `ImportBackupDialog.svelte` relocation to Settings — owned by stage-004.
- `.novellum.zip` backup format changes — owned by plan-017.
- EPUB EPUBCheck automated validation — deferred to a hardening pass.
- Selected-chapter multi-select UI in the modal — the `selectedChapterIds` filter is wired in the assembler but the modal exports all chapters; chapter filtering UI is a future enhancement.
- Back matter (end-notes, author bio) — types are defined but no UI surface in this stage.
