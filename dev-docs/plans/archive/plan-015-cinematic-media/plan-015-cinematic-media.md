---
title: Cinematic Media Gallery UI/UX Refactor
slug: plan-015-cinematic-media
version: 1.1.0
status: complete
owner: Planner / Architect / Stylist
created: 2026-04-20
last_updated: 2026-04-21
target_completion: 2026-05-30
stages:
  - stage-001-baseline-audit
  - stage-002-tokens-primitives
  - stage-003-global-shell
  - stage-004-library-galleries
  - stage-005-production-suite
  - stage-006-world-building
  - stage-007-workflow-surfaces
  - stage-008-verification-rollout
dependencies:
  - plan-system-refactoring
quality_gates:
  - pnpm run check:tokens
  - pnpm run lint
  - pnpm run check
  - pnpm run test
  - pnpm run test:visual
---

# Plan-015: Cinematic Media Gallery UI/UX Refactor

## Objective

Transform every visible Novellum surface into a production-release-ready cinematic media gallery and novel production suite. The finished UI must feel polished, coherent, accessible, responsive, and shippable across the full application shell, app-level routes, project routes, world-building surfaces, workflow surfaces, modals, drawers, empty/loading/error states, and visual regression baselines.

This is a UI/UX and frontend implementation plan. It does not change database schema, AI routing, OpenRouter behavior, persistence contracts, or product feature scope beyond the visual and interaction systems required to ship the current application at production quality.

## Release Definition

This plan is complete only when the application can be released with confidence against these criteria:

- Every visible route has a clear first-viewport focal point and no unfinished placeholder styling.
- Every creative entity has a visual representation, including deterministic fallbacks when uploaded media is absent.
- All app-level and project-level surfaces share one design language: dark editorial canvas, media-first objects, spotlight hierarchy, glass overlays where useful, and tokenized motion.
- The UI passes token, lint, type, unit, integration, and visual regression gates.
- The UI passes manual keyboard, reduced-motion, mobile, tablet, desktop, and wide-desktop review.
- No visible route has undefined design tokens, hardcoded visual values caught by `check:tokens`, text overlap, inaccessible controls, unreadable overlays, or broken empty/loading/error states.

## Current Baseline

Known current-state evidence:

- `--radius-xl`, `--radius-2xl`, and `--gradient-spotlight` already exist in `src/styles/tokens.css`; they must be verified and used, not reintroduced.
- `pnpm run check:tokens` currently fails with visual-token violations across multiple files.
- Undefined token references are present in visible surfaces: `--color-brand`, `--font-body`, `--transition-fast`, `--ease-out-back`, `--color-surface`, and `--color-border-hover`.
- The current UI contains mixed route-level styling, fragmented buttons/forms/modals, inconsistent empty states, and inconsistent gallery/card treatments.
- Several future/redirect routes are visible enough to require polished fallback handling.

## Locked Product Decisions

- The target aesthetic is Apple TV / Linear-inspired cinematic polish adapted to a serious writing tool.
- Cinematic polish must improve orientation and creative flow; it must not reduce writing density, hide manuscript context, or bury primary actions.
- No route may depend on external stock imagery.
- Uploaded project covers and image assets are preferred. Missing art uses deterministic, tokenized placeholders.
- Lists representing creative assets become rails, poster grids, dossiers, storyboards, timelines, or dense tables depending on workflow need.
- Dense authoring workflows, especially outline and editor surfaces, must remain efficient and scannable.
- AI surfaces must preserve author-in-control behavior: suggestions are explicit, reviewable, and never silently applied.

## Implementation Boundaries

Use these boundaries throughout implementation:

- Shared UI primitives live in `src/lib/components/ui/`.
- Domain wrappers may live in `src/modules/<domain>/components/` when they add domain semantics around shared primitives.
- Route files should compose primitives and domain components; they should not accumulate bespoke card/modal/button systems.
- Global tokens live in `src/styles/tokens.css` and must be documented in `dev-docs/design-system.md`.
- Module boundaries from `dev-docs/modular-boundaries.md` remain active; do not import internals across vertical domains.
- Route-level CSS may handle layout composition, but reusable visual treatments belong in primitives.
- All new Svelte components use Svelte 5 `$props()` and snippets where slots/actions are needed.
- All changed UI must preserve focus rings, keyboard operation, reduced-motion fallback, and responsive constraints.

## Primitive Contract

Stage 002 must establish the reusable contracts before broad route migration:

| Primitive | Location | Purpose | Required contract |
| --- | --- | --- | --- |
| `SpotlightHero` | `src/lib/components/ui/SpotlightHero.svelte` | First-viewport route/project identity. | `title`, `eyebrow`, `description`, `imageUrl`, `fallback`, `meta`, `actions`, `tone` |
| `EntityPoster` | `src/lib/components/ui/EntityPoster.svelte` | Visual card for creative entities. | `title`, `subtitle`, `imageUrl`, `fallbackLabel`, `href`, `aspect`, `meta`, `status`, `actions` |
| `MediaRail` | `src/lib/components/ui/MediaRail.svelte` | Keyboard-safe horizontal shelf. | `title`, `description`, `items`, `ariaLabel`, `snap`, `actions` |
| `GlassBar` | `src/lib/components/ui/GlassBar.svelte` | Floating contextual nav/metadata bar. | `position`, `ariaLabel`, `actions`, `sticky` |
| `CommandDock` | `src/lib/components/ui/CommandDock.svelte` | Floating workflow action cluster. | `position`, `ariaLabel`, `actions`, `sticky` |
| `StatusRing` | `src/lib/components/ui/StatusRing.svelte` | Compact progress instrumentation. | `label`, `value`, `max`, `tone`, `description` |
| `VisualTile` | `src/lib/components/ui/VisualTile.svelte` | Compact domain/settings tile. | `title`, `description`, `icon`, `imageUrl`, `href`, `status`, `actions` |
| `CinematicEmptyState` | `src/lib/components/ui/CinematicEmptyState.svelte` | Empty/loading/error state shell. | `title`, `description`, `visual`, `primaryAction`, `secondaryAction` |
| `SideDrawer` | `src/lib/components/ui/SideDrawer.svelte` | Shared drawer for forms/details. | `title`, `description`, `open`, `onClose`, `actions`, `children` |

Each primitive must reserve stable dimensions, avoid nested cards, avoid text overflow, respect reduced motion, and expose accessible names for interactive regions.

## Route Family Ownership

| Family | Primary owner | Surfaces | Release requirement |
| --- | --- | --- | --- |
| Global shell | Architect + Stylist | `+layout`, `AppSidebar`, `AppHeader`, active project nav, breadcrumbs, toasts, onboarding, AI panel, modal/drawer chrome | Persistent chrome is cohesive, stable, keyboard-safe, and responsive. |
| Library galleries | Stylist + Architect | `/`, `/projects`, `/books`, `/stories` | Project collections use spotlight, rails/grids, posters, skeletons, and cinematic empty states. |
| Project suite | Architect + Stylist | `/projects/[id]/hub` | Hub reads as a story control room with cover-led identity, visual metrics, and clear command surfaces. |
| World-building | Architect + Stylist | `/world-building/**`, `/bible/**` redirects | Domains become dossiers/galleries with polished redirects and future states. |
| Workflows | Architect + Stylist | `/outline`, `/editor`, `/editor/[sceneId]`, `/nova`, `/images`, `/settings`, `/styles` | Dense workflows stay efficient while adopting production visual systems. |
| Verification | Reviewer | All visible surfaces | Automated gates, visual baselines, manual QA evidence, and release checklist pass. |

## Stage Overview

| # | Stage | Owner | Release contribution | Exit gate |
| --- | --- | --- | --- | --- |
| 001 | [Baseline Audit and Visual Target](stage-001-baseline-audit/stage-001-baseline-audit.md) | Planner / Reviewer | Defines exact current-state debt, route inventory, seeded fixtures, and screenshot baseline. | Audit artifacts exist for all route families and token debt is mapped. |
| 002 | [Tokens and Gallery Primitives](stage-002-tokens-primitives/stage-002-tokens-primitives.md) | Stylist / Architect | Removes visual debt and creates reusable production primitives. | `check:tokens` passes and primitives are documented/tested. |
| 003 | [Global Shell and Persistent Chrome](stage-003-global-shell/stage-003-global-shell.md) | Architect / Stylist | Makes navigation, header, overlays, and persistent UI release-quality. | Shell works across all viewports and overlay focus states. |
| 004 | [Library and Project Galleries](stage-004-library-galleries/stage-004-library-galleries.md) | Stylist | Ships media-gallery treatment for top-level creative collections. | `/`, `/projects`, `/books`, `/stories` pass visual and responsive review. |
| 005 | [Project Production Suite](stage-005-production-suite/stage-005-production-suite.md) | Architect | Ships the project hub as a polished story control room. | Hub hero, metrics, details, and actions pass seeded visual review. |
| 006 | [World-Building and Continuity](stage-006-world-building/stage-006-world-building.md) | Architect / Stylist | Ships dossier-grade world-building and continuity surfaces. | World domains, entity surfaces, continuity, redirects, and placeholders pass review. |
| 007 | [Workflow Surfaces](stage-007-workflow-surfaces/stage-007-workflow-surfaces.md) | Architect / Stylist | Ships authoring, AI, image, and settings workflows with production polish. | Outline, editor, Nova, Images, Settings, and Styles pass usability review. |
| 008 | [Verification and Rollout](stage-008-verification-rollout/stage-008-verification-rollout.md) | Reviewer | Proves the release is shippable. | All automated gates and manual release checklist pass with evidence. |

## Required Execution Order

1. Complete Stage 001 before changing production UI. The audit defines the regression baseline and fixtures.
2. Complete Stage 002 before broad route refactors. Route work must consume shared primitives rather than invent new local systems.
3. Complete Stage 003 before route-family work. Persistent shell changes affect every screenshot and should stabilize first.
4. Complete Stages 004 through 007 route-family by route-family, updating visual baselines only after each family passes manual review.
5. Complete Stage 008 last, with no skipped gates.

## Part Execution Hygiene

Before any part moves from `draft` to `in-progress`, the implementer must create execution artifacts beside that part or under a clearly named `evidence/` folder for the parent phase:

- `checklist.md` copied from `dev-docs/plans/_templates/checklist.template.md` and filled for the specific part.
- `impl.log.md` with append-only dated entries.
- `evidence/` artifacts for command output, screenshots, visual review notes, or manual QA notes.

No part may move to `review` until its checklist is complete, evidence exists, and the implementation log names the final verification commands or manual checks. No stage may move to `complete` without reviewer signoff.

## Production Acceptance Contract

Every completed implementation part must satisfy:

- No new `check:tokens` violations.
- No raw hardcoded visual values in Svelte component styles unless explicitly documented as allowed by the token checker.
- No undefined CSS tokens.
- No unreviewed external image dependency.
- No visible text overflow in buttons, cards, tabs, chips, nav items, modals, or drawers.
- No keyboard trap, lost focus, or hidden focus indicator.
- No motion-only state communication.
- No unreadable text over images or glass layers.
- No mobile horizontal overflow.
- Loading, empty, error, disabled, destructive confirmation, and reduced-motion states are designed and verified.
- New or materially changed shared primitives have focused tests or documented manual evidence when automated testing is not practical.

## Seeded QA Fixture

Stage 001 must create or document a repeatable seeded project fixture with:

- At least one novel with cover art and one without cover art.
- At least one short story.
- Multiple chapters and scenes with varying word counts.
- Characters with and without image assets.
- Locations, lore, plot threads, timeline events, and continuity issues.
- Uploaded images covering global and project albums.
- Empty-state coverage for at least one route family.

This fixture is required for project-route visual regression and manual release review.

## Automated Quality Gates

Run these gates before any stage can be considered complete:

```bash
pnpm run check:tokens
pnpm run lint
pnpm run check
pnpm run test
```

Run visual gates before stage-family signoff and final release:

```bash
pnpm run test:visual
```

Visual baselines must include app-level routes and seeded project-level routes for hub, outline, editor, world-building, continuity, image modal/drawer, empty states, and loading states.

## Manual Release Checklist

Stage 008 must record evidence for:

- Mobile, tablet, desktop, and wide-desktop viewport review.
- Keyboard-only navigation across shell, cards, rails, tabs, drawers, modals, editor controls, AI controls, destructive confirmations, and settings forms.
- Reduced-motion review.
- Screen reader label spot-checks for route landmarks, media cards, progress indicators, modal titles, drawer titles, and command surfaces.
- Image fallback review for books, stories, characters, scenes, world entities, and image galleries.
- Performance review for image-heavy routes and horizontal rails.
- Final route crawl covering app-level, project-level, world-building, redirect, and placeholder surfaces.

## Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Visual ambition reduces authoring efficiency. | High | Keep editor/outline density as a first-class acceptance gate; use cinematic polish for orientation, not decoration. |
| Shared primitives become too rigid for domain surfaces. | Medium | Use snippets and thin domain wrappers; keep primitives visual, not domain-state aware. |
| Route refactors introduce broad regressions. | High | Stabilize shell and primitives first; update one route family at a time with visual baselines. |
| Token cleanup becomes unbounded. | Medium | Fix violations needed for `check:tokens`; document any new token before use. |
| Image-heavy galleries become slow. | Medium | Reserve dimensions, lazy-load, use fallbacks, and manually review scroll performance. |
| Accessibility regressions hide behind visual polish. | High | Include keyboard, focus, reduced-motion, and label checks in every stage exit gate. |

## Documentation Reference

- `dev-docs/plans/plan-015-cinematic-media/ui-consistency.md`
- `dev-docs/design-system.md`
- `dev-docs/project-overview.md`
- `dev-docs/modular-boundaries.md`
- `dev-docs/plans/MASTER-PLAN.md`
- `src/styles/tokens.css`
- `tests/visual/visual-regression.test.ts`
