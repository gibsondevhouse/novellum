---
title: Homepage — Editorial Projects Library
slug: plan-007-homepage
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-04-13
last_updated: 2026-04-13
target_completion: 2026-04-18
stages:
  - stage-001-editorial-page-shell
  - stage-002-project-card-visual-system
  - stage-003-responsive-and-qa
dependencies:
  - refactor-001-ui_ux-polish
  - plan-003-advanced-editing-and-feature-completion
quality_gates:
  - lint
  - typecheck
  - tests
  - visual_review
  - docs_sync
---

## Objective

Elevate the root Projects page (`/`) from a functional-but-bare project list into a production-quality **editorial projects library**. The page should communicate the register of a serious literary production environment — dark, typographically intentional, and book-object-centric — rather than a generic SaaS dashboard.

## Context

The current `src/routes/+page.svelte` is a minimal shell: a plain `h1`, two action buttons, a CSS grid of `ProjectCard` components, a bare loading text, and a three-line empty state. The underlying data model and Dexie store layer are complete. Only the presentation layer needs work.

The target aesthetic is defined in:

- `dev-docs/design-system.md` — all tokens, typography scale, motion system
- `dev-docs/plans/refactor-001-ui_ux-polish/stage-002-visual-system-and-motion-polish/editorial-luxury-ui-research.md` — editorial benchmark analysis, gap recommendations
- Current rendered output at `http://localhost:5173/`

All changes must use design-system tokens exclusively. No hardcoded colour, spacing, or typography values.

## Scope

**In scope:**

- Page header: `--font-display` (DM Serif Display) title, refined action button placement
- `ProjectCard` visual overhaul: 2:3 cover area, display-font title, teal genre badge, logline clamp, last-updated meta
- Skeleton loading state (replaces `"Loading projects…"` text) to eliminate CLS
- Editorial empty state (display-font headline, muted subtext, single primary CTA)
- Staggered card enter animation using `novellum-enter` keyframe
- Hover lift on `ProjectCard` (border escalation + shadow step-up)
- Constrained editorial column layout (`max-width: 960px`, centred)
- Responsive grid: 3 columns ≥1024px, 2 columns 768–1023px, 1 column ≤640px
- `ProjectCreateCard` visual consistency alignment

**Out of scope:**

- Changes to Dexie schema or project store
- Cover image upload (2:3 is a styled placeholder only)
- `ImportBackupDialog` internals
- Project Hub (`/projects/[id]`) and any sub-route
- New design tokens not already present in `tokens.css` / `design-system.md`

## Stages

| #   | Stage                                                                                  | Status  | Est. Duration |
| --- | -------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Editorial Page Shell](stage-001-editorial-page-shell/stage.md)                        | `draft` | 2d            |
| 002 | [Project Card Visual System](stage-002-project-card-visual-system/stage.md)            | `draft` | 2d            |
| 003 | [Responsive Layout and QA](stage-003-responsive-and-qa/stage.md)                       | `draft` | 1d            |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` zero errors
- [ ] **typecheck** — `pnpm run check` zero errors
- [ ] **visual_review** — homepage reviewed in browser against acceptance criteria; screenshots in evidence
- [ ] **responsive_review** — viewport screenshots at 1440px, 1024px, 768px, 375px in evidence
- [ ] **docs_sync** — `dev-docs/modules/project-hub.md` section on the projects list page updated if component surface area changes

## Component Map

| Component | File | Status |
| --- | --- | --- |
| `+page.svelte` (root) | `src/routes/+page.svelte` | Update |
| `ProjectCard` | `src/modules/project/components/ProjectCard.svelte` | Update |
| `ProjectCardSkeleton` | `src/modules/project/components/ProjectCardSkeleton.svelte` | Create |
| `ProjectCreateCard` | `src/modules/project/components/ProjectCreateCard.svelte` | Update (visual alignment) |

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| `--font-display` not loaded before first paint, causing FOUT | medium | Ensure `<link rel="preconnect">` + `<link rel="stylesheet">` for DM Serif Display is present in `src/app.html` before this plan is implemented; verify in Font Loading section of research doc |
| Staggered animation causes CLS or jank on slow devices | low | Use `animation-fill-mode: both`; stagger via CSS `animation-delay` only (no JS timing loops); test with reduced-motion media query off |
| `ProjectCardSkeleton` dimensions don't match rendered `ProjectCard` — causes layout shift | medium | Skeleton must match final card height exactly; finalize card dimensions in Stage 002 Part 001 before implementing skeleton |
| `ProjectCreateCard` visual misalignment after card overhaul | low | Treat `ProjectCreateCard` as a variant of the new card shell; update its padding/border tokens in Stage 002 Part 002 |

## Notes

- The `--font-display: 'DM Serif Display', Georgia, serif` token is declared in `tokens.css` (per `design-system.md`) but the Google Fonts `<link>` embed must be confirmed present in `src/app.html` before Stage 001 Phase 001 begins.
- All border values must use rgba tokens (`--color-border-default`, `--color-border-strong`). No opaque hex borders.
- Motion must respect `prefers-reduced-motion`: wrap stagger animation in `@media (prefers-reduced-motion: no-preference)` and fall back to instant visibility.
- `ProjectCard` hover uses `--ease-standard` at `--duration-fast` (100ms) — not `--ease-editorial` (which is reserved for panel entries).
