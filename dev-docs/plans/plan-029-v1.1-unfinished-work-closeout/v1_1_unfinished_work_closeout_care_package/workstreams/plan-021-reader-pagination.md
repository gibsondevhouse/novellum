# Workstream — plan-021 Reader Pagination

## Objective

Finish reader empty state and deterministic client-side pagination.

This is not API list pagination. Do not implement offset/cursor pagination for reader pages.

## Acceptance Criteria

| Criterion | Required evidence | Confidence |
|---|---|---|
| Empty state exists | Book with no readable content renders a finished empty state | High |
| Deterministic page construction | Same content/settings produce stable page list | High |
| Navigation works | Prev/next/page index behavior works in `BookReaderView.svelte` | High |
| Loader remains clean | `+page.ts` loads data; pagination stays client-side | High |
| Manual verification complete | Empty, short, and long content smoke tested | High |
| No offset/cursor API work | No backend pagination introduced | High |

## Implementation Rules

- Read `strategy-spike.md` first.
- Inspect `src/routes/books/[id]/+page.svelte` and `+page.ts`.
- Keep page construction in `reader-pages.ts` or existing reader engine module.
- Keep navigation behavior in `BookReaderView.svelte`.
- Use Svelte 5 runes only.
- Do not mutate source content as a side effect of pagination.
- Do not introduce backend reader pagination.

## Validation

```md
- [ ] Empty readable content returns/renders no pages cleanly.
- [ ] Empty reader state is visually intentional.
- [ ] Short content renders one page.
- [ ] Long content renders multiple pages.
- [ ] Repeated pagination with identical content/settings is stable.
- [ ] Prev disabled on first page.
- [ ] Next disabled on last page.
- [ ] Page index never shows invalid values.
- [ ] Loader remains data-loading only.
- [ ] No offset/cursor API reader pagination added.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm lint:css`.
- [ ] Run `pnpm check`.
- [ ] Run `pnpm test`.
- [ ] Run affected Playwright/e2e if present.
```

## Severity-Rated Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Backend pagination added | Critical | Keep reader pagination client-side only |
| Unstable page construction | High | Add deterministic repeat test |
| Blank empty state | Medium | Add explicit empty state UI |
| Page index out of bounds | Medium | Clamp page index when page count changes |
