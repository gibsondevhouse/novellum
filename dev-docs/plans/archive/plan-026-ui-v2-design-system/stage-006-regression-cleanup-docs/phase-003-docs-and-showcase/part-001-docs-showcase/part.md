---
title: Docs and /styles showcase realignment
slug: part-001-docs-showcase
part_number: 1
status: complete
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-003-docs-and-showcase
started_at: 2026-05-25
completed_at: 2026-05-25
estimated_duration: 0.25d
---

## Objective

Update architecture/module docs to v2 language and replace the `/styles` route with an in-app design-system showcase matching the v2 kit references.

## Scope

**In scope:**

- `dev-docs/02-architecture/frontend.md` rewrite for v2
- `dev-docs/04-modules/*` refresh to v2 anatomy terms
- `/styles` route rebuild as token + primitive showcase
- Browser and Computer Use plugin verification

**Out of scope:**

- Stabilizing unrelated failing E2E tests
- Global plan/stage completion promotion while final gates remain red

## Implementation Steps

1. Rewrite architecture and module docs for v2 surface contracts.
2. Rebuild `/styles` as a static reference page (palette/type/primitives/chrome/immersive previews).
3. Verify `/styles` with Browser + Computer Use plugins.
4. Run final gate command and capture blockers.

## Files

**Update:**

- `src/routes/styles/+page.svelte`
- `src/routes/styles/+page.ts`
- `dev-docs/02-architecture/frontend.md`
- `dev-docs/04-modules/{editor,nova,reader,outline,continuity,world-building,story-bible,settings,project,ai,assets,export}.md`

## Acceptance Criteria

- [x] Docs updated to v2 vocabulary and geometry
- [x] `/styles` displays required sections and primitives
- [x] Plugin-based visual verification performed
- [x] Full final gate command passes end-to-end

## Notes

Final gate now passes after stabilizing E2E specs against current UI labels and ensuring project/test-state cleanup so route-family visual baselines stay deterministic for the combined suite run.
