---
title: Wire Checkpoint Storage
slug: part-003-wire-checkpoint-storage
part_number: 3
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-artifact-envelopes
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Add domain-scoped checkpoint record types to `checkpoint-contract.ts` and implement `createDomainCheckpoint()` in `checkpoint-service.ts` so domain proposals can be stored as staged artifacts with `lifecycle: 'draft'`.

## Scope

**In scope:**

- `WorldbuildDomainCheckpointRecord` interface in `checkpoint-contract.ts` (extends `WorldbuildCheckpointRecord` narrowing to domain task keys)
- `createDomainCheckpoint(params)` in `checkpoint-service.ts` that stores a new record with `lifecycle: 'draft'`
- Storage must be append-only — never overwrites an existing accepted checkpoint
- No UI changes at this part

**Out of scope:**

- Accept/reject actions (phase-002)
- Canon projection (phase-002-part-003)

## Implementation Steps

1. Open `src/lib/ai/pipeline/checkpoint-contract.ts`; add `WorldbuildDomainCheckpointRecord` narrowing the domain task keys.
2. Open `src/lib/ai/pipeline/checkpoint-service.ts`; implement `createDomainCheckpoint({ projectId, taskKey, artifact })` inserting a row with `lifecycle: 'draft'`.
3. Ensure the function validates `taskKey` is one of the five domain keys before writing.
4. Run `pnpm check` and `pnpm test` (existing checkpoint service tests must still pass).
5. Save diff of `checkpoint-service.ts` to `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/lib/ai/pipeline/checkpoint-contract.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`

## Acceptance Criteria

- [ ] `WorldbuildDomainCheckpointRecord` type exported
- [ ] `createDomainCheckpoint` stores proposal with `lifecycle: 'draft'`
- [ ] Function rejects non-domain task keys
- [ ] Existing checkpoint service tests still pass
- [ ] `pnpm check` passes
- [ ] Diff in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
