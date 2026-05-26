---
title: UI Refactor to Novellum v2 Design System
slug: plan-026-ui-v2-design-system
version: 1.1.0
status: complete
owner: Stylist Agent
created: 2026-05-24
last_updated: 2026-05-26
completed: 2026-05-26
target_completion: 2026-06-15
stages:
  - stage-001-tokens-fonts
  - stage-002-primitives
  - stage-003-chrome
  - stage-004-immersive-surfaces
  - stage-005-hub-library-modules
  - stage-006-regression-cleanup-docs
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
  - tokens
  - visual-regression
---

## Objective

Adopt `novellum-docs/developer/Novellum Design System/` (v2 "author-first" kit) as the
single source of visual truth for the Novellum UI. Re-tune every surface to the warm
umber palette, ship Crimson Pro as the editorial prose face alongside DM Serif Display
and Inter, refactor the global chrome to v2's 208/56 sidebar + 52px serif header,
restyle the immersive surfaces (Editor "Page", Nova "Muse", Reader "Room"), and
restyle every remaining module with v2 primitives.

**v2 vocabulary** (Study / Hub / Page / Room / Muse) lands as UI labels and component
names — **route paths stay unchanged** (`/projects`, `/projects/[id]/...`, `/books/[id]`).

## Scope

**In scope:**

- Rewrite of `src/styles/tokens.css` to v2 warm-umber surfaces + candle / brass /
  ember / parchment / ink editorial palette + reserved mood slots.
- Crimson Pro added as `--font-prose` (loaded via Google Fonts; CSP already permits).
- Refresh of every primitive under `src/lib/components/ui/`, plus 4 new editorial
  primitives (`EditorialEyebrow`, `Logline`, `Ornament`, `DropCap`).
- Refactor of `AppShell`, `AppSidebar` (208/56 widths, dual-band Global / Project
  nav), `AppHeader` (52px, eyebrow + serif title + breath bar).
- Restyle of immersive surfaces: Editor parchment + Crimson Pro prose + Scene Rail +
  breath chips; Nova → Muse marginalia overlay (kept alias); Reader two-page
  parchment spread with Ornament / DropCap / red ribbon / folio numbers.
- Restyle of Project Hub (six narrative tiles + shared spotlight gradient), Library,
  Settings, Outline, Continuity, World-Building, Story-Bible, Onboarding, Planning
  surfaces, AI suggestion / Rewrite overlays.
- Visual-regression baseline regen, dead-style sweep, `/styles` showcase rebuild,
  docs sync (`dev-docs/02-architecture/frontend.md`, `dev-docs/04-modules/*`,
  `CLAUDE.md`, `AGENTS.md`).

**Out of scope:**

- Route-segment renames (URLs stay).
- Per-project mood theming engine (slots reserved with neutral fallbacks; a follow-up
  plan wires `Project.cover` palette to `--mood-*`).
- Atmospheric Study landing (candle vignette / greeting / streak chips on
  `/projects`). Library remains a restyled gradient-cover grid.
- Logic changes (editor state, Nova chat protocol, autosave, reader controller,
  repositories — untouched).

## Stages

| #   | Stage                                                                    | Status        | Notes                        |
| --- | ------------------------------------------------------------------------ | ------------- | ---------------------------- |
| 001 | [Tokens & Fonts](stage-001-tokens-fonts/stage.md)                        | `complete`    | landed 2026-05-24            |
| 002 | [Primitives](stage-002-primitives/stage.md)                              | `in-progress` | new editorial primitives in  |
| 003 | [Chrome](stage-003-chrome/stage.md)                                      | `draft`       | sidebar 208/56, header 52px  |
| 004 | [Immersive Surfaces](stage-004-immersive-surfaces/stage.md)              | `draft`       | Page + Muse + Room           |
| 005 | [Hub, Library & Modules](stage-005-hub-library-modules/stage.md)         | `draft`       | restyle the long tail        |
| 006 | [Regression, Cleanup & Docs](stage-006-regression-cleanup-docs/stage.md) | `complete` | baseline regen + docs/showcase closed |

## Quality Gates

All stages must pass these gates before the plan is marked `complete`:

- [ ] **lint** — `pnpm lint` and `pnpm lint:css` clean
- [ ] **typecheck** — `pnpm check` clean (svelte-check + tsc)
- [ ] **tests** — `pnpm test` (Vitest) passes
- [ ] **tokens** — `pnpm check:tokens` zero violations
- [ ] **visual-regression** — `pnpm exec playwright test tests/visual/` green against
      regenerated baselines (Stage 006 regen gate)
- [ ] **docs_sync** — frontend docs + module docs reflect new surfaces

## Risks & Mitigations

| Risk                                                              | Likelihood | Mitigation                                                                                          |
| ----------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| Visual-regression suite churns across nearly every screenshot     | high       | Budget Stage 006 for full baseline regen + manual diff review; no ad-hoc snapshot updates earlier.  |
| Nova → Muse rename leaks into agent type names                    | medium     | Surface label only — keep `NovaMessage`, `NovaPanel` types and store IDs. Export alias for panel.   |
| Per-project mood theming temptation expands scope                 | medium     | Slots reserved with neutral fallbacks; explicit follow-up plan owns the wiring.                     |
| Crimson Pro bundle weight via Google Fonts on Tauri offline mode  | low        | Optional follow-up to self-host Crimson Pro WOFF2 in `src/lib/assets/fonts/`.                       |
| `better-sqlite3` ABI drift breaks tests on contributors' Node     | low        | Documented `pnpm rebuild better-sqlite3` workaround in stage-001 impl log.                          |

## Notes

- **Decisions captured** (from initial planning call):
  - v2 author-first kit is the source of truth.
  - URLs unchanged; v2 vocabulary surfaces as labels and component names only.
  - Token namespace stays `--color-*` (we did *not* adopt v2's `--candle` /
    `--night` short names). Added candle / brass / ember / parchment / ink under
    the existing prefix.
  - Mood engine deferred (slots reserved with neutral fallbacks).
  - Crimson Pro + Nova-as-marginalia + parchment Reader spread + Hub six tiles
    all IN scope.
  - Atmospheric Study landing OUT of scope.
- **Branching:** Stages 004 (immersive) and 005 (hub / modules) can be developed in
  parallel by separate workers; they touch disjoint module folders.
- **Tauri:** `src-tauri/` capabilities and titlebar do NOT change. Verify after
  Stage 003 that the new 52px header still aligns with the native titlebar.
- **Light theme:** v2 supports light via `<html data-theme="light">` (parchment
  surfaces `#f5f3ee`). Every stage must confirm both themes.
