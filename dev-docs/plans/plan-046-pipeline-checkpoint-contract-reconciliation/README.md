# Pipeline Checkpoint Contract Reconciliation

Reconcile route, schema, docs, and e2e expectations for all pipeline checkpoint families.

## Status

- Plan status: `review`
- Tracker status: active; implementation closed out, pending plan-level reviewer
- Scope: route/schema/test/docs reconciliation complete with full quality-gate evidence

## Execution Notes

1. Read `plan.md` first.
2. Expand or adjust any part-level file lists before starting implementation.
3. Follow each part checklist before editing source files.
4. Add dated evidence under the part's `evidence/` directory before moving a part to implementation complete.
5. Defer Reviewer Agent evaluation until full plan implementation closeout.

## Canonical Quality Gates

- `pnpm check`
- `pnpm lint`
- `pnpm lint:css`
- `pnpm test`
- `pnpm check:tokens`
- targeted Playwright coverage named by the relevant part

See `MANIFEST.md` for the generated file list.
