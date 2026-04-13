---
title: Vitals Budgeting and Asset Delivery Optimization
slug: part-001-vitals-budgeting-and-asset-delivery-optimization
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-core-web-vitals-and-runtime-resilience
started_at: 2026-04-12
completed_at: 2026-04-12
estimated_duration: 4d
---

## Objective

Lock in measurable responsiveness improvements by combining Core Web Vitals budgeting with robust runtime asset delivery and failure handling.

## Scope

**In scope:**

- Core Web Vitals instrumentation and reporting baseline
- LCP, INP, and CLS hotspot mitigation for top user flows
- Chunk/preload failure handling and stale-deploy resilience
- Cache and service-worker behavior tuning for repeat navigation speed

**Out of scope:**

- Backend infrastructure changes outside frontend runtime impact
- Major architectural rewrites that exceed refactor boundaries

## Implementation Steps

1. Establish field and lab measurement baselines and define acceptance budgets.
2. Optimize LCP discovery/prioritization and reduce render delay bottlenecks.
3. Reduce INP long-task pressure and layout-thrashing hotspots.
4. Eliminate major CLS sources (unsized media, late insertion shifts, disruptive animations).
5. Add runtime safeguards for stale chunks and validate cache/service-worker behavior.

## Files

**Create:**

- `dev-docs/plans/refactor-001-ui_ux-polish/stage-004-performance-and-resilience-polish/phase-001-core-web-vitals-and-runtime-resilience/part-001-vitals-budgeting-and-asset-delivery-optimization/evidence/vitals-baseline-2026-04-12.md`

**Update:**

- `src/routes/+layout.svelte`
- `src/routes/+layout.ts`
- `src/service-worker.ts`
- `vite.config.ts`
- `tests/**`

## Acceptance Criteria

- [ ] p75 budgets meet LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 on target flows.
- [ ] Critical layout shifts and long-task bottlenecks are reduced with evidence.
- [ ] Runtime behavior handles stale chunk/preload failures predictably.
- [ ] Performance evidence artifacts include both field and lab perspective.

## Edge Cases

- Ensure optimizations do not degrade accessibility semantics or keyboard flow.
- Avoid over-prioritizing assets in a way that harms total page responsiveness.
- Validate behavior on slower devices and constrained networks.

## Notes

Treat performance as a UX contract; regressions should fail the plan quality gate.
