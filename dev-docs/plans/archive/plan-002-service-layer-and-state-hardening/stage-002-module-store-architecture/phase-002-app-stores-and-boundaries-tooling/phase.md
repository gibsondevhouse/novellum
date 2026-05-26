---
title: App Stores & Boundaries Tooling
slug: phase-002-app-stores-and-boundaries-tooling
phase_number: 2
status: complete
owner: Frontend Agent
stage: stage-002-module-store-architecture
parts:
  - part-001-app-level-stores
  - part-002-eslint-boundaries-setup
estimated_duration: 2d
---

## Goal

Harden the two app-level stores that cross module boundaries (`active-project`, `ai-panel`) to use Svelte 5 runes. Then install and configure `eslint-plugin-boundaries` so the import matrix from `dev-docs/modular-boundaries.md` is enforced by the linter.

## Parts

| #   | Part                                                                | Status  |
| --- | ------------------------------------------------------------------- | ------- |
| 001 | [App-Level Stores](part-001-app-level-stores/part.md)               | `draft` |
| 002 | [ESLint Boundaries Setup](part-002-eslint-boundaries-setup/part.md) | `draft` |

## Entry Criteria

- `phase-001-module-scoped-stores` is `complete`
- `dev-docs/modular-boundaries.md` import boundary matrix reviewed

## Exit Criteria

- `src/lib/stores/active-project.svelte.ts` and `src/lib/stores/ai-panel.svelte.ts` use Svelte 5 runes
- `pnpm add -D eslint-plugin-boundaries` installed
- `eslint.config.js` (or `.eslintrc`) includes boundaries rules matching the matrix in `modular-boundaries.md`
- `pnpm run lint` enforces import rules with zero false positives
- Test that a deliberate cross-boundary import triggers an ESLint error and document result in evidence
