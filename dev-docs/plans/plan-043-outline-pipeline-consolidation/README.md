# Outline Pipeline Consolidation

Consolidate Novellum outline generation and materialization onto the review-gated checkpoint flow.

## Status

- Plan status: `in-progress`
- Tracker status: activated 2026-06-12
- Scope: implementation closed out; ready for plan-level reviewer evaluation

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
