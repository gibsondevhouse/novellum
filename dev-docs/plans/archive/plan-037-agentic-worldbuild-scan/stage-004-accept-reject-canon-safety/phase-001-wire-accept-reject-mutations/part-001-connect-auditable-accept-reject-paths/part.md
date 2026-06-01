---
title: Connect Auditable Accept/Reject Paths
slug: part-001-connect-auditable-accept-reject-paths
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Claude Code
phase: phase-001-wire-accept-reject-mutations
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.75d
---

## Objective

Wire proposal accept/reject actions to auditable mutation paths using existing boundaries.

## Scope

**In scope:**

- Endpoint integration and lifecycle/audit metadata handling

**Out of scope:**

- Notification visual polish

## Implementation Steps

1. Integrate proposal UI actions with accept/reject APIs
2. Ensure lifecycle transitions are valid and persisted with audit metadata
3. Handle reject reason requirements and response errors

## Files

**Create:**

- src/modules/world-building/services/worldbuilding-proposal-service.ts

**Update:**

- src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts; src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts

## Acceptance Criteria

- [x] Accept/reject actions are persisted with auditable metadata
- [x] Invalid transitions are blocked with safe error handling

## Edge Cases

- Reject path allows empty reason or skips audit detail

## Notes

Mutation calls must preserve existing SQLite/API boundary patterns.
