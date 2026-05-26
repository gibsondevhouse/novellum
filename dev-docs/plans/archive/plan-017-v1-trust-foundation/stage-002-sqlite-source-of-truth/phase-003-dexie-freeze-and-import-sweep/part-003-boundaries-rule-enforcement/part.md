---
title: Boundaries Rule Enforcement
slug: part-003-boundaries-rule-enforcement
part_number: 3
status: complete
owner: reviewer
assigned_to: reviewer
phase: phase-003-dexie-freeze-and-import-sweep
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Add an `eslint-plugin-boundaries` rule (and a Vitest guardrail) that prevents any future V1 module from importing `$lib/legacy/dexie/*` outside the explicitly-allowed migration files.

## Scope

**In scope:**

- ESLint config: define a new boundaries element type `legacy-dexie` for `src/lib/legacy/dexie/**`.
- Allowlist: only `src/lib/migration/**`, `src/modules/outliner/services/migrations/**`, and `src/routes/settings/migrate/**` (the future migration page).
- Add a Vitest static-analysis guardrail at `tests/lib/legacy-dexie-boundaries.test.ts` that scans `src/` and asserts no disallowed import exists. (Belt-and-braces for cases where ESLint is bypassed.)

**Out of scope:**

- Removing the Dexie npm package.
- Refactoring legacy module internals.

## Implementation Steps

1. Open `eslint.config.js` and locate the existing `boundaries/elements` configuration.
2. Add a new element entry: `{ type: 'legacy-dexie', pattern: 'src/lib/legacy/dexie/**' }`.
3. Add a deny rule: `legacy-dexie` may be imported only by elements with type `legacy-allowed-consumer`.
4. Define `legacy-allowed-consumer` patterns: `src/lib/migration/**`, `src/modules/outliner/services/migrations/**`, `src/routes/settings/migrate/**`.
5. Write `tests/lib/legacy-dexie-boundaries.test.ts` that:
   - Walks `src/`.
   - Reads every `.ts`/`.svelte` file.
   - Greps for `from '$lib/legacy/dexie` and `from '../legacy/dexie`.
   - Asserts every match's file path matches one of the allowlisted patterns.
6. Run `pnpm run lint` to confirm the rule fires on a deliberate violation, then revert the violation.

## Files

**Update:**

- `eslint.config.js`

**Create:**

- `tests/lib/legacy-dexie-boundaries.test.ts`

## Acceptance Criteria

- [ ] `pnpm run lint` reports the new rule and passes against the current codebase.
- [ ] A deliberate test violation (e.g. import in `src/lib/db/domain-types.ts`) makes lint fail; reverting clears it.
- [ ] `tests/lib/legacy-dexie-boundaries.test.ts` passes.

## Edge Cases

- Avoid over-matching: a comment containing `$lib/legacy/dexie` should not trigger the static test. Use a regex anchored to `^import` or `from\s+['"]`.

## Notes

- This guardrail must remain in place until Dexie is fully removed in a future stage.
