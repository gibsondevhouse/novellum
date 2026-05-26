---
title: Empty / Error / Loading State Pass
slug: stage-008-empty-error-loading-states
stage_number: 8
status: complete
owner: Stylist Agent
plan: plan-016-visual-consistency
phases:
  - phase-001-empty-states
  - phase-002-error-and-loading
estimated_duration: 2d
risk_level: low
---

## Goal

Unify every non-happy-path state so it reads as authored, calm, and helpful. Eliminate placeholder dev copy, generic SaaS onboarding tone, and inconsistent error / loading treatments.

## Phases

| #   | Phase                                                                 | Status  | Est. Duration |
| --- | --------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Empty State Convergence](phase-001-empty-states/phase.md)            | `complete` | 1d            |
| 002 | [Error & Loading Convergence](phase-002-error-and-loading/phase.md)   | `complete` | 1d            |

## Entry Criteria

- Stage 003 complete; `EmptyStatePanel` primitive accepted.
- Empty State Audit from Stage 001 lists every empty state with current copy and proposed replacement.

## Exit Criteria

- Every empty state in the inventory uses `EmptyStatePanel` (or an accepted archetype-specific variant).
- Every empty state has in-voice copy reviewed by the Stylist.
- Error boundary and loading skeleton treatments are unified across modules.
- Lint, typecheck, tokens gates pass.

## Notes

- Copy changes are scoped to empty/error/loading states. Do not rewrite product copy elsewhere.
- Respect accessibility rules in `.github/skills/accessibility-a11y/SKILL.md` for loading/error announcements.
