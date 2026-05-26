---
title: Tokens and Gallery Primitives
slug: stage-002-tokens-primitives
stage_number: 2
status: draft
owner: Stylist / Architect
plan: plan-015-cinematic-media
phases:
  - phase-001-token-remediation
  - phase-002-primitive-standardization
estimated_duration: 5d
risk_level: high
---

# Stage-002: Tokens and Gallery Primitives

## Goal

Remove current visual-system debt and create the reusable UI primitives required for every later route-family refactor. This stage is the production UI foundation; no broad route migration should bypass it.

## Entry Criteria

- Stage 001 audit deliverables exist.
- Current token violations and undefined tokens are mapped to files and remediation strategy.
- The desired primitive contracts are accepted from `plan-015-cinematic-media.md`.

## Phases

| # | Phase | Status | Owner | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Token Remediation](phase-001-token-remediation/phase-001-token-remediation.md) | `draft` | Stylist | 2d |
| 002 | [Primitive Standardization](phase-002-primitive-standardization/phase-002-primitive-standardization.md) | `draft` | Architect / Stylist | 3d |

## Required Deliverables

- `pnpm run check:tokens` passes with zero violations.
- Undefined token references are removed or documented as supported aliases.
- `dev-docs/design-system.md` documents every new token, primitive, and usage rule introduced by this stage.
- Shared primitives exist for spotlight, poster, rail, glass/action bars, status metrics, visual tiles, empty states, and drawers.
- Existing duplicated visual patterns have a clear migration path to shared primitives.

## Exit Criteria

- New primitives are available from `src/lib/components/ui/index.ts`.
- Primitive examples are visible in the styles/configuration surface or documented with screenshots.
- Primitive styles use tokens only, reserve stable dimensions, handle focus states, and include reduced-motion fallbacks.
- `pnpm run check:tokens`, `pnpm run lint`, `pnpm run check`, and relevant tests pass.

## Notes

Do not add a token for one-off styling. Prefer replacing undefined tokens with existing design-system tokens unless the pattern repeats across route families.
