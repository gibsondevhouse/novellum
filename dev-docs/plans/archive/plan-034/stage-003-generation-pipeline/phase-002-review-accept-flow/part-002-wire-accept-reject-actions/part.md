---
title: Wire Accept Reject Actions
slug: part-002-wire-accept-reject-actions
part_number: 2
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-review-accept-flow
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create server-side API endpoints for accepting and rejecting domain worldbuilding proposals, and a client-side `worldbuilding-proposal-service.ts` that calls them. Wire both actions to `WorldbuildingProposalCard`.

## Scope

**In scope:**

- `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts` — updates checkpoint `lifecycle` to `'accepted'`; does not project to canon yet (that is part-003)
- `src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts` — updates checkpoint `lifecycle` to `'rejected'` with a rejection reason
- `src/modules/world-building/services/worldbuilding-proposal-service.ts` — `acceptProposal(proposalId)` and `rejectProposal(proposalId, reason)` client functions
- Wire accept/reject buttons in `WorldbuildingProposalCard` to these service functions

**Out of scope:**

- Canon table writes on accept (part-003)

## Implementation Steps

1. Create `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts`: POST handler reads `proposalId`, validates it exists, updates `lifecycle` to `'accepted'`.
2. Create `src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts`: POST handler reads `proposalId` and `reason`, updates `lifecycle` to `'rejected'`.
3. Both endpoints must validate the proposal belongs to the requesting project.
4. Create `src/modules/world-building/services/worldbuilding-proposal-service.ts` with `acceptProposal` and `rejectProposal`.
5. Wire buttons in `WorldbuildingProposalCard.svelte`.
6. Run `pnpm check` and `pnpm lint`.
7. Save API response screenshots to `evidence/`.

## Files

**Create:**

- `src/modules/world-building/services/worldbuilding-proposal-service.ts`
- `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts`
- `src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts`

**Update:**

- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`

## Acceptance Criteria

- [ ] Accept endpoint transitions proposal to `lifecycle: 'accepted'`
- [ ] Reject endpoint transitions proposal to `lifecycle: 'rejected'` with a reason
- [ ] Both endpoints validate project ownership of the proposal
- [ ] Buttons in the review card call the correct service functions
- [ ] `pnpm check` and `pnpm lint` pass
- [ ] API response evidence in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
