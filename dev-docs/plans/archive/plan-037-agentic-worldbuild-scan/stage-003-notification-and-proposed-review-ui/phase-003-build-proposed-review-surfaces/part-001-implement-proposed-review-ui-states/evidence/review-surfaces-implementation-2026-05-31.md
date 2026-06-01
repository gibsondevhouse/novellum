# Evidence: Proposed Review UI States Implementation

**Date:** 2026-05-31  
**Part:** part-001-implement-proposed-review-ui-states  
**Phase:** phase-003-build-proposed-review-surfaces

## Files Created

### `src/modules/world-building/components/WorldbuildingProposedTile.svelte`
- Container component for the per-domain proposal review surface
- Four explicit state variants:
  - **Loading** — `role="status"` spinner with "Loading suggestions…" text; driven by `getIsLoadingSuggestions()`
  - **Error** — `role="alert"` with error indicator; driven by `getSuggestionLoadError()`
  - **Empty** — dashed-border tile with "No suggestions for this domain yet" + hint to run a scan
  - **Has proposals** — two sections: "pending your review" (count labeled) and "reviewed" (separated by a visual divider)
- Explicit canon-safety copy: "None of these are part of your canon until you explicitly accept them."
- Per-proposal rendering via `WorldbuildingProposalCard`
- `onAccept` / `onReject` event handlers forwarded to cards (Stage 004 will wire mutations)
- All styling via design tokens

## Files Updated

### `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- **Type migration**: switched from `WorldbuildDomainCheckpointRecord` (old checkpoint type) to `WorldbuildProposalRecord` (new proposal schema from `worldbuild-proposal-schema.ts`)
- **Status mapping**: `'pending_review' → 'Suggested'`, `'accepted' → 'Accepted'`, `'rejected' → 'Rejected'`, `'failed_validation' → 'Invalid'`
- **Payload preview**: `payloadName` derived from `payload.name ?? payload.title` — shows entity name when available
- **Confidence display**: `Math.round(confidence * 100)%` with tooltip clarifying it's a heuristic signal
- **`reasoningSummary`** display with "Why suggested:" label
- **Author-agency copy**: CTA is "Accept suggestion" (not "Apply" or "Merge"); acceptance outcome: "projection to canon complete" or "pending canon projection" (not "added to your world")
- **Rejected state**: shows reason if present; no forced reason field (optional)
- **Failed validation state**: explicit "cannot be accepted" message
- Card border accents to brass on `pending` state for visual distinctness

### `src/modules/world-building/components/WorldbuildingGenerationStatus.svelte`
- Added import: `getPendingCountForCategory` from suggestion state store
- Added `pendingCount` derived value
- `review-ready` state now shows: `"N suggestion(s) to review"` when count > 0, falls back to `"Review ready"` when count is 0 (e.g., after all are resolved)

### `src/modules/world-building/index.ts`
- Added `WorldbuildingProposedTile` export

## Quality Gates

```
pnpm check     — 1747 files, 0 errors, 11 pre-existing CSS warnings
pnpm test      — 203 files / 1472 tests PASS
pnpm check:tokens — 337 files, 0 violations
```

## State Coverage

| State | Component | Trigger |
|---|---|---|
| loading | ProposedTile | `getIsLoadingSuggestions() === true` |
| error | ProposedTile | `getSuggestionLoadError() !== null` |
| empty | ProposedTile | `proposals.length === 0` |
| review-ready | ProposedTile + GenStatus | `pending.length > 0` |
| pending card | ProposalCard | `status === 'pending_review'` |
| accepted card | ProposalCard | `status === 'accepted'` |
| rejected card | ProposalCard | `status === 'rejected'` |
| failed card | ProposalCard | `status === 'failed_validation'` |

## Canon Safety

- "Suggested" label (not "draft") avoids ambiguity with work-in-progress
- Pending proposals shown with brass accent — distinct from accepted (success green)
- Acceptance outcome copy explicitly confirms projection status — never says "part of your world" until `projectedToCanon === true`
- `WorldbuildingProposedTile` section note reinforces non-canonical status at the container level
