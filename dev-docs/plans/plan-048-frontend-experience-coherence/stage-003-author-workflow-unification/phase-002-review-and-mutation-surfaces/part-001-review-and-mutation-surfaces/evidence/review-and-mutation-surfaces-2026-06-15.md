# Review And Mutation Surfaces (2026-06-15)

## Implemented Alignment

Added `src/lib/review-gate-labels.ts` as a small shared label normalizer for review-gated UI states.

| State vocabulary | Normalized label |
| --- | --- |
| `review`, `pending_review`, `review-ready` | Pending review |
| `accepted` | Accepted |
| `rejected` | Rejected |
| `failed_validation` | Failed validation |
| `none` | No draft |

## Updated Surfaces

| Surface | Change |
| --- | --- |
| `NovaAuthorDraftCheckpointCard.svelte` | Author draft checkpoint status now uses the shared pending/accepted/rejected/no-draft labels. |
| `NovaOutlineDraftCheckpointCard.svelte` | Outline lifecycle chip keeps the literal `Pending review` source contract while using shared labels for other lifecycle states. |
| `WorldbuildingProposalCard.svelte` | Proposal badges now show human-readable review-gate labels instead of raw status values such as `pending_review`. |
| `WorldbuildingGenerationStatus.svelte` | Review-ready, accepted, and rejected status text now uses the shared label vocabulary. |

## Safety Boundaries Preserved

- Author draft acceptance still calls `acceptSceneDraftCheckpoint` before dispatching scene updates.
- Outline checkpoint acceptance still goes through `createOutlineCheckpointActions().accept`.
- Worldbuilding proposal acceptance still depends on the existing proposal accept route and diff/merge model.
- Model-callable tools are not presented as author acceptance actions.
- Rejected and failed states remain visible and non-actionable unless the component explicitly offers retry/reset.

## Validation

Command:

```text
pnpm exec vitest run tests/lib/review-gate-labels.test.ts tests/nova/checkpoint-card.contract.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/world-building/worldbuilding-proposal-diff-view.test.ts tests/world-building/worldbuild-review-ui.test.ts
```

Result:

```text
Test Files  5 passed (5)
Tests       33 passed (33)
```

The first run exposed a source-contract expectation for the literal `Pending review` text in the outline card. The component now preserves that literal contract while sharing normalized labels elsewhere.
