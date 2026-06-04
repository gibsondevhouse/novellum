---
title: Resolve Warnings
slug: part-002-resolve-warnings
part_number: 2
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-warning-audit
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Systematically fix each TypeScript warning identified in part-001. Apply type-safe fixes and
verify that `pnpm check` runs clean with zero warnings.

## Scope

**In scope:**

- Fix each warning in the prioritized list from part-001
- Apply type-safe corrections (prefer fixing root cause over suppressing)
- Verify each fix doesn't introduce new errors
- Re-run full test suite after fixes

**Out of scope:**

- Major structural refactoring (document for future work)
- Configuration changes to TypeScript
- Disabling type checking for any files

## Implementation Steps

1. Work through warnings in complexity order (simplest first)
2. For each warning:
   - Understand the root cause
   - Apply the minimal fix that maintains type safety
   - Run `pnpm check` to verify the warning is resolved
   - Run `pnpm test` to ensure no new errors
3. After all warnings fixed, run full quality gates: `pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm test`, `pnpm check:tokens`
4. Document each fix with rationale in `impl.log.md`

## Files

**Create:**

- None (fixes are to existing files)

**Update:**

- Multiple source files as needed to resolve warnings

## Acceptance Criteria

- [ ] All warnings from part-001 list are resolved
- [ ] `pnpm check` shows zero errors and zero warnings
- [ ] All test suites pass (`pnpm test`)
- [ ] All other quality gates pass
- [ ] Each fix documented in `impl.log.md` with rationale

## Edge Cases

- Some warnings may be cascading (fix one, others resolve automatically)
- Some warnings may require library upgrades or version constraints
- Some may need strategic type assertions or structural changes

## Notes

When you encounter a complex warning that requires significant refactoring, document it
thoroughly in `impl.log.md` with the root cause analysis, and consider whether it should
be deferred to a future refactoring plan. The goal is clean gates, not perfection.
