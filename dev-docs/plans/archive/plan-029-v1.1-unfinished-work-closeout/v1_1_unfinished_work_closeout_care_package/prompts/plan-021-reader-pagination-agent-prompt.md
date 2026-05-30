# plan-021 Reader Pagination Agent Prompt

```md
1. Objective
Complete `plan-021-reader-pagination` by finishing deterministic client-side reader pagination and the reader empty state.

2. Problem
The reader must construct pages client-side using the existing page-box/chunking strategy. This is not API pagination. The reader also needs a finished empty state and verified navigation behavior.

3. Files
Primary:
- `strategy-spike.md`
- `src/routes/books/[id]/+page.svelte`
- `src/routes/books/[id]/+page.ts`
- `reader-pages.ts`
- `BookReaderView.svelte`
- affected tests/e2e specs

4. Changes
- Preserve loader responsibility in `+page.ts`.
- Keep pagination logic in the reader engine/page model.
- Finish or harden empty-state rendering.
- Ensure prev/next/page index works.
- Ensure page construction is deterministic for identical content/settings.
- Use Svelte 5 runes only.

5. UI/UX
- Empty state must look intentional, not like missing data.
- Prev/next buttons must have correct disabled states.
- Page index must not display invalid values.
- Reader should not jump or reset unnecessarily.

6. Data
- No DB migration.
- No `/api/db` API pagination.
- No offset/cursor model for reader pages.

7. Errors
- If content cannot be paginated, show a stable empty/error state rather than crashing.
- If expected types/functions are unclear, mark `needs repo verification`.

8. Tests
- Unit test empty content.
- Unit test deterministic repeated pagination.
- Unit test or component test prev/next bounds.
- Run `pnpm lint`.
- Run `pnpm lint:css`.
- Run `pnpm check`.
- Run `pnpm test`.
- Run focused e2e/manual smoke for reader.

9. Criteria
- Empty reader state complete.
- Deterministic client-side pagination complete.
- Navigation correct.
- No backend pagination introduced.
- All quality gates pass.
- Plan tracker updated.

10. Out-of-scope
- Reader redesign.
- New export formats.
- New content model.
- Backend pagination.
- API resource changes.

11. Format
Return:
- Summary of files changed.
- Pagination behavior notes.
- Empty-state behavior notes.
- Tests run and results.
- Manual smoke matrix.
- Any `needs repo verification` items.
```
