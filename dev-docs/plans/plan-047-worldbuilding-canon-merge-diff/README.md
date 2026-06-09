# Worldbuilding Canon Merge Diff

Upgrade worldbuilding proposal acceptance from insert-only projection to reviewable canon diff and merge.

## Status

- Plan status: `draft`
- Tracker status: not activated
- Scope: full draft plan tree scaffolded for future execution

## Execution Notes

1. Read `plan.md` first.
2. Expand or adjust any part-level file lists before starting implementation.
3. Follow each part checklist before editing source files.
4. Add dated evidence under the part's `evidence/` directory before moving a part to review.
5. Do not mark reviewer sign-off complete without a real review.

## Canonical Quality Gates

- `pnpm check`
- `pnpm lint`
- `pnpm lint:css`
- `pnpm test`
- `pnpm check:tokens`
- targeted Playwright coverage named by the relevant part

See `MANIFEST.md` for the generated file list.
