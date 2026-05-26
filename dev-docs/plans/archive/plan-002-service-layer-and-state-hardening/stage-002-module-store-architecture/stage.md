---
title: Module Store Architecture
slug: stage-002-module-store-architecture
stage_number: 2
status: complete
owner: Frontend Agent
plan: plan-002-service-layer-and-state-hardening
phases:
  - phase-001-module-scoped-stores
  - phase-002-app-stores-and-boundaries-tooling
estimated_duration: 4d
risk_level: medium
---

## Goal

Replace the ad-hoc `$state` variables scattered across route files and the basic stores from Path 1 with a clean two-tier store architecture: module-scoped stores (owned by each domain module) and app-level stores (only for state consumed across two or more unrelated modules). Install and configure `eslint-plugin-boundaries` so the import boundary matrix in `dev-docs/modular-boundaries.md` is machine-enforced.

## Phases

| #   | Phase                                                                                   | Status  | Est. Duration |
| --- | --------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Module-Scoped Stores](phase-001-module-scoped-stores/phase.md)                         | `draft` | 2d            |
| 002 | [App Stores & Boundaries Tooling](phase-002-app-stores-and-boundaries-tooling/phase.md) | `draft` | 2d            |

## Entry Criteria

- `stage-001-dexie-schema-and-repository-layer` is `complete`
- Path 1 UI components exist and are functional
- `dev-docs/modular-boundaries.md` reviewed

## Exit Criteria

- All phases complete
- Each module has a store file at `src/modules/<domain>/stores/<domain>.svelte.ts`
- `src/lib/stores/active-project.svelte.ts` and `src/lib/stores/ai-panel.svelte.ts` harden to use Svelte 5 runes
- `eslint-plugin-boundaries` installed and `pnpm run lint` enforces import matrix with zero violations
- No raw `$state` in route files — all reactive state flows through module or app stores

## Notes

Risk: this stage refactors state that Path 1 route components already use. The implementing agent must update all route-file consumers after extracting state to stores.
