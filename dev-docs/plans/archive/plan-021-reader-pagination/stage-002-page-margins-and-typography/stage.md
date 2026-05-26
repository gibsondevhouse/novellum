---
title: Page Margins & Typography
slug: stage-002-page-margins-and-typography
stage_number: 2
status: draft
owner: Stylist Agent
plan: plan-021-reader-pagination
phases:
  - phase-001-tokens-and-page-box
  - phase-002-typography-scale
  - phase-003-tests
estimated_duration: 1d
risk_level: low
---

## Goal

Define and apply the reader's page box: outer margins, inner
gutters, max measure (~65–75ch), and a typography scale tuned for
long-form reading. All sizes via design tokens — no raw pixel
values.

## Entry Criteria

- Stage 001 (empty state) merged.
- Design tokens for spacing and typography exist in `src/styles/tokens.css`.

## Exit Criteria

- A reader page renders with visible top/right/bottom/left margins
  matching the spec.
- Body text caps at the agreed measure regardless of viewport width.
- Typography scale matches the design system at all heading levels.
- Visual regression baseline captured for "blank reader page".
