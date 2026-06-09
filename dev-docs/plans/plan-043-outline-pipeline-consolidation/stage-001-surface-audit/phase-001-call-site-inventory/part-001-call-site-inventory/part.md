---
title: Call-Site Inventory
slug: part-001-call-site-inventory
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-call-site-inventory
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Map all outline-related entrypoints and callers so the legacy direct-apply path can be retired without breaking supported user flows.

## Scope

**In scope:**

- Search source, tests, and docs for legacy and canonical outline identifiers.
- Classify each caller as canonical, legacy, test-only, or documentation-only.
- Capture route, service, component, store, and test ownership in evidence.

**Out of scope:**

- Removing code during the audit.
- Changing outline schema or materialization behavior.

## Implementation Steps

1. Run targeted searches for `/api/nova/outline/apply`, `NovaOutlineCard`, `applyAuthorOutlineArtifact`, `author-outline`, `/api/ai/outline/generate`, and outline checkpoint actions.
2. Record every caller with file path, responsibility, and current product surface.
3. Classify each caller as keep, redirect, retire, or update-test.
4. Save the inventory under this part evidence directory.

## Files

**Create:**

- `evidence/call-site-inventory-evidence-2026-06-09.md`

**Update:**

- None

**Reference:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `src/lib/server/outline/outline-materialization-service.ts`
- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Every outline-related caller found by search is represented in the inventory.
- [ ] Legacy direct-apply surfaces are clearly separated from checkpoint surfaces.
- [ ] The next phase can identify the exact files to modify.

## Edge Cases

- Barrel exports may keep dead components reachable.
- Tests may reference retired behavior intentionally or accidentally.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
