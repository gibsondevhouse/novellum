---
title: Canon Projection On Accept
slug: part-003-canon-projection-on-accept
part_number: 3
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-review-accept-flow
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Implement `projectDomainProposalToCanon()` in `checkpoint-service.ts` that maps each domain's accepted proposal draft types to the correct canonical table write operations. Invoke it from the accept endpoint after the lifecycle transition.

## Scope

**In scope:**

- `projectDomainProposalToCanon(checkpoint: WorldbuildDomainCheckpointRecord, projectId: string, db)` — reads `checkpoint.artifact.payload`, maps fields to canonical table inserts per domain:
  - Personae → `characters`, `factions`, `lineages`
  - Atlas → `locations`
  - Archive → `lore_entries`, `themes`, `glossary_terms`
  - Threads → `plot_threads`
  - Chronicles → `timeline_events`
- Projection must be atomic: all inserts succeed or none do
- Update `lifecycle` to `'accepted'` and set `acceptance.projectedToCanon: true` after success
- Wire into the accept endpoint (`+server.ts`) after lifecycle update

**Out of scope:**

- Conflict detection for duplicate entity names (future work)
- Partial accept (all-or-nothing only)

## Implementation Steps

1. Open `src/lib/ai/pipeline/checkpoint-service.ts`.
2. Implement `projectDomainProposalToCanon` with a domain-dispatch switch.
3. Each branch calls the appropriate repository insert functions from `src/modules/world-building/services/`.
4. Wrap all inserts in a SQLite transaction for atomicity.
5. Update the accept `+server.ts` to call `projectDomainProposalToCanon` after lifecycle update.
6. Run `pnpm check` and `pnpm test`.
7. Save test output to `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/lib/ai/pipeline/checkpoint-service.ts` (add `projectDomainProposalToCanon`)
- `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts` (call projection after lifecycle update)

## Acceptance Criteria

- [ ] `projectDomainProposalToCanon` writes to the correct tables for each domain
- [ ] All inserts are wrapped in a transaction (atomic)
- [ ] `acceptance.projectedToCanon` is `true` after successful projection
- [ ] Accept endpoint invokes projection before returning 200
- [ ] `pnpm check` and `pnpm test` pass
- [ ] Test output in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
