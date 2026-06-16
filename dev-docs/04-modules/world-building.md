# Module: `world-building`

> Last verified: 2026-06-16 (plan-053 review-flow closure)
> Source: [src/modules/world-building/](../../src/modules/world-building/)

## Purpose

Unified shell for characters, locations, lore, threads, and chronology entities.

## v2 Surface Contract

- Domain tiles and top-section landing use shared candle/teal spotlight direction.
- Lane/index treatments use brass labels and warm separators.
- Inputs, chips, and selection affordances use candle focus tint.

## Structure

```text
src/modules/world-building/
├── components/
├── services/
├── stores/
├── constants.ts
├── types.ts
└── index.ts
```

## Persistence

- `characters`, `character_relationships`, `locations`, `lore_entries`,
  `plot_threads`, `timeline_events`, `milestones` via `/api/db/*`.

## Review Surfaces

Worldbuilding AI output stays review-gated:

- Scan proposals from `/api/worldbuilding/scan` are persisted and hydrated
  through `worldbuild-suggestion-state.svelte.ts`.
- Pending proposal badges on worldbuilding route cards make scan output
  discoverable after navigation or reload.
- `WorldbuildingProposalReviewSection` renders domain-scoped proposal
  review cards on `/projects/[id]/world-building` and
  `/projects/[id]/world-building/help`.
- `worldbuild-proposal-actions.ts` handles accept/reject calls, refreshes
  local state, and keeps failure/conflict copy retryable. Canon changes
  still require explicit accept and use the plan-047 merge/diff route
  behavior.
- Generation controls call `worldbuilding-generation-actions.ts` and
  `/api/worldbuilding/generate` instead of only opening seeded Nova text.
  `WorldbuildingGenerationStatus` shows missing-context, running/queued,
  pending-review, failed/retry, accepted, and rejected states.
- Character persistence failures keep user-facing save error state intact;
  raw persistence errors are only logged in development diagnostics.

## Routes

- `/projects/[id]/world-building/*`
- legacy `/projects/[id]/story-bible` redirect

## Key Tests

- `tests/world-building/worldbuild-suggestion-route-state.test.ts`
- `tests/world-building/worldbuild-pending-badges.test.ts`
- `tests/world-building/worldbuild-proposal-actions.test.ts`
- `tests/world-building/worldbuilding-proposal-review-section.test.ts`
- `tests/world-building/worldbuilding-generation-actions.test.ts`
- `tests/world-building/character-persistence-errors.test.ts`
- `tests/e2e/worldbuilding-proposal-review.spec.ts`
- `tests/e2e/worldbuilding-generation-actions.spec.ts`
- `tests/e2e/character-persistence-errors.spec.ts`
