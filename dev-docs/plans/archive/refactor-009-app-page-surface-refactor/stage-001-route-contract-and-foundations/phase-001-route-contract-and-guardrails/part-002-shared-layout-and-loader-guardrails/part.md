---
title: Shared Layout and Loader Guardrails
slug: part-002-shared-layout-and-loader-guardrails
part_number: 2
status: review
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-001-route-contract-and-guardrails
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Define shared layout and data-loading guardrails that all page-family refactors must follow.

## Scope

**In scope:**

- Shared shell expectations between root and project layouts
- Sidebar, breadcrumbs, and surface-header consistency rules
- Data-loading policy for page/layout loaders (`/api/db/*` as source of truth)
- Explicit prohibition on Dexie-based route-loader access for project pages

**Out of scope:**

- Implementing route loader code changes
- Non-page module rewrites

## Implementation Steps

1. Define shell contract for root, library, and project families.
2. Document navigation and active-state guardrails across deep routes.
3. Encode loader-source policy with approved and forbidden patterns.
4. Publish guardrail artifact for Stage 002 execution.

## Files

**Create:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-001-route-contract-and-foundations/phase-001-route-contract-and-guardrails/part-002-shared-layout-and-loader-guardrails/evidence/layout-loader-guardrails-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-001-route-contract-and-foundations/phase-001-route-contract-and-guardrails/part-002-shared-layout-and-loader-guardrails/impl.log.md`

## Acceptance Criteria

- [ ] Guardrails define shared layout composition expectations
- [ ] Guardrails define route-loader source-of-truth policy (`/api/db/*`)
- [ ] Boundaries and Svelte 5 requirements are explicit

## Edge Cases

- Routes with mixed read-only and editable states
- Transitional pages that still rely on legacy shell wrappers

## Notes

- Loader policy from this part is mandatory for all Stage 002 implementations.
