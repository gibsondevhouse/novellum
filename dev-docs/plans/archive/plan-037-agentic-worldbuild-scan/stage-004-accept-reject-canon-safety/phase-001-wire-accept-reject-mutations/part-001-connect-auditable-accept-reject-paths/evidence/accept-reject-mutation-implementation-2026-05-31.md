# Evidence: Accept/Reject Mutation Implementation

**Date:** 2026-05-31  
**Part:** part-001-connect-auditable-accept-reject-paths  
**Phase:** phase-001-wire-accept-reject-mutations

## Files Created / Updated

### `src/modules/world-building/services/worldbuilding-proposal-service.ts` (UPDATED)
Previous stub had `acceptProposal(proposalId)` / `rejectProposal(proposalId, reason)` returning `{ ok, error? }`.

Updated to:
- Accept `projectId` as first parameter (required for proposal lookup)
- Return `ProposalMutationResult = ProposalActionResult | ProposalActionError`
  - `ProposalActionResult: { ok: true; proposal: WorldbuildProposalRecord }`
  - `ProposalActionError: { ok: false; error: string; status: number }`
- On success, calls `upsertSuggestionLocal(proposal)` to update local suggestion state immediately — no store refresh needed for hot paths
- `reason` in `rejectProposal` is optional (defaults to `''`)
- Both functions handle network errors gracefully (status 0)

### `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts` (UPDATED)
Added new-style proposal handling before legacy checkpoint fallthrough:

1. If `projectId` present in request body → reads `WorldbuildProposalRecord` from `project_metadata` (scope=`pipeline`, owner=`WORLDBUILD_PROPOSAL_OWNER_ID`)
2. Guards: `status !== 'pending_review'` → 422 with explicit message
3. Updates: `status: 'accepted'`, `acceptance: { acceptedAt, acceptedBy: null, projectionTarget: categoryId, projectedToCanon: false }`
4. Persists via `setProjectMetadata`
5. Returns `{ ok: true, proposal: updated }`

Legacy checkpoint path preserved unchanged below the new-style block.

### `src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts` (UPDATED)
Same pattern as accept:

1. New-style block: reads from `project_metadata` with `WORLDBUILD_PROPOSAL_OWNER_ID`
2. Guards: `status !== 'pending_review'` → 422
3. Updates: `status: 'rejected'`, `rejection: { rejectedAt, rejectedBy: null, reason }`; clears `acceptance: null`
4. Persists and returns `{ ok: true, proposal: updated }`

Legacy checkpoint path: still requires non-empty `reason` (old checkpoint contract unchanged).

### `src/modules/world-building/index.ts` (UPDATED)
Added exports for `acceptProposal`, `rejectProposal`, and the result types.

## Quality Gates

```
pnpm check     — 1747 files, 0 errors, 11 pre-existing CSS warnings
pnpm test      — 203 files / 1472 tests PASS
```

## Audit Metadata Design

| Field | Accept | Reject |
|---|---|---|
| `acceptedAt` / `rejectedAt` | `new Date().toISOString()` | `new Date().toISOString()` |
| `acceptedBy` / `rejectedBy` | `null` (Stage 005 may wire user context) | `null` |
| `projectionTarget` | `proposal.categoryId` | — |
| `projectedToCanon` | `false` (Stage 004 Phase 002 will flip this after projection) | — |

## Invalid Transition Handling

Both endpoints return HTTP 422 if the proposal is not in `pending_review` state. The error message is explicit: `"Proposal is already {status} and cannot be {action}."` — this prevents double-accept or re-accept of rejected proposals.

## Backward Compatibility

Legacy `WorldbuildCheckpointRecord` flow is preserved. New-style block runs first; if the `proposalId` is not found as a `WorldbuildProposalRecord`, the legacy checkpoint path handles it. No existing checkpoint-based proposals are broken.
