---
title: Frontend Polish & Experience Hardening
slug: plan-050-frontend-polish-hardening
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-06-15
last_updated: 2026-06-15
target_completion: ~
dependencies:
  - plan-048-frontend-experience-coherence
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - check:tokens
---

## Objective

Deliver a comprehensive frontend polish and experience hardening pass. Standardize AI review cards and empty states, enforce global button primitives, fix visual test flakiness, and secure accessibility compliance.

This plan consolidates all frontend refinement areas outlined in [frontend_polish_analysis.md](file:///Users/gibdevlite/.gemini/antigravity-cli/brain/18d5a261-27a0-47cf-9091-0ce9a241bc43/frontend_polish_analysis.md).

## Scope

**In scope:**

- **Review Card Unification**: Standardize borders, margins, shadows, and headers on [NovaAuthorDraftCheckpointCard.svelte](file:///Users/gibdevlite/Dev/novellum/src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte), [NovaOutlineDraftCheckpointCard.svelte](file:///Users/gibdevlite/Dev/novellum/src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte), and [WorldbuildingProposalCard.svelte](file:///Users/gibdevlite/Dev/novellum/src/modules/world-building/components/WorldbuildingProposalCard.svelte). Unify rejection inputs using [Input.svelte](file:///Users/gibdevlite/Dev/novellum/src/lib/components/ui/Input.svelte).
- **Button Primitives**: Replace native buttons on review surfaces and other pages with shared button components ([PrimaryButton.svelte](file:///Users/gibdevlite/Dev/novellum/src/lib/components/ui/PrimaryButton.svelte), etc.).
- **Empty State Consolidation**: Refactor bespoke empty states (like [EmptyFactionState.svelte](file:///Users/gibdevlite/Dev/novellum/src/modules/world-building/components/EmptyFactionState.svelte)) to delegate to the shared [EmptyStatePanel.svelte](file:///Users/gibdevlite/Dev/novellum/src/lib/components/ui/EmptyStatePanel.svelte) primitive.
- **Visual Test Hardening**: Add global `maxDiffPixelRatio: 0.02` to `playwright.config.ts`.
- **A11y/Focus Polish**: Add screen-reader labels to collapsed navigation elements and ensure custom rails support keyboard focus visible rings.

**Out of scope:**

- Modifying underlying backend routes, generation prompts, schemas, or server endpoints.

## Stages

### Stage 001: Component & Button Standardization
- **Goal**: Transition review interfaces and module buttons to design system primitives.
- **Tasks**:
  1. Refactor review card button triggers to use shared UI buttons.
  2. Enforce standard transitions and hover scaling.
- **Acceptance Criteria**:
  - Focus rings and hover behaviors are visually identical across all cards.

### Stage 002: Layout & Empty State Consolidation
- **Goal**: Standardize cards and refactor custom empty states.
- **Tasks**:
  1. Standardize card layout spacing, borders, and shadows.
  2. Extract inline rejection dialog patterns to use a shared style block.
  3. Migrate bespoke empty states like [EmptyFactionState.svelte](file:///Users/gibdevlite/Dev/novellum/src/modules/world-building/components/EmptyFactionState.svelte) to use [EmptyStatePanel.svelte](file:///Users/gibdevlite/Dev/novellum/src/lib/components/ui/EmptyStatePanel.svelte).
- **Acceptance Criteria**:
  - Empty states render with uniform borders and gaps.
  - Review cards share identical visual structure.

### Stage 003: Test Hardening and A11y
- **Goal**: Stabilize visual checks and verify keyboard navigation.
- **Tasks**:
  1. Configure `maxDiffPixelRatio: 0.02` in Playwright config.
  2. Apply focus rings and screen reader descriptors to collapsed sidebar states.
- **Acceptance Criteria**:
  - Visual regression suites execute reliably locally and in CI.

## Quality Gates

- [ ] `pnpm check` — zero warnings and zero errors.
- [ ] `pnpm lint` — zero code lint errors.
- [ ] `pnpm lint:css` — zero CSS validation warnings.
- [ ] `pnpm test` — all Vitest specs pass.
- [ ] `pnpm check:tokens` — zero design token violations.
