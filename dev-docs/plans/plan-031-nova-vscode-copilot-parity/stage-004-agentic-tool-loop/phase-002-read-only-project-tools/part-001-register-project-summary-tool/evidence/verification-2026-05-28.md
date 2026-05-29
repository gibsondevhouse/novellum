# Evidence — Register Project Summary Tool

**Date:** 2026-05-28
**Part:** phase-002 / part-001

## What was done

`project.get_summary` tool registered in `agent-tools.ts`. Fetches `GET /api/db/projects/{projectId}` and returns the full project record. Pure read — no write path.

## File evidence

- `src/modules/nova/services/agent-tools.ts` — `project.get_summary` tool registration

## Test coverage

Covered by `tests/nova/agent-source-contracts.test.ts` (no forbidden imports) and runtime integration via `agent-loop.test.ts` tool dispatch path.

## Quality gate results

```
pnpm check:   0 errors
pnpm test:    1358/1358 passed
```
