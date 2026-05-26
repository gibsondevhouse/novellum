---
title: Settings Information Architecture
slug: plan-022-settings-ia
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-05-03
last_updated: 2026-05-06
target_completion: 2026-05-31
stages:
  - stage-001-settings-shell-and-pillnav
  - stage-002-appearance-category
  - stage-003-defaults-category
  - stage-004-shortcuts-category
  - stage-005-ai-category
  - stage-006-data-category-migration
  - stage-007-verification
dependencies:
  - plan-020-fixes-and-nova-identity
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - manual_smoke
---

## Objective

Reorganize settings from a single flat page (currently AI keys +
data portability only) into a discoverable, categorized surface
that hosts every persistent user preference in the app. Establish
the **preferences foundation** that downstream plans (most directly
plan-023 editor redesign) will read from.

Source: [problems-found-001.md](../../qa-docs/user-problems/problems-found-001.md) Problem 004 / 004b.

## Scope

**In scope:**

- New settings shell using existing PillNav primitive
  ([src/lib/components/ui/PillNav.svelte](../../../src/lib/components/ui/PillNav.svelte)) for top-level
  category navigation.
- Categories shipping in this plan: **Appearance**, **Defaults**,
  **Shortcuts**, **AI**, **Data**.
- Appearance: theme (light/dark/auto), font size, line spacing.
- Defaults: default reader view (book/scroll), default project type,
  default AI model, default home page (library/last read/last
  project).
- Shortcuts: customize keybindings for the documented core actions
  (new project, open settings, toggle sidebar, save scene, view in
  reader). Persists per-user.
- AI: OpenRouter (and scaffolding for future ollama / lm-studio,
  not wired). Each provider has a sub-section with: link to docs,
  link to provider dashboard, key paste field. OpenRouter key
  bug already fixed in plan-020; this plan only restructures.
- Data: relocate the existing portability surface into the new
  category shell; no behavioral change.
- Preferences storage: a single typed preferences table in SQLite
  (`/api/db/preferences`) with `getPreference` / `setPreference`
  service. **Default home page** is read from this table by
  `routes/+page.ts` on every load (per requirement 5: stable, easy
  to change).

**Out of scope:**

- OpenRouter balance display, ollama integration, lm-studio
  integration. All parked in [roadmap.md](../../roadmap.md).
- Editor preference *consumption* (font size in the editor pane,
  default reader on "view in reader") — owned by plan-023.
- Reader scroll/book toggle implementation — plan-021 ships book
  view only; this plan only persists the preference.

## Stages

| # | Stage | Status | Est. |
| --- | --- | --- | --- |
| 001 | [Settings shell + PillNav](stage-001-settings-shell-and-pillnav/stage.md) | `draft` | 1d |
| 002 | [Appearance category](stage-002-appearance-category/stage.md) | `draft` | 1d |
| 003 | [Defaults category](stage-003-defaults-category/stage.md) | `draft` | 1d |
| 004 | [Shortcuts category](stage-004-shortcuts-category/stage.md) | `draft` | 1.5d |
| 005 | [AI category](stage-005-ai-category/stage.md) | `draft` | 1d |
| 006 | [Data category migration](stage-006-data-category-migration/stage.md) | `draft` | 0.5d |
| 007 | [Verification](stage-007-verification/stage.md) | `draft` | 0.5d |

## Quality Gates

- [ ] **lint** — zero lint errors
- [ ] **typecheck** — zero type errors
- [ ] **tests** — preferences service ≥80% line coverage; UI tests
      cover each category
- [ ] **boundaries** — settings module respects eslint-boundaries
- [ ] **manual_smoke** — change every preference, restart app,
      confirm persistence

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Shortcut customization conflicts with browser/OS bindings | medium | document reserved combos; validate against a deny-list on save |
| Preferences schema churn cascades into plan-023 | medium | freeze preferences interface in stage-001 before consumers integrate |
| "Default home page" routing causes redirect loop | low | implement as load-time redirect with a guard against self-target |
