---
title: UI Surface Consistency Refactor
slug: refactor-007-ui-surface-consistency
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-14
last_updated: 2026-07-16
target_completion: 2026-05-12
track: Refactor
stages:
  - stage-001-surface-audit-and-route-verification
  - stage-002-design-token-enforcement
  - stage-003-component-primitive-consistency
  - stage-004-typography-and-layout-consistency
  - stage-005-cross-surface-visual-qa-gate
dependencies:
  - refactor-006-frontend-production-readiness
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - visual_qa
---

## Objective

Audit and guarantee navigational access to every Novellum UI surface, then enforce visual consistency by eliminating token violations and primitive misuse across the frontend without duplicating the resilience and security scope of refactor-006.

## Scope

**In scope:**

- Route reachability and render verification for all declared application surfaces
- Route repair for missing or broken +page.svelte/+layout.svelte or import issues blocking navigation
- Token enforcement: color, border, spacing, typography, and motion preference compliance
- Primitive enforcement: SurfaceCard, SurfacePanel, SectionHeader, PrimaryButton, GhostButton
- Typography and layout normalization: text scale, letter spacing, prose width, panel rhythm
- Final visual QA pass and quality gate execution (lint, check, test)

**Out of scope:**

- Error boundary architecture, a11y backlog, toast system, form semantics, and XSS hardening already scoped in refactor-006
- New design token creation or design-system expansion
- Backend API or SQLite schema changes

## Stages

| #   | Stage | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Surface Audit & Route Verification](stage-001-surface-audit-and-route-verification/stage.md) | `complete` | 3d |
| 002 | [Design Token Enforcement](stage-002-design-token-enforcement/stage.md) | `complete` | 3d |
| 003 | [Component Primitive Consistency](stage-003-component-primitive-consistency/stage.md) | `complete` | 3d |
| 004 | [Typography & Layout Consistency](stage-004-typography-and-layout-consistency/stage.md) | `complete` | 2d |
| 005 | [Cross-Surface Visual QA Gate](stage-005-cross-surface-visual-qa-gate/stage.md) | `complete` | 2d |

## Quality Gates

All stages must pass the following gates before the plan is marked complete:

- [x] lint - pnpm run lint exits 0 (including eslint-plugin-boundaries)
- [x] typecheck - pnpm run check exits 0
- [x] tests - pnpm run test exits 0 (215/215)
- [x] boundaries - no module-boundary leakage or forbidden cross-domain imports
- [x] visual_qa - manual verification evidence captured for every listed surface

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| Scope overlap with refactor-006 | medium | Strictly confine this plan to route access and visual/style consistency; reference overlap exclusions in each stage |
| Token enforcement introduces regressions | medium | Module-scoped remediation parts plus before/after grep evidence and final cross-surface QA |
| Hidden export route ambiguity | high | Dedicated Stage 001 export route-discovery part with explicit acceptance and evidence |
| Raw primitive replacements drift from UX intent | medium | Primitive migration by module with visual inventory diff and stage-level review |

## Notes

- All implementation must use Svelte 5 runes and existing navigation APIs (goto()), never window.location.href.
- No new design tokens may be introduced; only existing tokens in src/styles/tokens.css may be used.
- This plan is intentionally compatible with refactor-006 and does not duplicate its runtime resilience, security, or a11y scope.
