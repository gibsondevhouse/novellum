---
title: Dexie Relocation
slug: part-001-dexie-relocation
part_number: 1
status: complete
owner: architect
assigned_to: architect
phase: phase-003-dexie-freeze-and-import-sweep
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Move the Dexie database class and its schema definitions out of `$lib/db/*` and into `$lib/legacy/dexie/*` without changing runtime behavior.

## Scope

**In scope:**

- Move `src/lib/db/index.ts` → `src/lib/legacy/dexie/db.ts`.
- Move `src/lib/db/schema.ts` (Dexie store schema) → `src/lib/legacy/dexie/schema.ts`.
- Move `src/lib/db/db.ts` (alias) → `src/lib/legacy/dexie/db-alias.ts`.
- Update only the legacy module's internal cross-imports to match the new paths.
- Keep `src/lib/db/domain-types.ts` and the `src/lib/db/types.ts` shim untouched.

**Out of scope:**

- Rewriting consumers — part-002.
- Removing the `dexie` npm package.

## Implementation Steps

1. Create `src/lib/legacy/dexie/`.
2. `git mv` the three files into the new directory and rename as above.
3. Add a top-of-file banner to each: `/** Legacy Dexie layer — frozen for V1. New code MUST NOT import from this module. */`.
4. Run `pnpm run check` to surface every broken import — capture the list for part-002.
5. Do **not** rewrite the broken imports in this part; only ensure the legacy module itself is internally consistent.

## Files

**Create:**

- `src/lib/legacy/dexie/db.ts`
- `src/lib/legacy/dexie/schema.ts`
- `src/lib/legacy/dexie/db-alias.ts`

**Delete:**

- `src/lib/db/index.ts`
- `src/lib/db/schema.ts`
- `src/lib/db/db.ts`

## Acceptance Criteria

- [ ] The three Dexie files exist under `src/lib/legacy/dexie/` with the legacy banner.
- [ ] `pnpm run check` errors are confined to consumers (broken imports), not to legacy module internals.
- [ ] `git status` shows renames, not delete + add.

## Edge Cases

- A path-alias mismatch could cause Vite/Vitest to silently bind to a stale module. After the move, restart dev server and rerun tests.

## Notes

- This part intentionally leaves the consumer-side breakage uncorrected so part-002 has a single, well-defined import-rewrite sweep.
