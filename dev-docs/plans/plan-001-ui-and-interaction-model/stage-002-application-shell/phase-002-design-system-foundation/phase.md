---
title: Design System Foundation
slug: phase-002-design-system-foundation
phase_number: 2
status: complete
owner: Frontend Agent
stage: stage-002-application-shell
parts:
  - part-001-css-token-layer
  - part-002-base-typography-and-spacing
estimated_duration: 2d
---

## Goal

Establish the global CSS custom property layer (design system tokens) and base typographic styles so every component in stages 003 and 004 has a single authoritative source for color, spacing, and typography — no hardcoded values anywhere.

## Parts

| #   | Part                                                                      | Status  | Assigned To    | Est. Duration |
| --- | ------------------------------------------------------------------------- | ------- | -------------- | ------------- |
| 001 | [CSS Token Layer](part-001-css-token-layer/part.md)                       | `draft` | Frontend Agent | 1d            |
| 002 | [Base Typography & Spacing](part-002-base-typography-and-spacing/part.md) | `draft` | Frontend Agent | 1d            |

## Acceptance Criteria

- [ ] All colors from `dev-docs/design-system.md` are declared as CSS custom properties in `src/styles/tokens.css`
- [ ] Typography scale (font-family, sizes, weights, line-heights) is declared as tokens
- [ ] Spacing scale (4px base grid: `--space-1` through `--space-16`) is declared as tokens
- [ ] `tokens.css` is imported globally in `src/routes/+layout.svelte`
- [ ] No component in the codebase uses a hardcoded hex value or pixel dimension
- [ ] `pnpm run lint` passes
