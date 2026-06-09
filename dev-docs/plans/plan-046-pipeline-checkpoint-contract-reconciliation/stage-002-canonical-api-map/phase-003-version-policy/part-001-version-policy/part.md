---
title: Version Policy
slug: part-001-version-policy
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-003-version-policy
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Clarify how routes handle old, current, malformed, and future checkpoint artifact versions.

## Scope

**In scope:**

- Supported version list by family.
- Compatibility or migration expectations for historical artifacts.
- Test fixture update rules.

**Out of scope:**

- Building migrations unless explicitly required.
- Supporting unknown future schemas.

## Implementation Steps

1. List version constants and validators.
2. Decide behavior for `1.0.0`, current constants, and malformed fixtures.
3. Document whether test fixtures must use current schema or compatibility adapters.
4. Save version policy evidence.

## Files

**Create:**

- `evidence/version-policy-evidence-2026-06-09.md`

**Update:**

- `dev-docs/03-ai/agents-map.md`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [ ] Version policy is explicit by family.
- [ ] Stale fixture update strategy is clear.
- [ ] Unknown versions fail safely.

## Edge Cases

- Historical plan fixtures may use retired parser versions.
- Loosening version validation can hide real schema bugs.

## Notes

Keep this part scoped to Pipeline Checkpoint Contract Reconciliation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
