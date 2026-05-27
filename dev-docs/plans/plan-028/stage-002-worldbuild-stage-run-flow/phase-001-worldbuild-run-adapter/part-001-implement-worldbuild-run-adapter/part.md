---
title: Implement Worldbuild Run Adapter
slug: part-001-implement-worldbuild-run-adapter
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-worldbuild-run-adapter
started_at: 2026-05-26T17:50:00Z
completed_at: 2026-05-26T17:52:00Z
estimated_duration: 2d
---

## Objective

Implement a single worldbuild run adapter that maps selected stage scope to existing pipeline endpoints and returns normalized draft artifact/checkpoint output.

## Scope

**In scope:**

- Payload builder from `PipelineHierarchyPath` + stage key + instruction/options.
- Run adapter calling existing `/api/ai` + pipeline parser flow.
- Draft checkpoint staging via existing `/api/db/project-metadata/.../pipeline/...` operations.

**Out of scope:**

- New backend endpoints or schema changes.
- `vibe-author` run parity.

## Implementation Steps

1. Add adapter types and payload builder for worldbuild stage calls.
2. Implement run function with success/failure normalization.
3. Stage returned artifact envelope as draft checkpoint and return lifecycle context.

## Files

**Create:**

- `src/modules/outline/services/worldbuild-pipeline-runner.ts`
- `tests/outline/worldbuild-pipeline-runner.test.ts`

**Update:**

- `src/lib/ai/types.ts`
- `src/routes/projects/[id]/outline/+page.svelte`
- `src/modules/world-building/stores/world-building-store.svelte.ts`

## Acceptance Criteria

- [x] Adapter input includes stage key, active hierarchy path, and optional instruction/options.
- [x] Adapter output includes draft artifact envelope + checkpoint id/lifecycle.
- [x] Transport/parser/checkpoint errors are normalized into deterministic UI-safe states.
- [x] No component builds raw orchestration payloads directly.

## Edge Cases

- Missing `stageId` or invalid hierarchy path blocks calls with explicit reason.
- Duplicate submit attempts during `running` state are prevented.

## Notes

Reuse existing pipeline artifact/checkpoint contracts; do not duplicate envelope schemas.
