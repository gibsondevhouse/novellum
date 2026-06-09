---
title: Hidden Caller Sweep
slug: part-001-hidden-caller-sweep
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-003-hidden-caller-sweep
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Use source search and targeted runtime checks to prevent hidden route breakage.

## Scope

**In scope:**

- Search client helpers, tests, docs, and route fetch strings.
- Remove stale helpers or update them to canonical routes.
- Document remaining historical references.

**Out of scope:**

- Editing archived plan history unless it claims current behavior.
- New UI features.

## Implementation Steps

1. Search for retired route strings, owner IDs, task keys, and fixture shapes.
2. Update active callers to canonical helpers.
3. Mark archived references as historical only if needed.
4. Save sweep evidence.

## Files

**Create:**

- `evidence/hidden-caller-sweep-evidence-2026-06-09.md`

**Update:**

- `src/modules/nova/services/context-hooks.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/world-building/services/worldbuild-scan-contract.ts`

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [ ] No active caller uses retired checkpoint contracts.
- [ ] Remaining historical references are documented.
- [ ] Source search evidence is captured.

## Edge Cases

- String-built URLs can evade simple search.
- Archived docs may contain intentionally historical contracts.

## Notes

Keep this part scoped to Pipeline Checkpoint Contract Reconciliation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
