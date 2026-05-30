# Evidence — Register Entity Read Tools

**Date:** 2026-05-28
**Part:** phase-002 / part-002

## What was done

Four entity read tools registered in `agent-tools.ts`:
- `project.list_scenes` → `GET /api/db/scenes?projectId=...`
- `project.list_characters` → `GET /api/db/characters?projectId=...`
- `project.list_locations` → `GET /api/db/locations?projectId=...`
- `project.get_scene` → `GET /api/db/scenes/{sceneId}`

All are pure read operations over existing API endpoints. No write path.

## File evidence

- `src/modules/nova/services/agent-tools.ts` — all four tool registrations

## Source contract check

```
tests/nova/agent-source-contracts.test.ts
  ✓ modules/nova/services/agent-tools.ts > does not import editor mutation paths
  ✓ modules/nova/services/agent-tools.ts > does not import manuscript write paths
  ✓ modules/nova/services/agent-tools.ts > does not import editor module direct imports
  ✓ modules/nova/services/agent-tools.ts > does not import scene store (mutation surface)
  ✓ modules/nova/services/agent-tools.ts > does not import editor store (mutation surface)
  ✓ modules/nova/services/agent-tools.ts > does not import manuscript mutation function names
```
