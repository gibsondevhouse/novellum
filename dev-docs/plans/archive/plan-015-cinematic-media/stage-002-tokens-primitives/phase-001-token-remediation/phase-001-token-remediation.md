---
title: Token Remediation
slug: phase-001-token-remediation
phase_number: 1
status: draft
owner: Stylist
stage: stage-002-tokens-primitives
parts:
  - part-001-fix-tokens
estimated_duration: 2d
---

# Phase-001: Token Remediation

## Goal

Bring the current UI back under design-system control by removing undefined tokens, hardcoded colors, raw shadows, and raw motion values that block production readiness.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Fix Undefined Tokens and Hardcoded Values](part-001-fix-tokens.md) | `draft` | Stylist | 2d |

## Implementation Strategy

Use the Stage 001 token debt map as the work queue. Prefer existing tokens over new token creation. Add a new token only when a repeated cinematic pattern needs a stable semantic name and document it in `dev-docs/design-system.md` in the same part.

## Acceptance Criteria

- [ ] `pnpm run check:tokens` passes with zero violations.
- [ ] Undefined token references are removed or intentionally documented as supported aliases.
- [ ] `dev-docs/design-system.md` matches the token set used in code.
- [ ] No route-family work begins with unresolved token debt.

## Edge Cases

- Gradients and overlays should be moved into tokens or shared utilities rather than repeated inline.
- Dynamic inline styles must pass through CSS variables and must not introduce hardcoded colors or durations.
