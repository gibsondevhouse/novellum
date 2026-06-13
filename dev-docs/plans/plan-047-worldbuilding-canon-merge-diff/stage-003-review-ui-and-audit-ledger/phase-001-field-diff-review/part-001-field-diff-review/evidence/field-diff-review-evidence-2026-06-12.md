# Field Diff Review Evidence

Date: 2026-06-12
Part: `part-001-field-diff-review`

## Implemented UI

Created `src/modules/world-building/components/WorldbuildingProposalDiffView.svelte` and embedded it in `WorldbuildingProposalCard.svelte`.

The view renders:

- Decision label for create/update/merge/link/no-op diffs.
- Diff summary and target entity display when present.
- Field-level current/proposed values for canon diffs.
- Link rows for future link-only diffs.
- Duplicate candidates from proposal scan evidence or parsed diff evidence.
- Fallback proposal payload fields when a proposal has no `canonDiff` yet.

## Validation

Command:

```bash
pnpm vitest run tests/world-building/worldbuilding-proposal-diff-view.test.ts
```

Result:

```text
Test Files  1 passed (1)
Tests       3 passed (3)
```

Command:

```bash
pnpm check
```

Result:

```text
svelte-check found 0 errors and 0 warnings
```

Command:

```bash
pnpm exec eslint src/modules/world-building/components/WorldbuildingProposalDiffView.svelte src/modules/world-building/components/WorldbuildingProposalCard.svelte tests/world-building/worldbuilding-proposal-diff-view.test.ts
```

Result: passed with zero reported errors.

Command:

```bash
pnpm exec stylelint src/modules/world-building/components/WorldbuildingProposalDiffView.svelte src/modules/world-building/components/WorldbuildingProposalCard.svelte
```

Result: passed with zero reported errors.

This gives authors visible create/update/merge evidence before acceptance without changing accept behavior yet.
