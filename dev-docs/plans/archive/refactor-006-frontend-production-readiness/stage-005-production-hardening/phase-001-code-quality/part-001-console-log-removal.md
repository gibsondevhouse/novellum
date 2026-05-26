---
title: Console Log Removal
slug: part-001-console-log-removal
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-001-code-quality
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.25d
---

## Objective

Remove all `console.log` statements from production source code to prevent information leakage and debugging noise in the browser console.

## Scope

**In scope:**

- All `console.log()` calls in `src/`
- Known violations:
  - `src/routes/+layout.svelte` — `console.log('DB version:', db.verno)`

**Out of scope:**

- `console.warn` and `console.error` in genuine error-handling paths (keep these)
- `console.log` inside the `tests/` directory (test output is acceptable)

## Implementation Steps

1. Run `grep -rn "console\.log" src/` to get the complete list.
2. For each match, remove the `console.log` line entirely. Do not replace with `console.debug` — remove it.
3. For `src/routes/+layout.svelte`'s `console.log('DB version:', db.verno)`: remove it. The DB version is not meaningful information for an end user.
4. Run `grep -rn "console\.log" src/` to verify zero results.
5. Run `pnpm run lint && pnpm run check`.

## Files

**Update:**

- `src/routes/+layout.svelte`
- Any additional files from the grep audit

## Acceptance Criteria

- [ ] `grep -rn "console\.log" src/` returns zero matches.
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- If a `console.log` is the only statement in a function body, remove the function call too if it serves no other purpose. Do not leave empty function bodies.

## Notes

ESLint's `no-console` rule may already flag these. After removal, confirm whether the rule should be enabled in `eslint.config.js` to prevent future regressions.
