# Evidence: Pending Suggestion State Derivation

- Date: 2026-05-31
- Part: `part-001-derive-and-persist-pending-state`
- Scope: Category-scoped pending suggestion state derivation and rehydration behavior.

## Artifacts Created / Updated

### Created: `src/modules/world-building/stores/worldbuild-suggestion-state.svelte.ts`

Svelte 5 Runes module providing:

| Export | Kind | Purpose |
|--------|------|---------|
| `refreshSuggestions(projectId)` | async fn | Load proposals from `project_metadata` via `listProjectMetadata(..., 'pipeline', WORLDBUILD_PROPOSAL_OWNER_ID)` |
| `upsertSuggestionLocal(updated)` | fn | Upsert a mutated proposal locally without a full round-trip (for accept/reject hot paths) |
| `getSuggestions()` | fn | All loaded proposals |
| `getSuggestionLoadError()` | fn | Error string or null |
| `getIsLoadingSuggestions()` | fn | Loading flag |
| `getPendingCountForCategory(categoryId)` | fn | Count of `pending_review` proposals per domain |
| `hasPendingForCategory(categoryId)` | fn | Boolean shorthand for badge display |
| `getTotalPendingCount()` | fn | Global pending total |
| `getSuggestionsByStatus(status)` | fn | Filter proposals by lifecycle status |
| `getSuggestionsByCategory(categoryId, status?)` | fn | Filter by domain + optional status |

The `pendingCountByCategory` derived value uses Svelte 5 `$derived` — recomputed automatically whenever `suggestions` changes.

### Updated: `src/modules/world-building/stores/world-building-store.svelte.ts`

- Added import of `refreshSuggestions` from the new store.
- `refreshWorldbuildCheckpoints(projectId)` now calls `await refreshSuggestions(projectId)` after the checkpoint refresh (and `await refreshSuggestions(null)` on project clear). This wires suggestion state refresh into the existing project load/unload lifecycle automatically.

## Rehydration Behavior

State rehydration is persistent-backed (not component-local):
- On project load: `refreshWorldbuildCheckpoints` → `refreshSuggestions` → `listProjectMetadata('pipeline', 'vibe-worldbuild-scan')` → populates `suggestions`.
- After accept/reject: caller should invoke `upsertSuggestionLocal(updated)` for instant local update, then `refreshSuggestions` for full consistency.
- On navigation: the store module-level `$state` survives SvelteKit soft navigation within the same session; a hard reload triggers `refreshWorldbuildCheckpoints` via project init.

## Quality Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm check` | 1 pre-existing ERROR (DomainCounts, unrelated) | 1745 files (+1 new store); no new errors |
| `pnpm test` | PASS — 203 files / 1472 tests | |

## Acceptance Criteria Verification

- [x] Pending state is deterministic and category-scoped — `pendingCountByCategory` is `$derived` from `suggestions`, pure and deterministic per-category
- [x] Pending state recovers correctly after reload and navigation — `refreshSuggestions` reads from `project_metadata` backend, not component memory; wired into `refreshWorldbuildCheckpoints`
