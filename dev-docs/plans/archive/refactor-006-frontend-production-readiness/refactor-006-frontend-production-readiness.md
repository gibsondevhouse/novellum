---
title: Frontend Production Readiness
slug: refactor-006-frontend-production-readiness
version: 1.0.0
status: complete
owner: engineering
created: 2026-04-14
last_updated: 2026-04-14
completed_at: 2026-04-14
target_completion: 2026-05-05
stages:
  - stage-001-critical-defects
  - stage-002-accessibility
  - stage-003-ux-consistency
  - stage-004-design-system
  - stage-005-production-hardening
dependencies:
  - plan-feature-realization
quality_gates:
  - lint
  - typecheck
  - tests
  - a11y-audit
---

## Plan: Frontend Production Readiness

## Mission

Harden the Novellum frontend to production-grade quality by systematically resolving all critical defects, accessibility gaps, UX inconsistencies, design-system violations, and code-quality issues surfaced by the pre-release audit. This plan treats the app as imminent-release software — every change is scoped, verifiable, and non-breaking.

## Scope

**In scope:**

- Error boundaries, global error handling, and graceful recovery UX
- XSS mitigation in the markdown/HTML rendering pipeline
- TypeScript type-safety violations (unsafe casts, implicit `any`)
- ARIA semantics, keyboard navigation, and focus management gaps
- Form accessibility (`aria-required`, `aria-invalid`, label associations)
- Global toast/notification service
- Standardised empty-state component used consistently across all routes
- Loading / skeleton states on async data surfaces
- Breadcrumb navigation on all deep project routes
- `window.location.href` → `goto()` navigation inconsistencies
- Hardcoded pixel/rem/hex values replaced with design tokens
- Inline `<button>` elements migrated to `PrimaryButton`/`GhostButton` primitives
- Production console log removal
- Event-listener memory leak cleanup in layout components
- Full lint + typecheck + test gate pass at end

**Out of scope:**

- New features or AI capability changes
- Database schema changes
- Backend/API route refactoring
- Visual redesign or design-system expansion
- Performance profiling or bundle optimisation beyond what is blocking CI

## Stages

| # | Stage | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Critical Defect Fixes](./stage-001-critical-defects/stage-001-critical-defects.md) | `complete` | 2d |
| 002 | [Accessibility Compliance](./stage-002-accessibility/stage-002-accessibility.md) | `complete` | 2d |
| 003 | [UX Consistency](./stage-003-ux-consistency/stage-003-ux-consistency.md) | `complete` | 3d |
| 004 | [Design System Enforcement](./stage-004-design-system/stage-004-design-system.md) | `complete` | 1d |
| 005 | [Production Hardening & Final QA](./stage-005-production-hardening/stage-005-production-hardening.md) | `complete` | 1d |

## Quality Gates

All stages must pass the following gates before this plan is marked `complete`:

- [x] **lint** — `pnpm run lint` exits 0
- [x] **typecheck** — `pnpm run check` exits 0
- [x] **tests** — `pnpm run test` exits 0; 215/215 tests pass
- [x] **a11y** — Semantic roles, focus management, and ARIA attributes enforced across all audited components
- [x] **boundaries** — `eslint-plugin-boundaries` reports 0 violations

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| DOMPurify bundle size impact | low | Import only the `sanitize` export; check build size delta |
| Breadcrumb data requires route loader changes | medium | Use SvelteKit `$page` store; no server-side changes needed |
| Toast service state conflicts with existing modals | low | Mount toast root in layout above all modals |
| Token replacement misses a hardcoded value | medium | Grep-based CI check for raw `rem`/`px`/hex in `.svelte` files |

## Notes

- Every part must use Svelte 5 rune patterns (`$state`, `$derived`, `.svelte.ts` stores).
- No new `window.location` or `document.querySelector` usages are permitted; use SvelteKit APIs.
- All new components must use `--space-*`, `--text-*`, `--color-*` tokens exclusively.
- Stage 001 (critical) must be completed and all gates passed before Stage 002 begins.
