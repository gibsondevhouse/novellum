---
title: Generation Pipeline
slug: stage-003-generation-pipeline
stage_number: 3
status: draft
owner: Planner Agent
plan: plan-034
phases:
  - phase-001-artifact-envelopes
  - phase-002-review-accept-flow
  - phase-003-error-handling
estimated_duration: 6d
risk_level: medium
---

## Goal

Wire the Nova generation system to create domain-scoped artifact proposals (checkpoints) instead of only opening Nova UI, implement a review-and-accept flow that users can safely integrate proposals into canon, and handle generation errors gracefully.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Artifact Envelopes](phase-001-artifact-envelopes/phase.md) | `draft` | 2d |
| 002 | [Review & Accept Flow](phase-002-review-accept-flow/phase.md) | `draft` | 2.5d |
| 003 | [Error Handling](phase-003-error-handling/phase.md) | `draft` | 1.5d |

## Entry Criteria

- Stage 002 (UI Integration) is complete
- Generate buttons in `+page.svelte` are wired and tested
- `worldbuilding-generate-actions.ts` and `worldbuilding-readiness.ts` are complete
- `src/routes/projects/[id]/world-building/+page.ts` returns `domainCounts`
- Existing checkpoint storage in `src/lib/ai/pipeline/checkpoint-service.ts` is functional

## Exit Criteria

- All phases complete
- Domain-scoped artifact envelopes created for each worldbuilding domain
- Generation produces reviewable proposals (not direct canon writes)
- Accept/reject flow works end-to-end
- State machine handles all error cases (missing context, API failure, parse error, timeout)
- All integration tests pass
- Audit logs capture generation source and user decisions

## Notes

**Risk level:** Medium. This stage introduces **real AI integration** and **production database writes**. However, the review-gated model ensures users have explicit control before canon projection.

**Key safety constraint:** Generated proposals are **staged checkpoints**, not direct table writes. Canon projection happens only on accept.

**Sequencing:** This stage depends on stage-002 validating that users engage with the UI affordances.

**Key files delivered by this stage:**

- `src/lib/ai/pipeline/task-catalog.ts` (updated: 5 new domain keys)
- `src/lib/ai/pipeline/worldbuild-schemas.ts` (updated: 5 domain schemas)
- `src/lib/ai/pipeline/checkpoint-contract.ts` (updated: `WorldbuildDomainCheckpointRecord`)
- `src/lib/ai/pipeline/checkpoint-service.ts` (updated: `createDomainCheckpoint`, `projectDomainProposalToCanon`)
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte` (new)
- `src/modules/world-building/services/worldbuilding-proposal-service.ts` (new)
- `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts` (new)
- `src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts` (new)
- `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts` (new)
- `src/modules/world-building/components/WorldbuildingGenerationStatus.svelte` (new)
