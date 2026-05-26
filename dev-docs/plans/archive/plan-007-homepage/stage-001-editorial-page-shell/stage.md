---
title: Editorial Page Shell
slug: stage-001-editorial-page-shell
stage_number: 1
status: draft
owner: Frontend Agent
plan: plan-007-homepage
phases:
  - phase-001-header-and-layout
  - phase-002-loading-and-empty-states
estimated_duration: 2d
risk_level: low
---

## Goal

Replace the bare page shell with an editorial-grade layout: display-font page heading, constrained column, and purpose-built loading/empty states that eliminate CLS and establish the literary register.

## Phases

| #   | Phase                                                                          | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------------ | ------- | ------------- |
| 001 | [Header and Layout](phase-001-header-and-layout/phase.md)                      | `draft` | 1d            |
| 002 | [Loading and Empty States](phase-002-loading-and-empty-states/phase.md)        | `draft` | 1d            |

## Entry Criteria

- `plan-007-homepage/plan.md` is `active`
- `src/styles/tokens.css` contains `--font-display`, `--text-5xl`, `--text-6xl`, `--shadow-*`, `--ease-editorial`, `--duration-enter` (verify against `dev-docs/design-system.md`)
- `src/app.html` contains the DM Serif Display Google Fonts `<link>` embed

## Exit Criteria

- Page heading renders in DM Serif Display at `--text-5xl` with `--tracking-tight`
- Page column is constrained to `960px` max-width, centred
- Loading state shows skeleton cards (no plain text)
- Empty state uses display-font headline with editorial copy
- `pnpm run lint` and `pnpm run check` pass with zero errors

## Notes

- All edits are to `src/routes/+page.svelte` and any new components placed in `src/modules/project/components/`
- Do not modify project store, Dexie layer, or dialog internals
