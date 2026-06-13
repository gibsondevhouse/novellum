# Merge Policy Evidence

Date: 2026-06-12
Part: `part-001-merge-policy`

## Implemented Policy

Updated `src/lib/ai/pipeline/checkpoint-service.ts` with a pure merge policy surface:

- `WORLDBUILD_CANON_MERGE_POLICIES`
- `getWorldbuildCanonMergePolicy`
- `getWorldbuildCanonMergeFieldMode`

Initial supported families:

- `character`
- `location`
- `faction` as a bounded link/fill support family

## Field Modes

| Mode | Meaning | Safety rule |
| --- | --- | --- |
| `replace_if_empty` | Proposed value can fill an empty current field | Existing non-empty canon value still requires manual review |
| `append_unique` | Proposed list values can be appended after de-duping | Existing list values are retained |
| `link_only` | Field should become a reference/link decision | Do not silently rewrite linked IDs |
| `manual_review` | Reviewer must explicitly choose | Default for unknown fields and name/title conflicts |
| `never` | Field is not mergeable | Protected fields such as `id`, `projectId`, `createdAt`, `updatedAt` |

## Initial Family Rules

Characters:

- Empty-field fills: `role`, `bio`, `faction`, rich motivation/story/voice fields, and `notes`.
- Append-only arrays: `traits`, `goals`, `flaws`, `tags`.
- Link-only: `factionId`.
- Manual review by default for `name` and unknown fields.

Locations:

- Empty-field fills: description, realm/landmark classification, world-rule fields, environment/function fields, and narrative-role fields.
- Append-only arrays: `tags`, `notableFeatures`, `landmarkIds`, `factionIds`, `characterIds`, `threadIds`.
- Link-only: `realmId`.
- Manual review by default for `name` and unknown fields.

Factions:

- Fill-only support for `type`, `description`, `mission`, and `ideology`.
- Merge is disabled for now; faction support exists so character/faction links can be represented without silently creating duplicate faction text.

## Atomicity Expectation

The policy is pure metadata in this slice. Later accept execution must keep one SQLite transaction around:

1. Reload persisted proposal and selected diff.
2. Verify proposal is still pending review.
3. Re-read target canon rows.
4. Apply only author-selected field/link operations.
5. Write acceptance/audit metadata.
6. Roll back all canon and metadata writes on any validation or projection failure.

## Validation

Command:

```bash
pnpm vitest run tests/ai/pipeline/worldbuild-canon-diff-schema.test.ts tests/ai/pipeline/worldbuild-canon-merge-policy.test.ts
```

Result:

```text
Test Files  2 passed (2)
Tests       13 passed (13)
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
pnpm exec eslint src/lib/ai/pipeline/worldbuild-canon-diff-schema.ts src/lib/ai/pipeline/checkpoint-service.ts tests/ai/pipeline/worldbuild-canon-diff-schema.test.ts tests/ai/pipeline/worldbuild-canon-merge-policy.test.ts
```

Result: passed with zero reported errors.

This completes the bounded merge policy needed before duplicate candidate evidence can be generated.
