---
title: UI Component Runes Migration
phase_number: '001'
status: draft
owner: frontend-agent
parts:
  - part-001-layout-runes
  - part-002-module-runes
estimated_duration: 3 days
acceptance_criteria_count: 5
edge_cases_count: 2
---

# Phase 001: UI Component Runes Migration

## Strategy
Update all `.svelte` component files to use Svelte 5 runes. We will start from the top-level application shell (`+layout.svelte`, `AppSidebar.svelte`) and work our way down into the module-specific views.

## Acceptance Criteria
1. No `export let` statements exist in the targeted files.
2. All props are destructured from `$props()`.
3. Local component state uses `$state()`.
4. Computed values use `$derived()`.
5. UI passes visual regression tests and basic interaction QA.

## Edge Cases
1. **Third-party component libraries**: If external libraries still require Svelte 4 store contracts, write explicit boundary adapters.
2. **TipTap Editor**: Ensure the TipTap instance reactivity does not cycle infinitely when wrapped in `$state`.
