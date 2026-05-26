---
title: Settings & Onboarding
slug: phase-003-settings-onboarding
phase_number: 3
status: complete
owner: Stylist Agent
stage: stage-005-hub-library-modules
parts:
  - part-001-pillnav-and-pickers
estimated_duration: 0.5d
---

## Goal

Bring Settings into the v2 surface:

- `PillNav` active state recoloured to a candle-tinted background +
  brass inset rule (source-of-truth primitive change).
- Settings page section headings restyled as brass eyebrows.
- Radio-pill pickers (`appearance`, `defaults`) reconverged on
  candle/brass active state and the `--color-border-focus` token
  instead of the legacy `--color-nova-blue`.
- Stray `--color-nova-blue` colour references in `settings/data`
  swapped to `--color-info` (semantic).

## Parts

| #   | Part                                                                              | Status        |
| --- | --------------------------------------------------------------------------------- | ------------- |
| 001 | [PillNav + Pickers](part-001-pillnav-and-pickers/part.md)                         | `complete`    |

## Exit Criteria

- `PillNav.active` reads as candle-glow on warm umber.
- Appearance/defaults active pill reads candle, focus reads
  `--color-border-focus`.
- Appearance section eyebrows render as 9px brass uppercase.
- No `--color-nova-blue` references left under `src/routes/settings/`.
- All gates clean.

## Follow-ups (out of scope for this phase)

- Onboarding modal v2 anatomy (`OnboardingModal.svelte`).
- Remaining settings pages (privacy, legal, about, updates, backup,
  export-defaults, shortcuts, ai) — section-heading sweep.
- Visual regression baselines (Stage 006).
