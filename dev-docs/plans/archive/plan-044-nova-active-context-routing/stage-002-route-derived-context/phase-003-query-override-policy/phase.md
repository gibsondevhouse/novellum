---
title: Query Override Policy
slug: phase-003-query-override-policy
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-002-route-derived-context
---

## Resolution Priority Policy

To handle edge cases where a route parameter and a query parameter might conflict, we define the following priority:

1.  **Query Parameter (`searchParams`)**: Highest priority. This allows features like the Outliner or global search to link to a specific context (e.g., "Ask Nova about this scene") even if the user is on a generic route.
2.  **Route Parameter (`params`)**: Second priority. Provides context for canonical deep routes (e.g., editor, chapter detail).
3.  **Null**: Fallback.

### Verified Scenarios

| URL | Resolved Scene ID | Resolved Chapter ID |
| :--- | :--- | :--- |
| `/projects/1/editor/2` | `2` | `null` |
| `/projects/1/editor/2?sceneId=3` | `3` (Override) | `null` |
| `/projects/1/editor?sceneId=3` | `3` | `null` |
| `/projects/1/arcs/a/acts/b/chapters/4` | `null` | `4` |
| `/projects/1/arcs/a/acts/b/chapters/4?chapterId=5` | `null` | `5` (Override) |

## Quality Gate Checklist

- [x] Conflict policy defined? Yes.
- [x] Overrides documented? Yes.
