---
date: 2026-05-31
part: part-001-enforce-atomic-accept-projection-constraints
---

# Quality Gate Results

## pnpm check (svelte-check + tsc)

- **1747 files / 0 errors / 11 warnings**
- Warnings are all pre-existing CSS selector issues in unrelated components (not introduced by this part)

## pnpm lint (ESLint)

- **9 errors — all pre-existing in untouched components**
  - `WorldBuildingTopSectionLanding.svelte` — 5 unused vars
  - `WorldBuildingWorkspacePage.svelte` — 4 unused vars
- Zero new errors introduced by this part

## pnpm test (Vitest)

- **203 files / 1472 tests PASS**

## Changes summary

### `src/lib/ai/pipeline/checkpoint-contract.ts`
- Added `PROPOSAL_PROJECTION_TABLE_MAP` constant (5 domains → 5 canon tables)
- Added `ProjectableProposalDomainId` type
- Added `isProjectableProposalDomain(categoryId)` type guard

### `src/lib/ai/pipeline/checkpoint-service.ts`
- Added `writeRawMetadata()` private helper for generic JSON metadata upsert
- Added `projectEntityFromProposal()` private function — per-domain entity INSERT
- Added `ProposalAcceptOutcome` exported type
- Added `acceptProposalAtomically(projectId, proposalId)` exported function
  - Wraps proposal read + entity INSERT + proposal metadata write in a single `db.transaction()`
  - If entity INSERT throws `WorldbuildCheckpointError('projection_failed', ...)`, transaction rolls back
  - Proposal stays `pending_review` on any failure; no partial canon writes possible

### `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts`
- Replaced two-step accept pattern (mark accepted → separate write) with `acceptProposalAtomically`
- `projectedToCanon: true` is now only set when entity INSERT succeeds inside the same transaction
- Removed `setProjectMetadata` import (no longer needed for new-style path)

## Atomic safety invariant

The acceptance lifecycle gate is enforced by the SQLite transaction boundary:
- `accepted` status is written IFF the entity INSERT completes without error
- `WorldbuildCheckpointError('projection_failed', ...)` from `projectEntityFromProposal` propagates
  through `db.transaction()` → transaction ROLLBACK → proposal remains `pending_review`
- `projectedToCanon: false` can no longer occur for new-style proposals (Phase 001 stub is gone)
