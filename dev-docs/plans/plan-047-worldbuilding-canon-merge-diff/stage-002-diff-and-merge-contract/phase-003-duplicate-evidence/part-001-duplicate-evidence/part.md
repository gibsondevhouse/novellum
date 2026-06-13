---
title: Duplicate Evidence
slug: part-001-duplicate-evidence
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-003-duplicate-evidence
started_at: 2026-06-12
completed_at: 2026-06-12
estimated_duration: TBD
---

## Objective

Give authors enough information to decide whether a proposal creates, merges, or links to existing canon.

## Scope

**In scope:**

- Candidate matching data model.
- Exact/fuzzy/semantic evidence hooks where feasible.
- Tests for false-positive-safe behavior.

**Out of scope:**

- Blocking all likely duplicates automatically.
- Mandating vector DB adoption.

## Implementation Steps

1. Define duplicate candidate shape and scoring fields.
2. Integrate exact normalized matches and optional fuzzy evidence.
3. Add tests for duplicate evidence without forced rejection.
4. Save evidence.

## Files

**Create:**

- `tests/ai/pipeline/worldbuild-duplicate-evidence.test.ts`
- `evidence/duplicate-evidence-evidence-2026-06-12.md`

**Update:**

- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`

**Reference:**

- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/services/worldbuild-scan-contract.ts`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/worldbuilding.md`

## Acceptance Criteria

- [x] Duplicate candidates can be surfaced to UI.
- [x] Potential duplicates do not silently mutate or block canon.
- [x] Tests cover exact and near-match evidence.

## Edge Cases

- Fuzzy matching can be locale/case sensitive.
- Confidence scores must not be treated as truth.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
