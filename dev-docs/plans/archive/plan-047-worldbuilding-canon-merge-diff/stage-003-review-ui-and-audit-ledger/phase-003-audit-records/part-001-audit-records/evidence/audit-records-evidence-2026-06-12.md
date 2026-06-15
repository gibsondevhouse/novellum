# Audit Records Evidence - 2026-06-12

## Summary

Implemented retrievable proposal audit metadata for accepted and rejected worldbuilding canon diffs.

## Code Changes

- Extended `WorldbuildProposalAcceptance` and `WorldbuildProposalRejection` with optional compact audit metadata in `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`.
- Updated `src/lib/ai/pipeline/checkpoint-service.ts` to build bounded audit summaries during proposal acceptance and rejection.
- Added `tests/ai/pipeline/worldbuild-canon-audit.test.ts` for accepted diff metadata, rejected diff evidence retention, and legacy no-diff projection audit fallback.

## Audit Shape

The persisted audit summary records:

- Projection mode: `canon_diff` or `legacy_create_projection`.
- Diff decision and diff ID when present.
- Target family, target ID, and display name when available.
- Changed field names, operations, value types, and evidence counts.
- Link target summaries and duplicate candidate counts.
- Overall review evidence count and summary.

The audit summary does not copy full before/after field values, full canon rows, prompt text, or raw provider output.

## Validation

- `pnpm vitest run tests/ai/pipeline/worldbuild-canon-audit.test.ts tests/ai/pipeline/worldbuild-canon-diff-apply.test.ts tests/world-building/worldbuild-proposal-canon-safety.test.ts tests/routes/worldbuilding-proposals.test.ts` - passed, 4 files / 26 tests.
- `pnpm check` - passed, 0 errors / 0 warnings.
- `pnpm exec eslint src/lib/ai/pipeline/worldbuild-proposal-schema.ts src/lib/ai/pipeline/checkpoint-service.ts tests/ai/pipeline/worldbuild-canon-audit.test.ts tests/ai/pipeline/worldbuild-canon-diff-apply.test.ts` - passed.
