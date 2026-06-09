---
title: Schema Inventory
slug: part-001-schema-inventory
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-schema-inventory
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Identify current envelope shapes and why stale e2e fixtures fail against them.

## Scope

**In scope:**

- Review Zod/manual validators and type contracts.
- Record required fields, versions, owners, and lifecycle values.
- Compare fixtures in failing tests to current schema.

**Out of scope:**

- Loosening validators without a compatibility decision.
- Adding new artifact formats.

## Implementation Steps

1. Inspect worldbuild, proposal, author draft, and outline checkpoint contracts.
2. Document required envelope fields and version constants.
3. Compare failing e2e fixture payloads to current contracts.
4. Save schema inventory evidence.

## Files

**Create:**

- `evidence/schema-inventory-evidence-2026-06-09.md`

**Update:**

- None

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [ ] Current schema requirements are documented by family.
- [ ] Fixture/schema mismatches are identified.
- [ ] Version policy questions are listed for stage 002.

## Edge Cases

- Some validation is manual rather than Zod-based.
- Historical artifacts may not match current schemas.

## Notes

Keep this part scoped to Pipeline Checkpoint Contract Reconciliation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
