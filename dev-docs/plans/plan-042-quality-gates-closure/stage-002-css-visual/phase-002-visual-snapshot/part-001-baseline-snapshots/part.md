---
title: Baseline Snapshots
slug: part-001-baseline-snapshots
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-visual-snapshot
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Evaluate the Playwright visual snapshot suite, update stale snapshots to the current visual
state, and formally document any surfaces that are not yet ready for visual regression testing.

## Scope

**In scope:**

- Run the Playwright visual test suite (`pnpm test:visual` or targeted subset)
- Review snapshot drift across core surfaces (shell, hub, editor, reader, settings)
- Update snapshots where visual changes are intentional and good
- Document any surfaces with known visual issues that will be addressed in future plans

**Out of scope:**

- Fixing underlying visual bugs (document for future work)
- Expanding visual coverage (baseline stabilization only)
- Major redesign or polish

## Implementation Steps

1. Run Playwright visual tests to identify all snapshot drift
2. Review each diff and categorize:
   - **Intentional & Good**: Update the snapshot
   - **Known Issue**: Document the issue with context
   - **Stale Baseline**: Update to current state
3. For each documented issue, create a reference in `evidence/` with screenshot or explanation
4. Update all "Intentional & Good" snapshots
5. Re-run visual suite to confirm stability

## Files

**Update:**

- Playwright snapshot files under `tests/` (exact paths depend on test structure)

**Create:**

- Documentation of known visual issues in `evidence/`

## Acceptance Criteria

- [ ] All snapshot diffs reviewed and categorized
- [ ] "Good" snapshots updated
- [ ] Known issues documented with context
- [ ] Playwright visual suite runs without stale-baseline errors
- [ ] Visual drift inventory saved to `evidence/`

## Edge Cases

- Some surfaces may have intentional cross-surface visual inconsistencies (document)
- Some snapshots may require platform-specific considerations (Windows/macOS/Linux)
- Some diffs may be due to font rendering or timing (mark as acceptable variance)

## Notes

Visual testing is historically brittle across different machines and environments. The goal
here is to stabilize the baseline so it can be reliably maintained going forward. Document
any environmental factors that affect snapshot consistency.
