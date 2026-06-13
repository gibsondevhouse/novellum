---
title: Compatibility Decision
slug: part-001-compatibility-decision
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-001-compatibility-decision
started_at: 2026-06-12
completed_at: 2026-06-12
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

- `evidence/compatibility-decision-evidence-2026-06-12.md`

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

- [x] Every legacy behavior has a disposition.
- [x] Decision avoids preserving stale tests by default.
- [x] Required implementation files are named.

## Edge Cases

- Existing local databases may contain old checkpoint rows.
- Tests can be both stale and still valuable after fixture updates.

## Notes

Decision: update stale fixtures and active clients to current contracts; keep retired routes retired; do not add compatibility adapters for malformed checkpoint artifacts.
