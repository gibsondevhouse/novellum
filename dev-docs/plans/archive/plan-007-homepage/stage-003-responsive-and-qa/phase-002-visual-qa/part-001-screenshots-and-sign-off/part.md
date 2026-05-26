---
title: Screenshots and Sign-Off
slug: part-001-screenshots-and-sign-off
part_number: 1
status: draft
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-002-visual-qa
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Capture browser screenshots for each meaningful state of the homepage at all four target viewports, verify against every acceptance criterion in the plan, and formally sign off the plan as complete.

## Scope

**In scope:**

- Screenshots at 1440px, 1024px, 768px, 375px for:
  - Populated state (≥3 projects visible)
  - Loading state (skeleton cards)
  - Empty state (editorial composition)
- Verification of all plan-level quality gates
- Updating plan and MASTER-PLAN status

**Out of scope:**

- Performance lab measurement (covered by `refactor-001-ui_ux-polish` stage-004 scope)
- Automated visual regression testing

## Implementation Steps

1. Open `http://localhost:5173/` with projects present; take screenshots at 1440px, 1024px, 768px, 375px → save to `evidence/` as `populated-1440-YYYY-MM-DD.png` etc.
2. Clear IndexedDB or use an empty project profile; take screenshots for empty state at same breakpoints
3. Add artificial load delay (comment out `await loadProjects()` momentarily) to capture skeleton states
4. Review each screenshot against the plan acceptance criteria checklist
5. Update `plan-007-homepage/plan.md` frontmatter `status` to `complete` and `last_updated` to today
6. Update `dev-docs/plans/MASTER-PLAN.md` — move plan from Active to Completed, add completion date

## Files

**Create:**

- `evidence/populated-1440-YYYY-MM-DD.png`
- `evidence/populated-1024-YYYY-MM-DD.png`
- `evidence/populated-768-YYYY-MM-DD.png`
- `evidence/populated-375-YYYY-MM-DD.png`
- `evidence/empty-375-YYYY-MM-DD.png`
- `evidence/skeleton-1440-YYYY-MM-DD.png`

**Update:**

- `dev-docs/plans/plan-007-homepage/plan.md` (status → `complete`)
- `dev-docs/plans/MASTER-PLAN.md`

## Acceptance Criteria

- [ ] All plan-level quality gates verified (lint, typecheck, visual_review, responsive_review, docs_sync)
- [ ] Screenshots stored with correct naming convention in `evidence/`
- [ ] No unresolved visual issues (overflow, clipping, font fallback visible)
- [ ] `plan.md` status updated to `complete`
- [ ] `MASTER-PLAN.md` updated

## Edge Cases

- If DM Serif Display fails to load (network issue), screenshots will show Georgia fallback — note in `impl.log.md` and retest with network available

## Notes

- Evidence files should use the actual ISO date in the filename: `YYYY-MM-DD` → e.g. `2026-04-18`
- Minimum set is the 6 files listed above; more are welcome
