# Verification - 2026-06-16

## Implementation Summary

- Added `src/modules/world-building/services/worldbuild-proposal-actions.ts` as the review action boundary for persisted worldbuilding proposals.
- Extended `worldbuilding-proposal-service.ts` to preserve returned `proposal`, `lifecycle`, `status`, and route error text from accept/reject responses.
- Wired `WorldbuildingProposalReviewSection`, `WorldbuildingProposedTile`, and `WorldbuildingProposalCard` so accepted/rejected proposals update local suggestion state and display retryable success/conflict/failure messaging.
- Added `getSuggestionById` to the suggestion store for mutation assertions.
- Added E2E coverage for surfaced persisted proposal accept/reject actions.

## API Inventory

- `POST /api/worldbuilding/proposals/[proposalId]/accept`
  - Metadata-backed proposal path returns `{ ok: true, proposal }` after `acceptProposalAtomically`.
  - Legacy checkpoint fallback returns `{ ok: true, lifecycle }`.
  - Non-success responses use SvelteKit `error(...)`; client parsing now reads `error`, `message`, `status`, and optional `code`.
- `POST /api/worldbuilding/proposals/[proposalId]/reject`
  - Metadata-backed proposal path returns `{ ok: true, proposal }` after `rejectProposalAtomically`.
  - Legacy checkpoint fallback returns `{ ok: true, lifecycle }`.
  - Reject still requires a non-empty author reason.

## Commands

### Unit/component

Command:

```sh
pnpm test tests/world-building/worldbuild-review-ui.test.ts tests/world-building/worldbuilding-proposal-service.test.ts tests/world-building/worldbuild-proposal-actions.test.ts tests/world-building/worldbuilding-proposal-review-section.test.ts tests/world-building/worldbuild-pending-badges.test.ts tests/world-building/worldbuild-suggestion-route-state.test.ts
```

Result:

```text
Test Files  6 passed (6)
Tests       32 passed (32)
```

### Typecheck

Command:

```sh
pnpm check
```

Result:

```text
svelte-check found 0 errors and 0 warnings
```

### Lint

Command:

```sh
pnpm lint
```

Result:

```text
src/routes/api/author-draft/checkpoints/stage-inline/+server.ts
  36:10  error  'usedCanonRefsValue' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
```

Notes:

- This is the known unrelated baseline lint failure; `git diff -- src/routes/api/author-draft/checkpoints/stage-inline/+server.ts` is empty.
- Changed-file ESLint passed:

```sh
pnpm exec eslint src/modules/world-building/services/worldbuilding-proposal-service.ts src/modules/world-building/services/worldbuild-proposal-actions.ts src/modules/world-building/components/WorldbuildingProposalCard.svelte src/modules/world-building/components/WorldbuildingProposedTile.svelte src/modules/world-building/components/WorldbuildingProposalReviewSection.svelte src/modules/world-building/stores/worldbuild-suggestion-state.svelte.ts tests/world-building/worldbuilding-proposal-service.test.ts tests/world-building/worldbuild-proposal-actions.test.ts tests/world-building/worldbuilding-proposal-review-section.test.ts tests/e2e/worldbuilding-proposal-review.spec.ts
```

### CSS and tokens

Commands:

```sh
pnpm lint:css
pnpm check:tokens
```

Result:

```text
lint:css passed
Token enforcement: 349 files scanned, 0 violations.
```

### Build

Command:

```sh
pnpm run build
```

Result:

```text
build passed
```

Notes:

- Existing Lightning CSS warnings for `@theme` and `@utility` rules were emitted during build.

### E2E

Command:

```sh
pnpm exec playwright test tests/e2e/worldbuilding-proposal-review.spec.ts tests/e2e/worldbuilding-suggestion-route-state.spec.ts --project=chromium
```

Result:

```text
3 passed
```

Coverage:

- Persisted proposal surfaces on the worldbuilding help route.
- Accept action relabels the proposal as accepted and clears pending state.
- Reject action relabels the proposal as rejected, keeps the rejection reason visible, and clears pending state.
- Route-state pending badge coverage still passes.

## Reviewer Notes

- Conflict and network failure retry behavior is covered in `tests/world-building/worldbuild-proposal-actions.test.ts`; failures do not drop the local pending proposal.
- Reviewer Agent sign-off is still pending. Do not mark this part or parent plan artifacts `complete` until that review is real.
