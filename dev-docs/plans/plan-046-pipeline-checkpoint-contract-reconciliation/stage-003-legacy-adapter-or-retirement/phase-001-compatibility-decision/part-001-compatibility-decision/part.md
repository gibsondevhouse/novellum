---
title: Compatibility Decision
slug: part-001-compatibility-decision
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-compatibility-decision
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Resolve old generic metadata fixture behavior without preserving accidental complexity.

## Scope

**In scope:**

- Decision record per legacy route/schema/test fixture.
- Compatibility criteria and sunset notes.
- Reviewer-readable rationale.

**Out of scope:**

- Implementing every adapter before decision approval.
- Deleting test coverage without replacement.

## Implementation Steps

1. Review API map and failing spec classification.
2. For each legacy behavior, choose adapter, update fixture, or retire.
3. Record rationale and impact.
4. Save compatibility decision evidence.

## Files

**Create:**

- `evidence/compatibility-decision-evidence-2026-06-09.md`

**Update:**

- `dev-docs/plans/plan-046-pipeline-checkpoint-contract-reconciliation/plan.md`

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [ ] Every legacy behavior has a disposition.
- [ ] Decision avoids preserving stale tests by default.
- [ ] Required implementation files are named.

## Edge Cases

- Existing local databases may contain old checkpoint rows.
- Tests can be both stale and still valuable after fixture updates.

## Notes

Keep this part scoped to Pipeline Checkpoint Contract Reconciliation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
