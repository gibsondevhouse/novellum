---
title: Route or Test Updates
slug: part-001-route-or-test-updates
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-002-route-or-test-updates
started_at: 2026-06-12
completed_at: 2026-06-12
estimated_duration: TBD
---

## Objective

Update product code or test fixtures so supported contracts pass and retired contracts fail deliberately.

## Scope

**In scope:**

- Route handler changes selected by compatibility decision.
- E2e fixture updates to current schemas.
- Route tests for unsupported legacy behavior.

**Out of scope:**

- Expanding product capabilities beyond contract reconciliation.
- Worldbuilding merge/diff behavior from plan 047.

## Implementation Steps

1. Update route handlers or fixtures according to the decision record.
2. Replace stale assertions with current contract assertions.
3. Add unsupported behavior tests where routes intentionally reject legacy payloads.
4. Run targeted e2e specs.

## Files

**Create:**

- `evidence/route-or-test-updates-evidence-2026-06-12.md`

**Update:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `tests/e2e/vibe-author-review-gates.spec.ts`
- `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts`
- `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts`
- `src/modules/world-building/services/worldbuilding-proposal-service.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/components/WorldbuildingProposedTile.svelte`
- `tests/world-building/worldbuilding-proposal-service.test.ts`

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [x] Supported checkpoint contracts pass tests.
- [x] Retired contracts have explicit failure tests or no longer appear as supported specs.
- [x] No tests depend on malformed current fixtures.

## Edge Cases

- Changing generic metadata route can affect outline checkpoint review/reject.
- Fixture updates should not bypass real validators.

## Notes

Stale worldbuild E2E fixtures now use current envelope fields, proposal decision helpers include project context, and targeted/full E2E validation passed under Chromium.
