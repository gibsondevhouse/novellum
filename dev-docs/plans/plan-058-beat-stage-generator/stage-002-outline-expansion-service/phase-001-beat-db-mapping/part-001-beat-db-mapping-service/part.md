---
title: Beat DB Mapping Service
slug: part-001-beat-db-mapping-service
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-beat-db-mapping
started_at: ~
completed_at: ~
estimated_duration: undefined
---

## Objective

Modify outline materialization to map generated beats/stages to SQLite tables.

## Scope

**In scope:**

- Insert generated beat details inside transactions.
- Setup relationships to parent scenes.

**Out of scope:**



## Implementation Steps

1. Update outline-materialization-service.ts.
2. Run queries validations.

## Files

**Create:**

- _(none)_

**Update:**

- `src/lib/server/outline/outline-materialization-service.ts`

## Acceptance Criteria

- [ ] Beats map atomically in outline hierarchy writes.

## Edge Cases

- _(none)_

## Notes

> Part-level context for Beat DB Mapping Service.
