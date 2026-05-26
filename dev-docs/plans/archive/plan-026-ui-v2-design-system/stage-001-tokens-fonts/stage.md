---
title: Tokens & Fonts
slug: stage-001-tokens-fonts
stage_number: 1
status: complete
owner: Stylist Agent
plan: plan-026-ui-v2-design-system
phases:
  - phase-001-token-rewrite
estimated_duration: 0.5d
risk_level: low
---

## Goal

Rewrite `src/styles/tokens.css` to the v2 warm-umber palette, add Crimson Pro as the
editorial prose face, and reserve mood slots with neutral fallbacks. Everything
downstream depends on this stage.

## Phases

| #   | Phase                                                    | Status     | Est. Duration |
| --- | -------------------------------------------------------- | ---------- | ------------- |
| 001 | [Token Rewrite](phase-001-token-rewrite/phase.md)        | `complete` | 0.5d          |

## Entry Criteria

- v2 kit checked into `novellum-docs/developer/Novellum Design System/`.
- Decision: v2 is source of truth.

## Exit Criteria

- All quality gates green: `pnpm check:tokens`, `pnpm check`, `pnpm lint`,
  `pnpm lint:css`, `pnpm test`.
- Crimson Pro loads (CSP-permitted via `https://fonts.gstatic.com`).
- `--font-prose`, `--header-height`, `--sidebar-width: 208px`,
  `--sidebar-collapsed-width: 56px`, candle / brass / ember / parchment / ink /
  mood-\* tokens defined.

## Notes

- **Landed 2026-05-24.** Surface ramp tuned to `#0f0d0a → #181410 → #221d17 →
  #2c241c → #382e23`; HSL aliases retuned to umber hues.
- Drive-by: pre-existing stylelint error in
  [SettingsMarkdownDocument.svelte](../../../src/lib/components/settings/SettingsMarkdownDocument.svelte)
  swapped to `var(--font-mono)`.
- Local workaround documented: contributors must run
  `pnpm rebuild better-sqlite3` if they hit `NODE_MODULE_VERSION` mismatch.
