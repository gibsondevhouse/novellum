---
title: Token Rewrite
slug: phase-001-token-rewrite
phase_number: 1
status: complete
owner: Stylist Agent
stage: stage-001-tokens-fonts
parts:
  - part-001-tokens-and-fonts
estimated_duration: 0.5d
---

## Goal

Land the v2 token rewrite and Crimson Pro font loading in a single pass.

## Parts

| #   | Part                                                                       | Status     |
| --- | -------------------------------------------------------------------------- | ---------- |
| 001 | [Tokens & Fonts](part-001-tokens-and-fonts/part.md)                        | `complete` |

## Exit Criteria

- `src/styles/tokens.css` reflects v2 warm-umber surface ramp + new editorial
  palette + reserved mood slots.
- `src/app.html` loads Crimson Pro and Inter alongside DM Serif Display.
- All quality gates green.
