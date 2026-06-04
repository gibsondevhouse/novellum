---
title: Fix CSS Error
slug: part-001-fix-css
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-css-lint
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Resolve the pre-existing `lint:css` error at `IndividualsWorkspaceShell.svelte:183`.

## Scope

**In scope:**

- Identify the specific CSS lint error at the documented location
- Apply the minimal fix to satisfy the linter
- Verify no new errors are introduced

**Out of scope:**

- Broader CSS refactoring
- Style system changes

## Implementation Steps

1. Run `pnpm lint:css` to capture the error message
2. Open `src/modules/*/IndividualsWorkspaceShell.svelte` and locate line 183
3. Examine the specific lint violation
4. Apply the minimal fix (formatting, property reordering, etc.)
5. Re-run `pnpm lint:css` to confirm zero errors

## Files

**Update:**

- `src/modules/*/IndividualsWorkspaceShell.svelte` (exact path may vary by workspace structure)

## Acceptance Criteria

- [ ] Lint:css error at line 183 resolved
- [ ] `pnpm lint:css` shows zero errors
- [ ] No new lint:css errors introduced
- [ ] Change is minimal and documented

## Edge Cases

- Error message may reference a different component (verify exact file path from error output)
- May require understanding of the lint:css rule being violated

## Notes

This is a straightforward linting fix. The error has been waived for several plans, so
take care to fix the root cause and not just suppress it.
