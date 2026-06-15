# Canon Merge Tests Evidence - 2026-06-12

## Summary

Validated canon diff application, merge policy, duplicate evidence, audit metadata, and rollback behavior.

## Coverage

- Update decisions fill only policy-approved empty fields and append-only arrays.
- Merge decisions update selected existing canon rows without duplicating array values.
- Link decisions apply the supported character-to-faction membership relationship.
- No-op decisions advance proposal lifecycle without canon writes.
- Protected-field updates fail safely and rollback the transaction.
- Duplicate evidence is surfaced for review and does not automatically merge canon.
- Accepted/rejected decisions retain compact audit metadata.

## Validation

- `pnpm vitest run tests/ai/pipeline/worldbuild-canon-diff-apply.test.ts tests/ai/pipeline/worldbuild-canon-merge-policy.test.ts tests/ai/pipeline/worldbuild-duplicate-evidence.test.ts tests/ai/pipeline/worldbuild-canon-audit.test.ts` - passed, 4 files / 19 tests.
- `pnpm check` - passed, 0 errors / 0 warnings.
- `pnpm exec eslint src/lib/ai/pipeline/worldbuild-canon-diff-apply.ts src/lib/ai/pipeline/worldbuild-canon-merge-policy.ts src/lib/ai/pipeline/worldbuild-proposal-schema.ts src/lib/ai/pipeline/checkpoint-service.ts tests/ai/pipeline/worldbuild-canon-diff-apply.test.ts tests/ai/pipeline/worldbuild-canon-merge-policy.test.ts tests/ai/pipeline/worldbuild-duplicate-evidence.test.ts tests/ai/pipeline/worldbuild-canon-audit.test.ts` - passed.
