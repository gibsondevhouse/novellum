---
title: Run Repository API
slug: part-001-run-repository-api
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-002-run-repository-api
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Implement typed runtime ledger accessors that let server routes and worker code persist agent execution safely.

## Scope

**In scope:**

- Add TypeScript runtime record types and lifecycle guards.
- Add server repository functions for runs, steps, tool calls, artifacts, usage, errors, and redaction.
- Add route-level read APIs for project-scoped run history and active run status if needed by existing surfaces.

**Out of scope:**

- Building the worker scheduler.
- Adding frontend dashboards beyond minimal status route support.

## Implementation Steps

1. Define runtime TypeScript types and lifecycle validators.
2. Implement repository functions under server-owned runtime modules.
3. Add safe serialization and redaction helpers.
4. Add unit tests for lifecycle transitions and persistence operations.
5. Save repository evidence under this part.

## Files

**Create:**

- `src/lib/server/agent-runtime/types.ts`
- `src/lib/server/agent-runtime/index.ts`
- `src/lib/server/agent-runtime/run-ledger.ts`
- `src/lib/server/agent-runtime/redaction.ts`
- `tests/agent-runtime/run-ledger.test.ts`
- `tests/agent-runtime/redaction.test.ts`
- `evidence/run-repository-api-2026-06-11.md`

**Update:**

- `src/routes/api/nova/runs/+server.ts`
- `src/routes/api/nova/runs/[runId]/+server.ts`

**Reference:**

- `src/lib/server/db/index.ts`
- `src/lib/server/api-helpers.ts`
- `src/lib/ai/providers/types.ts`
- `tests/lib/app-error.test.ts`
- `tests/nova/nova-session.test.ts`

## Acceptance Criteria

- [ ] Runtime repositories expose typed create, append, transition, query, and redact operations.
- [ ] Invalid lifecycle transitions are rejected.
- [ ] Unit tests cover run creation, step append, tool call capture, artifact link, usage update, error capture, and redaction.

## Edge Cases

- Provider usage may arrive only after streaming completes.
- Failed runs may have partial steps and no final artifact.

## Notes

Do not let client code write ledger records directly. Runtime persistence should remain a server concern.
