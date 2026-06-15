# Agent Runtime Stack Hardening

Infrastructure plan for making Novellum's agent runtime durable, observable, recoverable, and production-ready while preserving the local-first stack.

## Status

- Plan status: `in-progress`
- Tracker status: active as of 2026-06-14
- Scope: Stage 001 runtime inventory and contract is underway

## Execution Notes

1. Read `plan.md` first.
2. Confirm the mutation-boundary and checkpoint-contract plans are stable before implementing queue or worker behavior.
3. Keep all new runtime state local to SQLite unless a future plan explicitly changes the architecture.
4. Preserve author-in-the-loop review gates for every manuscript or canon mutation.
5. Add dated evidence under each part's `evidence/` directory before moving that part to review.
6. Do not mark reviewer sign-off complete without a real review.

## Canonical Quality Gates

- `pnpm check`
- `pnpm lint`
- `pnpm lint:css`
- `pnpm test`
- `pnpm check:tokens`
- targeted Playwright coverage for Nova, outline, author draft, worldbuilding, and recovery flows
- migration tests from empty and existing databases

See `MANIFEST.md` for the generated file list.
