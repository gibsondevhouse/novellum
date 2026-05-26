---
title: Store Reactivity Unification
phase_number: '002'
status: draft
owner: frontend-agent
parts:
  - part-001-global-stores
estimated_duration: 4 days
acceptance_criteria_count: 2
edge_cases_count: 1
---

# Phase 002: Store Reactivity Unification

## Strategy
Convert all global state files (e.g., `active-project.svelte.ts`) to use exported classes or functions returning reactive objects via `.svelte.ts`.

## Acceptance Criteria
1. No `import { writable, readable } from 'svelte/store'` remains in `.ts` or `.svelte` files.
2. All global state is encapsulated in `.svelte.ts` files utilizing Svelte 5 classes/runes.

## Edge Cases
- Store subscriptions (`$store`) in legacy components will break if the store is converted to a raw object. Coordination with Phase 001 is mandatory.
