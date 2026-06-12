# Agent Tool Mutation Boundary

Separate model-callable tools from UI-issued manuscript and canon mutation commands.

## Status

- Plan status: `review`
- Tracker status: activated 2026-06-11
- Scope: implementation complete through Stage 004; pending Reviewer Agent sign-off

## Execution Notes

1. Read `plan.md` first.
2. Expand or adjust any part-level file lists before starting implementation.
3. Follow each part checklist before editing source files.
4. Add dated evidence under the part's `evidence/` directory before moving a part to review.
5. Do not mark reviewer sign-off complete without a real review.

## Review Handoff

- All stages are `review`.
- Quality gates passed: `pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm test`, `pnpm check:tokens`, and targeted Playwright review-gate coverage.
- Reviewer must verify the mutation boundary before this plan can be marked `complete`.

## Canonical Quality Gates

- `pnpm check`
- `pnpm lint`
- `pnpm lint:css`
- `pnpm test`
- `pnpm check:tokens`
- targeted Playwright coverage named by the relevant part

See `MANIFEST.md` for the generated file list.
