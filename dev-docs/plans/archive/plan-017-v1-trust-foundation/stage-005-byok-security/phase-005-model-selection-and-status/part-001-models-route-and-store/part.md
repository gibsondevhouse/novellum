---
title: Models Route and Selection Store
slug: part-001-models-route-and-store
part_number: 1
status: complete
owner: ai
assigned_to: ai
phase: phase-005-model-selection-and-status
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Provide the model catalogue endpoint and migrate the model-selection store to preferences.

## Scope

**In scope:**

- `src/routes/api/ai/models/+server.ts` — `GET` handler that calls `OpenRouterProvider.listModels(loadedKey)` with a 60-second in-memory cache keyed by provider id.
- Refactor `src/lib/stores/model-selection.svelte.ts` to read/write via `getPreference` / `setPreference` instead of `localStorage`. Keep the same exported store shape so callers do not change.
- One-shot migration: if `localStorage['novellum:model_selection']` exists, copy to preferences and `removeItem`.

**Out of scope:**

- UI change to the model picker — already wired through the store, no visual change required.

## Implementation Steps

1. Implement the route handler with cache (`Map<providerId, { models, fetchedAt }>`).
2. Refactor the store; expose an async `init()` if necessary so the first read awaits preferences load.
3. Add migration helper invoked on store init.
4. Tests: `tests/routes/api-ai-models.test.ts` (route + cache hit/miss), `tests/lib/model-selection-store.test.ts` (preferences round-trip + migration).

## Files

**Create:**

- `src/routes/api/ai/models/+server.ts`
- `tests/routes/api-ai-models.test.ts`
- `tests/lib/model-selection-store.test.ts`

**Update:**

- `src/lib/stores/model-selection.svelte.ts`

## Acceptance Criteria

- [ ] Route returns `401 no_credentials` when no key is stored.
- [ ] Cache hit avoids a second provider call within 60 s.
- [ ] Store no longer references `localStorage` (boundary test).
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Provider returns an empty list — surface a `200 []` rather than a 500.
- Cache must invalidate on key change (`saveProviderKey` invalidates the cache via a small pub/sub or an internal version counter).

## Notes

- The 60-second cache window is intentionally short; we can lift it once we add a "Refresh models" CTA in plan-018.
