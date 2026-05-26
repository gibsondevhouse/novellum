---
title: Metrics Data Layer
slug: phase-001-metrics-data-layer
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-002-structural-metrics-carousel
parts:
  - part-001-hub-metrics-service
estimated_duration: 0.5d
---

## Goal

Create `HubMetricsService` — a lightweight service that queries Dexie for the per-project counts needed by the structural metric cards. Returns graceful zeroes when entity tables (`arcs`, `acts`) are not yet in the schema.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Hub Metrics Service](part-001-hub-metrics-service/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] `HubMetricsService.getProjectMetrics(projectId)` returns `{ arcs, acts, chapters, scenes }` counts
- [ ] Returns `0` (with `ready: false`) for `arcs` and `acts` until those tables exist in Dexie
- [ ] Chapter and scene counts match what Dexie reports
- [ ] Exported from `src/modules/project/index.ts`
- [ ] `pnpm run check` exits clean

## Notes

- Use `try/catch` or optional-chaining on `db.arcs` and `db.acts` to guard against missing tables
- The return type must include a `ready` flag per metric so the UI can render "–" vs "0"
