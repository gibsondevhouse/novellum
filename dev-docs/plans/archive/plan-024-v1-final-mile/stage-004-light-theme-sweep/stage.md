---
title: Light-Theme Regression Sweep
slug: stage-004-light-theme-sweep
stage_number: 4
status: complete
owner: Stylist Agent
plan: plan-024-v1-final-mile
phases: []
estimated_duration: 1d
risk_level: medium
closed: 2026-05-26
closed_by: supersession
superseded_by: plan-026-ui-v2-design-system
---

## Closeout (2026-05-26)

**Superseded by plan-026-ui-v2-design-system** (closed 2026-05-26).

plan-026 rebuilt the entire surface token system around the v2 warm-umber
palette and re-baselined the Playwright visual regression matrix against
the shipped UI (`tests/visual/__screenshots__/visual/`, regen 2026-05-26).

Light-theme tokens still exist on master in
`src/styles/tokens.css` under `:root[data-theme='light']`, but:

- **Light-theme dual-baseline visual matrix is out of V1 scope.** V1 ships
  with the dark/warm parchment theme as the canonical experience. Users
  may toggle into light; visual fidelity in light is best-effort.
- **WCAG AA contrast sweep against the light surface set is deferred.**
  If a post-V1 plan adopts light as a first-class shipping theme, open a
  new plan; this stage is closed.

The Storybook dual-theme captures and the formal contrast audit listed in
the original exit criteria are **not** required for V1.

## Goal

Re-baseline the visual regression matrix in **both** themes
after the light-theme tokens shipped in v1.0.0-beta.0 and
verify token contrast across the four highest-traffic surfaces.

## Entry Criteria

- Light-theme tokens merged on `master`
  (`:root[data-theme='light']` in `src/styles/tokens.css`).
- `tests/visual/` Playwright suite is runnable locally.

## Exit Criteria

- Storybook captures both themes for the design-system primitives
  (Buttons, PillNav, Toasts, Modals, Sidebar) — committed under
  the existing Storybook stories.
- Playwright visual matrix re-baselined for: editor (writing,
  toolbar, focus mode), Nova panel (chat, tools, conversation),
  reader (book + classic shells, fullscreen toolbar), settings
  shell (every PillNav tab), and the export modal — each in
  light and dark.
- WCAG AA contrast verified for primary text, secondary text,
  link, focus ring, success/warning/error tints against the
  light surface set; failures fixed in `tokens.css` (not in
  components).
- `pnpm check:tokens` still passes.

## Notes

- The audit format from
  [`dev-docs/audits/ui-button-audit-2026-05-06/`](../../../audits/ui-button-audit-2026-05-06/)
  is a good reference shape for the light-theme audit output.
- Do **not** introduce per-component overrides; if a component
  reads wrong on light, the fix lives in tokens.
