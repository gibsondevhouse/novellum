---
title: Hub Metrics Service
slug: part-001-hub-metrics-service
part_number: 1
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-metrics-data-layer
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `HubMetricsService` — a typed service that queries Dexie for arc, act, chapter, and scene counts per project. Returns a strongly-typed `ProjectMetrics` object with a `ready` flag per metric so the UI can render "–" gracefully when a table does not yet exist.

## Context

- Dexie `db` instance is at `src/lib/db/db.ts`
- `chapters` and `scenes` tables exist
- `arcs` and `acts` tables do not yet exist in the schema — the service must not throw when they are absent
- Module: `src/modules/project/services/`

## Scope

**In scope:**

- `src/modules/project/services/hub-metrics-service.ts`
- Type: `ProjectMetrics` in `src/modules/project/types.ts`
- Export from `src/modules/project/index.ts`

**Out of scope:**

- Arc/act table creation or schema changes
- Completion percentage logic (future; service returns totals only)

## Types

```ts
export interface MetricValue {
  count: number
  ready: boolean  // false when the underlying table doesn't exist yet
}

export interface ProjectMetrics {
  arcs: MetricValue
  acts: MetricValue
  chapters: MetricValue
  scenes: MetricValue
}
```

## Implementation Steps

1. Create `src/modules/project/services/hub-metrics-service.ts`

1. Implement `getProjectMetrics(projectId: string): Promise<ProjectMetrics>`:

```ts
async function getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
  const [chapters, scenes] = await Promise.all([
    db.chapters.where('projectId').equals(projectId).count(),
    db.scenes.where('projectId').equals(projectId).count(),
  ])
  return {
    arcs:     { count: 0, ready: false },  // table not yet in schema
    acts:     { count: 0, ready: false },  // table not yet in schema
    chapters: { count: chapters, ready: true },
    scenes:   { count: scenes, ready: true },
  }
}
```

1. Add `ProjectMetrics`, `MetricValue` to `src/modules/project/types.ts`

1. Export `getProjectMetrics` from `src/modules/project/index.ts`

## Files

**Create:**

- `src/modules/project/services/hub-metrics-service.ts`

**Update:**

- `src/modules/project/types.ts`
- `src/modules/project/index.ts`

## Acceptance Criteria

- [ ] `getProjectMetrics(projectId)` returns correct chapter and scene counts matching Dexie
- [ ] `arcs` and `acts` return `{ count: 0, ready: false }` without throwing
- [ ] `ProjectMetrics` and `MetricValue` types exported from `index.ts`
- [ ] `pnpm run check` exits clean

## Edge Cases

- `projectId` for a freshly created project with no chapters/scenes returns all zeros with `ready: true` for chapters and scenes
- If `db.arcs` is added to the schema in a future version, the service can be updated to query it — the `ready: false` fallback must not be a permanent hardcode but a capability check

## Notes

- Use `try/catch` around the `arcs`/`acts` queries when those tables are eventually added — do not assume their absence is permanent
