---
title: Linearization Overhaul
slug: linearization-overhaul
version: 1.0.0
status: complete
owner: engineering
created: 2026-04-14
last_updated: 2026-04-14
target_completion: 2026-05-15
stages:
  - stage-001-foundation-audit
  - stage-002-primitives-systems
  - stage-003-route-refactoring
  - stage-004-quality-discipline
dependencies:
  - svelte-5-runes
  - existing-token-system
quality_gates:
  - token-compliance-check
  - a11y-standards-v2
  - svelte-check-pass
---

# Plan: Linearization Overhaul

## Mission
Ground the Novellum frontend in a "Linear-vibe" systems discipline. This involves moving from route-specific one-offs to a vocabulary of primitives, tonal layering, and functional motion.

## Architectural Goals
- **Standardized Surfaces**: Replace heavy borders with tonal layering and raised panels.
- **Svelte 5 Migration**: Ensure all UI components utilize `$state`, `$derived`, and `$props`.
- **Motion System**: Systematize durations and easing into a reusable library.
- **Density & Hierarchy**: Achieve compact, aligned, and readable layouts across all device modes.

## Stages
1. **[Stage 001: Foundation & Audit](./stage-001-foundation-audit/stage-001-foundation-audit.md)**: Inventory components and identify token gaps.
2. **[Stage 002: UI Primitives & Systems](./stage-002-primitives-systems/stage-002-primitives-systems.md)**: Build the "Linear Foundation" components.
3. **[Stage 003: Core Route Refactoring](./stage-003-route-refactoring/stage-003-route-refactoring.md)**: Apply primitives to Books, Workspace, and Editor.
4. **[Stage 004: Quality Gates & Discipline](./stage-004-quality-discipline/stage-004-quality-discipline.md)**: Enforce rules and finalize a11y.

## Citations
- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/runes)
- [Linear Design Method](https://linear.app/method/design)
- [SvelteKit Layouts & Routing](https://kit.svelte.dev/docs/routing)
