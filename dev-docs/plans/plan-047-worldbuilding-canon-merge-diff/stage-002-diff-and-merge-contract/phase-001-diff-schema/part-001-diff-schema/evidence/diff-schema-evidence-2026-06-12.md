# Diff Schema Evidence

Date: 2026-06-12
Part: `part-001-diff-schema`

## Implemented Contract

Created `src/lib/ai/pipeline/worldbuild-canon-diff-schema.ts` with:

- JSON-safe field value validation for scalar, array, object, and null values.
- Entity family coverage for characters, factions, locations, lore entries, plot threads, timeline events, themes, glossary terms, and character relationships.
- Decision variants for `create`, `update`, `merge`, `link`, and `no_op`.
- Field-level diffs with before/after/proposed values, operation, value type, and optional review evidence.
- Duplicate candidate evidence with target refs, match kind, score, and supporting evidence.
- Link diffs for faction membership, character relationships, location membership, plot thread references, timeline references, tag references, and generic links.
- A `parseWorldbuildCanonDiff` helper that returns `{ ok: false, code: 'invalid_canon_diff', details }` for malformed records.

Updated `src/lib/ai/pipeline/worldbuild-proposal-schema.ts` so `WorldbuildProposalRecord` can carry an optional `canonDiff` without breaking existing persisted proposal rows.

## Validation

Command:

```bash
pnpm vitest run tests/ai/pipeline/worldbuild-canon-diff-schema.test.ts
```

Result:

```text
Test Files  1 passed (1)
Tests       7 passed (7)
```

Command:

```bash
pnpm check
```

Result:

```text
svelte-check found 0 errors and 0 warnings
```

## Safety Notes

- `update` and `merge` require a target entity reference.
- `create`, `update`, and `merge` require at least one field-level diff.
- `merge` requires duplicate candidate evidence.
- `link` requires at least one link diff.
- `no_op` requires author-review evidence and a reason.
- Unknown decision values, out-of-range confidence scores, omitted required targets, and empty merge candidate sets fail validation.

This completes the schema foundation needed by the merge policy and duplicate evidence phases.
