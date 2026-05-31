---
title: Add Provenance Tracking
slug: part-002-add-provenance-tracking
part_number: 2
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-guardrails
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Add a `provenance` field to `WorldbuildDomainCheckpointRecord` in `checkpoint-contract.ts` capturing the generation model, a `generationId`, creation timestamp, and a `sourceContextSummary` string. Render provenance metadata in `WorldbuildingProposalCard.svelte`.

## Scope

**In scope:**

- `WorldbuildProvenance` interface: `{ model: string; generationId: string; createdAt: string; sourceContextSummary: string }`
- Add `provenance: WorldbuildProvenance` to `WorldbuildDomainCheckpointRecord`
- Populate `provenance` when creating a domain checkpoint in `checkpoint-service.ts`
- Display model name and context summary in `WorldbuildingProposalCard.svelte`

**Out of scope:**

- Changing the storage schema for pre-existing non-domain checkpoints
- Displaying full context details (summary only)

## Implementation Steps

1. Define `WorldbuildProvenance` interface in `checkpoint-contract.ts`.
2. Add `provenance` field to `WorldbuildDomainCheckpointRecord`.
3. In `checkpoint-service.ts`, populate `provenance` when calling `createDomainCheckpoint` — the `model` comes from the OpenRouter response, `sourceContextSummary` is a trimmed context description passed from the caller.
4. In `WorldbuildingProposalCard.svelte`, render `proposal.provenance.model` and `proposal.provenance.sourceContextSummary` in a metadata row.
5. Run `pnpm check`.
6. Screenshot of the card with provenance rendered in `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/lib/ai/pipeline/checkpoint-contract.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`

## Acceptance Criteria

- [ ] `WorldbuildProvenance` interface exported from `checkpoint-contract.ts`
- [ ] `createDomainCheckpoint` always sets `provenance` (never `undefined`)
- [ ] `WorldbuildingProposalCard` displays model name and context summary
- [ ] `pnpm check` passes
- [ ] Screenshot with provenance in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
