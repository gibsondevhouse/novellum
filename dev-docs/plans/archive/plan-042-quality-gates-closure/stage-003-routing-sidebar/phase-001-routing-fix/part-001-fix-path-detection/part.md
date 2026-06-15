---
title: Fix Path Detection
slug: part-001-fix-path-detection
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-routing-fix
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Harden the sidebar active-project detection logic to handle routes outside the standard
`/projects/<id>/...` pattern and add comprehensive unit tests for the path-parsing function.

## Scope

**In scope:**

- Identify the sidebar path-detection logic (likely in `src/modules/` or shared stores)
- Review current route patterns and identify edge cases
- Improve the logic to handle non-canonical routes
- Add unit tests covering both canonical and edge-case routes
- Verify no regressions in existing navigation

**Out of scope:**

- Changing the URL routing structure itself
- Creating new routes

## Implementation Steps

1. Locate the sidebar active-state detection logic (check `dev-docs/02-architecture/routing.md` for clues)
2. Review current route patterns and identify cases where detection fails
3. Enhance the path-parsing logic with defensive programming (null checks, regex robustness)
4. Create a unit test file testing:
   - Standard `/projects/<id>/...` routes
   - Settings routes
   - Root/home route
   - Invalid or malformed routes
5. Run `pnpm test` to ensure all tests pass
6. Verify sidebar works correctly in the UI for all navigation cases

## Files

**Update:**

- Sidebar active-state detection logic (likely in `src/modules/*/` or shared stores)
- Or create a new utility function if logic is scattered

**Create:**

- Unit tests for the path-detection logic

## Acceptance Criteria

- [ ] Sidebar active-state detection works for all known route patterns
- [ ] Unit tests added with >90% coverage of the detection logic
- [ ] All tests pass (`pnpm test`)
- [ ] Edge cases documented
- [ ] No regressions in sidebar navigation behavior

## Edge Cases

- Routes with optional segments (e.g., `/projects/:id?/...`)
- Routes with query parameters
- Routes with hash fragments
- Deeply nested routes

## Notes

Look at existing navigation tests to understand how they're structured. Follow the same
patterns to ensure consistency with the test suite.
