---
part: part-001-hub-metrics-service
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `src/lib/db/db.ts` — confirm exact table names (`chapters`, `scenes`) and their `projectId` index
- [ ] Read `src/modules/project/types.ts` — note existing types before adding `MetricValue` and `ProjectMetrics`
- [ ] Read `src/modules/project/index.ts` — note current exports

## Post-Implementation

- [ ] `getProjectMetrics` returns correct counts — test manually by creating a project with 3 chapters and 9 scenes in dev
- [ ] `arcs` and `acts` return `{ count: 0, ready: false }` — verify in test
- [ ] `ProjectMetrics` and `MetricValue` interfaces in `types.ts`
- [ ] `getProjectMetrics` exported from `index.ts`
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
