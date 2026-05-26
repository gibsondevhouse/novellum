---
title: Visual Consistency Audit
slug: part-002-visual-consistency
part_number: 2
status: complete
owner: reviewer
assigned_to: reviewer
phase: phase-002-final-qa
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.25d
---

## Objective

Perform a manual visual spot-check across all primary routes to confirm that token replacements, component migrations, and new UI (toast, breadcrumbs, empty states, error pages) all render correctly and are visually consistent with the Novellum design system.

## Scope

**In scope:**

- Spot-check of all routes listed below in a browser at `http://localhost:5173`
- Confirming no CSS variable resolves to an empty or `initial` value (visible as missing colour, wrong spacing, broken layout)
- Confirming new components (ToastContainer, EmptyState, Breadcrumb, error pages) match the dark editorial aesthetic

**Out of scope:**

- Pixel-perfect visual regression testing (not configured)
- Mobile viewports (check at 1280px wide minimum)

## Checklist — Routes to Spot-Check

- [ ] `/` — Library home: empty state, project cards
- [ ] `/projects/[id]` — Project hub: title, metadata, breadcrumbs absent (top-level)
- [ ] `/projects/[id]/outline` — Outline: visual outliner, drag handles, empty act state
- [ ] `/projects/[id]/continuity` — Continuity: PromptEditor, no "coming soon" stubs
- [ ] `/projects/[id]/editor/[sceneId]` — Editor: breadcrumbs rendered, no blank heading
- [ ] `/projects/[id]/world-building/characters/[charId]` — Character detail: breadcrumbs
- [ ] `/nova` — Nova assistant: chat interface, typing indicator
- [ ] `/images` — Gallery: image grid, empty state
- [ ] `/styles` — Theme picker rendered, no stubs
- [ ] `/settings` — API key form, no hardcoded border colour visible
- [ ] `/does-not-exist` — Root error page: branded, "Go to Library" CTA visible
- [ ] `/projects/invalid-id/outline` — Project error page: "Back to Library" CTA visible

## Implementation Steps

1. Start the dev server: `pnpm run dev`.
2. Visit each route in the checklist. For each route:
   - Open browser DevTools → Console: confirm no errors or unhandled promise rejections.
   - Open DevTools → Elements: inspect at least one token-based style to confirm `var(--color-surface-raised)` etc. resolve to their expected values.
   - Trigger the empty state (if applicable) and confirm it uses the standardised `<EmptyState>` component.
3. Trigger a toast notification manually (e.g., by saving a project) and confirm it appears in the bottom-right corner and auto-dismisses.
4. Navigate to a deep route (editor scene or character detail) and confirm breadcrumbs render.
5. Record any visual issues found. Fix immediately if trivial (wrong spacing, missing import). Raise as a blocker if complex.

## Files

No file changes expected unless issues are found during the audit.

## Acceptance Criteria

- [ ] All 12 routes in the checklist are visited and pass.
- [ ] Zero console errors on any route.
- [ ] Toast, EmptyState, Breadcrumb, and error page components render correctly on their respective routes.
- [ ] No `var(--undefined-token)` blank values visible in computed styles.

## Edge Cases

- The error page routes require navigating to a genuinely invalid URL. Use the browser address bar directly.
- If a toast cannot be triggered by normal user flow, temporarily call `toast('Test', 'success')` from the browser console, then revert.

## Notes

This is a human-performed check. Screenshots of passing routes should be saved to `dev-docs/plans/refactor-006-frontend-production-readiness/evidence/` as `visual-qa-YYYY-MM-DD.png` if tooling allows. This constitutes the release sign-off artifact.
