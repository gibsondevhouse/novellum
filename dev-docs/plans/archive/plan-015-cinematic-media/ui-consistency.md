# Cinematic Media Gallery UI/UX Refactor Plan

## Plan Header

| Field | Value |
| --- | --- |
| Status | `draft` |
| Owner | `Planner / Architect / Stylist` |
| Primary artifact | `ui-consistency.md` |
| Related active plan | `dev-docs/plans/plan-system-refactoring/plan-system-refactoring.md` |
| Related references | `dev-docs/plans/MASTER-PLAN.md`, `dev-docs/design-system.md`, `dev-docs/project-overview.md`, `dev-docs/roadmap.md` |

## Objective

Transform every visible Novellum surface into a polished cinematic media gallery and novel production suite. The refactor must replace generic list-and-form screens with immersive, media-forward, accessible workflows that help authors orient themselves, inspect creative assets, plan structure, write scenes, review continuity, and manage production tasks without losing control.

This plan is a UI/UX refactor plan only. It does not change database schema, AI runtime behavior, persistence contracts, or feature scope beyond the visual and interaction systems needed to make current surfaces feel cohesive and production-grade.

## Dependency Note

This UI refactor depends on the active system stabilization work. Implementation must respect the current Svelte 5 direction, strict module boundaries, server/client data contracts, and test discipline described in the master plan. If stabilization work changes data ownership or route contracts, this plan should adapt to those contracts rather than create competing state or persistence patterns.

## Current Baseline Evidence

The current `ui-consistency.md` is a short concept checklist. It names the right visual direction but is not comprehensive enough to drive implementation across the application.

Known baseline facts:

- `--radius-xl`, `--radius-2xl`, and `--gradient-spotlight` already exist in `src/styles/tokens.css`; the UI plan must verify and enforce them instead of listing them as new token work.
- `pnpm run check:tokens` currently fails with 18 visual-token violations across 9 files.
- Current token violations include hardcoded `rgba()` values, hardcoded hex accents, and raw box-shadow values in world-building, AI, bible, and project components.
- Several visible surfaces reference undefined design tokens: `--color-brand`, `--font-body`, `--transition-fast`, `--ease-out-back`, `--color-surface`, and `--color-border-hover`.
- Some shipped pages already point toward the target aesthetic, but the current implementation is inconsistent across app-level routes, project routes, modals, drawers, image galleries, empty states, and future-state screens.

Baseline commands to rerun before implementation:

```bash
pnpm run check:tokens
pnpm run lint
pnpm run check
pnpm run test
```

## Experience North Star

Novellum should feel like a dark, focused, cinematic novel production system. It should not feel like a generic CRUD dashboard, a settings-heavy admin panel, or a disconnected set of forms.

The target experience combines:

- **Spotlight-first orientation**: each major route begins with a clear first-viewport focal point that tells the author where they are and what matters next.
- **Media-first entities**: books, stories, characters, scenes, locations, lore, plot threads, timeline events, images, and AI sessions receive visual treatments even when no uploaded artwork exists.
- **Gallery navigation**: creative collections use poster grids, horizontal rails, dossier shelves, storyboards, or asset galleries instead of plain stacked lists unless dense comparison is the correct workflow.
- **Editorial density**: writing and planning workflows remain precise and productive; cinematic treatment must never hide the manuscript, outline hierarchy, continuity status, or primary actions.
- **Luminance depth**: surfaces follow the existing dark design system hierarchy from `--color-surface-base` through elevated layers, using borders sparingly and intentionally.
- **Glass overlays**: floating navigation, command bars, metadata overlays, and modal chrome use glass treatment where it preserves context and avoids heavy boxed layouts.
- **Precise motion**: hover, page entry, drawer, modal, rail, and spotlight motion must be tokenized, restrained, and disabled or simplified for reduced-motion users.
- **Author-in-control AI**: AI controls and suggestions must remain reviewable, explicit, and secondary to the author's manuscript and project data.

Usability guardrail: cinematic polish must improve orientation, confidence, and creative flow. It must not bury core writing/editing actions, reduce readability, make forms harder to scan, or introduce inaccessible motion.

## Surface Inventory

Every visible route, layout, shared component, state, redirect, and placeholder must be covered by this refactor.

### Global Shell Surfaces

- Root layout and main scroll container: `src/routes/+layout.svelte`.
- Primary sidebar: `AppSidebar`, `SidebarSection`, `SidebarItem`, `ActiveProjectSection`.
- Header and contextual nav: `AppHeader`, project context title, world-building pill nav, utility actions.
- Secondary navigation: `SecondaryLeftSidebar`, breadcrumbs, project mode navigation.
- Persistent UI: onboarding modal, toast container, AI panel, model selector, rewrite options modal, export/import modals, delete dialogs.
- System states: empty states, loading skeletons, error banners, save/sync statuses, disabled states, confirmation states, future-state pages, and redirect pass-through pages.

### App-Level Routes

| Route | Target Treatment |
| --- | --- |
| `/` | Home library with cinematic spotlight, continue-reading hero, media rails, and cover-led project cards. |
| `/projects` | Unified project gallery with stories and books as media collections rather than plain columns. |
| `/books` | Book shelf with spotlight action, poster grid/rail, and polished create flow. |
| `/stories` | Short-form story gallery with compact poster treatment and fast creation. |
| `/images` | Full asset gallery with albums, previews, assignment drawer, and inspection modal. |
| `/nova` | Cinematic AI console with focused prompt stage, conversation mode, model controls, and quick access actions. |
| `/settings` | Calm configuration workspace with cinematic panels, not generic form blocks. |
| `/settings/migrate` | Guided migration/restore experience with clear risk states and polished progress/error handling. |
| `/styles` | Writing styles and prompt configuration as a curated preset/custom collection interface. |

### Project-Level Routes

| Route | Target Treatment |
| --- | --- |
| `/projects/[id]/hub` | Story identity dashboard with cover-led hero, status instrumentation, floating actions, and production cards. |
| `/projects/[id]/outline` | Storyboard/planning room with hierarchy navigator, act/chapter/scene panels, and scene-frame visual language. |
| `/projects/[id]/editor` | Focused drafting studio with scene navigator, manuscript canvas, story compass, AI command tools, and low-friction save/status chrome. |
| `/projects/[id]/editor/[sceneId]` | Deep-linked scene editor preserving drafting studio treatment and contextual scene focus. |
| `/projects/[id]/world-building` | Cinematic world overview for Personae, Atlas, Archive, Threads, and Chronicles. |
| `/projects/[id]/continuity` | Continuity command center with issue triage, prompt/style controls, and visible review flow. |
| `/projects/[id]/consistency` | Redirect/pass-through surface that must never show an unfinished blank or rough transition. |
| `/projects/[id]/arcs` | Future arc planner surface with polished placeholder, route context, and clear next action. |
| `/projects/[id]/arcs/[arcId]` | Future arc detail surface with polished placeholder and back navigation. |

### World-Building Section Routes

All world-building routes must share one cinematic domain language while preserving each section's semantics.

- Personae: `/world-building/characters`, `/characters/individuals`, `/characters/[charId]`, `/characters/notes`, `/factions`, `/species`.
- Atlas: `/world-building/locations`, `/locations/realms`, `/locations/landmarks`, `/locations/maps`, `/locations/notes`.
- Archive: `/world-building/lore`, `/lore/myths`, `/lore/technology`, `/lore/traditions`, `/lore/notes`.
- Threads: `/world-building/plot-threads`, `/plot-threads/major-arcs`, `/plot-threads/sub-plots`, `/plot-threads/motivations`, `/plot-threads/notes`.
- Chronicles: `/world-building/timeline`, `/timeline/eras`, `/timeline/key-events`, `/timeline/personal-histories`, `/timeline/notes`.
- Legacy bible redirects: `/projects/[id]/bible`, `/bible/characters`, `/bible/characters/[charId]`, `/bible/locations`, `/bible/lore`, `/bible/plot-threads`, `/bible/timeline`.

### Shared State Surfaces

These states must be designed as first-class UI, not leftovers:

- Empty shelves, empty entity collections, empty scene lists, empty chat state.
- Loading skeletons for library cards, project cards, media rails, settings panels, and project dashboards.
- Error states for API/DB/AI failures.
- Destructive confirmation states.
- Save/autosave states.
- Disabled, locked, and future-state actions.
- Modal and drawer open/close states.
- Mobile collapsed shell states.
- Reduced-motion states.

## Design System Foundation

### Token Policy

Use a verify-then-extend approach:

- Verify existing tokens in `src/styles/tokens.css` before adding anything new.
- Do not duplicate `--radius-xl`, `--radius-2xl`, or `--gradient-spotlight`; they already exist.
- Remove undefined token references or replace them with documented tokens.
- Add new tokens only when a repeated cinematic pattern cannot be expressed cleanly with existing tokens.
- Keep all color, shadow, radius, spacing, typography, and motion values tokenized.
- All new token names must be documented in `dev-docs/design-system.md`.

Required token cleanup:

- Replace `--color-brand` with an existing accent token or define a documented brand token.
- Replace `--font-body` with `--font-sans` unless a documented body alias is intentionally added.
- Replace `--transition-fast` with composed `--duration-*` and `--ease-*` usage.
- Replace `--ease-out-back` with an existing documented easing token or add a documented cinematic easing token.
- Replace `--color-surface` and `--color-border-hover` with existing surface/border tokens or documented aliases.
- Replace raw `rgba()`, hex colors, and raw box shadows in component styles with tokens.

### Primitive Contracts

The implementation should standardize these primitives before broad route refactors.

| Primitive | Purpose | Required Props / Inputs |
| --- | --- | --- |
| `SpotlightHero` | First-viewport identity and orientation block for major surfaces. | `title`, `eyebrow`, `description`, `imageUrl`, `fallback`, `meta`, `actions`, `tone` |
| `EntityPoster` | Visual entity card for books, stories, characters, scenes, places, lore, images, and arcs. | `title`, `subtitle`, `imageUrl`, `fallbackLabel`, `href`, `aspect`, `meta`, `status`, `actions` |
| `MediaRail` | Horizontal cinematic collection row with keyboard-safe scrolling. | `title`, `description`, `items`, `ariaLabel`, `snap`, `actions` |
| `GlassBar` | Floating contextual navigation or metadata overlay. | `position`, `ariaLabel`, `actions`, `sticky` |
| `CommandDock` | Floating primary action cluster for workflow surfaces. | `position`, `ariaLabel`, `actions`, `sticky` |
| `StatusRing` | Instrumentation for word count, progress, continuity, pacing, and completion metrics. | `label`, `value`, `max`, `tone`, `description` |
| `VisualTile` | Compact visual affordance for settings, prompts, world domains, and structured entities. | `title`, `description`, `icon`, `imageUrl`, `href`, `status`, `actions` |
| `CinematicEmptyState` | Intentional empty/loading/error shell with a visual anchor and actions. | `title`, `description`, `visual`, `primaryAction`, `secondaryAction` |
| `SideDrawer` | Shared drawer pattern for edit forms, asset assignment, details, and settings. | `title`, `description`, `open`, `onClose`, `actions`, `children` |

Implementation rules:

- Use Svelte 5 `$props()` and snippets for actions/content slots.
- Keep shared primitives in `src/lib/components/ui/` unless they become domain-specific.
- Domain modules may wrap primitives, but should not duplicate primitive styling.
- All primitives must support keyboard navigation, focus rings, reduced motion, and responsive dimensions.

### Image Policy

- Uploaded covers/assets are the primary image source.
- Deterministic generated placeholders are the fallback for missing covers, portraits, scenes, locations, and lore.
- Placeholders should use title initials, project/entity metadata, surface tokens, subtle texture, and stable aspect ratios.
- No route should depend on external stock imagery.
- Non-critical images must lazy-load.
- Images must specify correct `alt` behavior: decorative images use empty alt text; meaningful images describe the entity.
- Poster and preview containers must reserve dimensions before images load to prevent layout shift.

### Motion Policy

Motion should feel tactile and editorial, never busy.

- Page entry: fade plus subtle translate using `--duration-page` and `--ease-editorial`.
- Poster lift: small translate/scale with shadow elevation using tokens.
- Rail scroll: native scroll with snap, visible controls where needed, keyboard accessible.
- Drawer: slide/fade with focus trap and reduced-motion fallback.
- Modal: fade/backdrop blur with reduced-motion fallback.
- Hover overlays: metadata reveal without shifting card geometry.
- Reduced motion: disable decorative movement while preserving state changes.

## Stage Plan

### Stage 001: Baseline Audit and Visual Target

Goal: create a precise map of current UI debt and target outcomes before broad refactors begin.

Tasks:

- [ ] Capture screenshots for every app-level route at desktop and mobile widths.
- [ ] Seed a representative project and capture project hub, outline, editor, world-building, continuity, images modal, and empty/loading states.
- [ ] Record current `pnpm run check:tokens` output and classify violations by hardcoded color, hardcoded shadow, hardcoded motion, and undefined token usage.
- [ ] Inventory all visible shared components, modals, drawers, sidebars, toasts, skeletons, and empty states.
- [ ] Identify which existing components can be reused, wrapped, or replaced by the new primitives.
- [ ] Define acceptance screenshots for the target aesthetic before implementation begins.

Acceptance:

- Every current visible surface has an audit entry.
- Token debt and undefined token usage are listed with file paths.
- Project-level routes have seeded test data for visual validation.

### Stage 002: Tokens and Gallery Primitives

Goal: create the reusable foundation that every surface can adopt.

Tasks:

- [ ] Fix undefined token references and current visual-token violations.
- [ ] Document any newly added tokens in `dev-docs/design-system.md`.
- [ ] Implement or standardize `SpotlightHero`, `EntityPoster`, `MediaRail`, `GlassBar`, `CommandDock`, `StatusRing`, `VisualTile`, `CinematicEmptyState`, and `SideDrawer`.
- [ ] Consolidate repeated button, form, card, modal, drawer, and loading-state styles into shared primitives.
- [ ] Add primitive-focused tests where component behavior or accessibility is non-trivial.
- [ ] Update visual examples or a styles route section to demonstrate primitive usage.

Acceptance:

- `pnpm run check:tokens` passes.
- New primitives use tokenized styles only.
- New primitives are accessible by keyboard and degrade cleanly on mobile.

### Stage 003: Global Shell and Persistent Chrome

Goal: make the persistent application frame feel cinematic, calm, and consistent.

Tasks:

- [ ] Refactor `AppSidebar` into a polished navigation rail with glass/luminance depth, stable collapsed state, clear active state, and no layout jump.
- [ ] Refactor `AppHeader` into contextual cinematic chrome with consistent utility actions and route-aware navigation.
- [ ] Standardize breadcrumbs, project context titles, active project navigation, and world-building pill navigation.
- [ ] Refactor onboarding, toasts, AI panel, model selector, rewrite modal, export/import modals, and delete dialogs to shared modal/drawer patterns.
- [ ] Ensure all overlays trap or restore focus correctly.
- [ ] Verify shell behavior at mobile, tablet, desktop, and wide desktop.

Acceptance:

- Persistent navigation and utility chrome look cohesive on every route.
- No header/sidebar element overlaps or truncates primary actions.
- Modal and drawer interactions are keyboard-safe.

### Stage 004: Library and Project Galleries

Goal: convert app-level creative collections into polished media shelves.

Tasks:

- [ ] Refactor `/` into a cinematic home library with continue-reading spotlight, rail sections, and cover-led cards.
- [ ] Refactor `/projects` into a unified gallery for stories and books with clear collection grouping and creation actions.
- [ ] Refactor `/books` into a dedicated long-form shelf with spotlight, poster grid/rail, loading skeletons, and create flow.
- [ ] Refactor `/stories` into a short-form gallery with compact media cards and fast creation.
- [ ] Standardize project/story/book empty states with `CinematicEmptyState`.
- [ ] Ensure project cards reveal quick metadata without shifting layout.

Acceptance:

- `/`, `/projects`, `/books`, and `/stories` each have a strong first-viewport focal point.
- All project/story/book cards have visual poster treatment with deterministic fallbacks.
- Loading states match final card geometry.

### Stage 005: Project Production Suite

Goal: make the project hub feel like the control room for a novel.

Tasks:

- [ ] Refactor `/projects/[id]/hub` around a cover-led `SpotlightHero`.
- [ ] Convert structural metrics and word-count progress into `StatusRing` or premium progress instrumentation.
- [ ] Move export/delete and other project actions into a `CommandDock` or contextual `GlassBar`.
- [ ] Refactor project details into cohesive visual panels with consistent edit affordances.
- [ ] Ensure cover upload, synopsis, metadata, writing style, status, and target word count feel like one production dashboard.

Acceptance:

- The project hub communicates story identity, progress, and next action within the first viewport.
- Destructive and utility actions remain visible but not visually dominant.
- All hub panels share tokenized surface hierarchy.

### Stage 006: World-Building and Continuity

Goal: turn world-building and continuity into visual dossier systems.

Tasks:

- [ ] Refactor `/world-building` into a cinematic domain overview for Personae, Atlas, Archive, Threads, and Chronicles.
- [ ] Refactor top-section landing pages into visual domain shelves with clear semantic hierarchy.
- [ ] Convert entity lists into poster grids, dossiers, tiles, timelines, or dense tables depending on workflow need.
- [ ] Refactor character/entity detail pages into cinematic dossiers with portrait/visual anchors, tabbed or sectioned detail panels, relationship context, and continuity cues.
- [ ] Refactor continuity issues into a triage surface with severity/status visual language, grouped review lanes, and clear resolution actions.
- [ ] Refactor prompt/style panels under continuity into shared configuration primitives.
- [ ] Polish redirects and future-state pages for bible, consistency, and arcs routes.

Acceptance:

- Every world-building domain has a visual identity and obvious entry path.
- Entity detail pages feel like dossiers, not raw forms.
- Continuity issues are easier to scan, group, and resolve.

### Stage 007: Workflow Surfaces

Goal: polish the core authoring workflows without reducing utility.

Tasks:

- [ ] Refactor `/outline` into a storyboard/planning room with scene-frame language, hierarchy clarity, and stable detail panels.
- [ ] Refactor `/editor` and `/editor/[sceneId]` into a focused drafting studio with a calm manuscript canvas, scene navigator, story compass, and unobtrusive AI actions.
- [ ] Add a focus mode policy for the editor: chrome recedes during active writing but remains recoverable and keyboard accessible.
- [ ] Refactor `/nova` into a cinematic AI console with a strong empty state, prompt stage, quick suggestions, conversation mode, and model context.
- [ ] Refactor `/images` into a true asset gallery with album shelves, image inspection, assignment drawer, deletion confirmation, and image metadata.
- [ ] Refactor `/settings`, `/settings/migrate`, and `/styles` into polished configuration workspaces with consistent tabs, panels, drawers, and form states.

Acceptance:

- Writing and planning workflows remain dense enough for serious work.
- Editor focus mode does not hide save status, scene context, or recovery actions.
- Nova, Images, Settings, and Styles no longer feel visually disconnected from the production-suite aesthetic.

### Stage 008: Verification and Rollout

Goal: prove the refactor works across real surfaces and does not regress accessibility or performance.

Tasks:

- [ ] Update visual regression tests for current app-level routes.
- [ ] Add seeded project-route visual tests for hub, outline, editor, world-building, continuity, images modal, and important empty/loading states.
- [ ] Run token, lint, type, unit, integration, and visual gates.
- [ ] Perform manual viewport review at mobile, tablet, desktop, and wide desktop sizes.
- [ ] Perform keyboard-only navigation review.
- [ ] Perform reduced-motion review.
- [ ] Verify image lazy loading, fallback rendering, and nonblank poster/asset visuals.
- [ ] Record evidence in the plan artifacts before marking the refactor complete.

Acceptance:

- `pnpm run check:tokens` passes with zero violations.
- `pnpm run lint`, `pnpm run check`, and `pnpm run test` pass.
- `pnpm run test:visual` passes or updates baselines with reviewed screenshots.
- No visible surface has unresolved placeholder styling, undefined tokens, unreadable overlays, or broken mobile layout.

## Per-Surface Acceptance Rules

Every implementation slice must satisfy these rules:

- Every route has a clear first-viewport focal point.
- Every creative entity card has a visual treatment, even when no uploaded image exists.
- Lists that represent creative assets become rails, grids, dossiers, storyboards, timelines, or tables only when dense comparison is the correct workflow.
- Empty states feel intentional, domain-aware, and actionable.
- Loading states use skeletons matching final layout geometry.
- Error states explain the failed action and provide a recovery path.
- Dialogs and drawers are consistent, keyboard-safe, and visually integrated with the shell.
- Destructive actions require clear confirmation and visual separation from primary creative actions.
- Mobile layouts avoid horizontal overflow and preserve primary actions without overlapping text.
- Text must not clip inside buttons, cards, tabs, chips, or nav items.
- All interactive elements have visible focus states.
- All new motion respects reduced-motion preferences.
- All new imagery reserves layout dimensions before load.

## Public Interfaces and Types

These are planned UI contracts. They are not database or API contracts.

### `SpotlightHero`

Purpose: first-viewport identity, orientation, and primary action surface.

Required inputs:

- `title`
- `eyebrow`
- `description`
- `imageUrl`
- `fallback`
- `meta`
- `actions`
- `tone`

### `EntityPoster`

Purpose: visual card for creative entities.

Required inputs:

- `title`
- `subtitle`
- `imageUrl`
- `fallbackLabel`
- `href`
- `aspect`
- `meta`
- `status`
- `actions`

### `MediaRail`

Purpose: horizontal media shelf.

Required inputs:

- `title`
- `description`
- `items`
- `ariaLabel`
- `snap`
- `actions`

### `GlassBar` / `CommandDock`

Purpose: floating contextual navigation, action cluster, or workflow command surface.

Required inputs:

- `position`
- `ariaLabel`
- `actions`
- `sticky`

### `StatusRing`

Purpose: compact visual instrumentation.

Required inputs:

- `label`
- `value`
- `max`
- `tone`
- `description`

### `CinematicEmptyState`

Purpose: polished empty/loading/error state shell.

Required inputs:

- `title`
- `description`
- `visual`
- `primaryAction`
- `secondaryAction`

## Testing and Verification Plan

The eventual UI implementation must pass:

- `pnpm run check:tokens`
- `pnpm run lint`
- `pnpm run check`
- `pnpm run test`
- `pnpm run test:visual`

Visual regression coverage must include:

- App-level routes: `/`, `/projects`, `/books`, `/stories`, `/images`, `/nova`, `/settings`, `/settings/migrate`, `/styles`.
- Project-level routes with seeded data: `/projects/[id]/hub`, `/outline`, `/editor`, `/editor/[sceneId]`, `/world-building`, `/continuity`.
- World-building section and detail representatives from Personae, Atlas, Archive, Threads, and Chronicles.
- Image modal and assignment drawer.
- Empty, loading, error, disabled, confirmation, and reduced-motion states.

Manual verification must include:

- Mobile, tablet, desktop, and wide desktop viewport checks.
- Keyboard-only navigation through shell, rails, posters, drawers, modals, tabs, editor controls, AI controls, and destructive confirmations.
- Screen reader label review for navigation, poster links, media controls, progress indicators, and modal/drawer titles.
- Reduced-motion review.
- Image fallback and lazy-loading review.
- Canvas/asset nonblank checks where visual previews are expected.

## Assumptions

- `ui-consistency.md` remains the working root-level strategic UI refactor document unless the plan is later promoted into `dev-docs/plans/plan-###-*`.
- "Every visible surface" means every current SvelteKit page/layout plus shared visible components, including redirects, future placeholders, modals, drawers, toasts, onboarding, empty states, loading states, and error states.
- "Cinematic media gallery" means Apple TV / Linear-inspired polish adapted to a serious writing tool: rich visual hierarchy, atmospheric depth, media-forward navigation, and precise motion without sacrificing writing density, accessibility, or author control.
- Actual Svelte/CSS implementation should happen after this document is accepted as the plan.

## Non-Goals

- Do not change persistence models, database schema, AI routing, OpenRouter behavior, or server API contracts as part of this UI plan.
- Do not add external stock-image dependencies.
- Do not make every workflow a low-density gallery if a dense table, outline, or editor layout better serves the author's task.
- Do not bypass existing module boundaries to share UI behavior.
- Do not introduce cinematic motion that is unavailable to reduced-motion users or required for comprehension.
