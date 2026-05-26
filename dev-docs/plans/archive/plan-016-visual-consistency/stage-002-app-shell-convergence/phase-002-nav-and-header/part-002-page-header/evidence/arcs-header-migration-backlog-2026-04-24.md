# Deferred Backlog: Arcs Header Migration

## Date

2026-04-24

## Route

- `/projects/[id]/arcs`

## Current State

- Route uses placeholder `future-*` hero styling.
- Arc Planner feature is not yet implemented, so canonical header migration would be premature.

## Decision

- Defer migration during Phase 002.
- Keep placeholder hero until Arc Planner implementation begins.

## Trigger To Execute

- Start of Arc Planner implementation phase for `/projects/[id]/arcs`.

## Planned Migration

1. Replace placeholder hero block with canonical `PageHeader`.
2. Remove route-local placeholder header selectors from scoped styles.
3. Preserve any Arc-specific summary metrics in `PageHeader` `meta` snippet.
4. Re-run quality gates: `pnpm run check`, `pnpm run lint`, `pnpm run check:tokens`.

## Ownership

- Primary: Architect Agent
- Support: Stylist Agent

## Acceptance Target

- `/projects/[id]/arcs` conforms to canonical page-header contract and no longer depends on `future-*` header styles.
