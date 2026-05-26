---
title: Cross-Browser Verification
slug: part-001-cross-browser-verification
part_number: 1
status: draft
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-002-integration-and-docs
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

> Manually verify the primary goal of the plan: that projects created in one browser are immediately visible in another browser connected to the same SvelteKit server instance.

## Scope

**In scope:**

- Manual verification steps across 2+ browsers
- Screenshot evidence
- Verification that Dexie portability export still works after repository swap

**Out of scope:**

- Automated cross-browser E2E tests (deferred)

## Implementation Steps

1. Start `pnpm dev`
2. Open Chrome, navigate to `http://localhost:5173`
3. Create a project: "Cross-Browser Test Project"
4. Open Firefox (or Safari), navigate to `http://localhost:5173`
5. Verify "Cross-Browser Test Project" appears in the projects list WITHOUT a page reload workaround
6. In Firefox: open the project, add a chapter and scene
7. Return to Chrome: verify the chapter and scene are visible
8. Test the portability export: export a `.novellum.zip` from the settings (confirm plan-006 feature still works)
9. Record results in `evidence/cross-browser-test-2026-04-13.md`

## Files

**Create (evidence):**

- `evidence/cross-browser-test-YYYY-MM-DD.md` — test record with pass/fail per check

## Acceptance Criteria

- [ ] Project created in Browser A appears in Browser B
- [ ] Data written in Browser B (chapter, scene) appears in Browser A
- [ ] Plan-006 portability ZIP export produces a valid archive after this migration
- [ ] No 500 errors in the SvelteKit dev server console during any test step

## Edge Cases

- If the SvelteKit server caches any route responses, data may not appear until refresh — verify there is no stale caching on `/api/db/*` routes
- Test with browser localStorage cleared to confirm nothing depends on localStorage for core project loading

## Notes

> Record the exact browser versions used in the evidence file for traceability.
