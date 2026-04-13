---
title: Core Web Vitals and Runtime Resilience
slug: phase-001-core-web-vitals-and-runtime-resilience
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-004-performance-and-resilience-polish
parts:
  - part-001-vitals-budgeting-and-asset-delivery-optimization
estimated_duration: 4d
---

## Goal

Achieve measurable responsiveness and stability targets under realistic usage and deployment conditions.

## Parts

| #   | Part                                                                                                                  | Status  | Assigned To    | Est. Duration |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------- | -------------- | ------------- |
| 001 | [Vitals Budgeting and Asset Delivery Optimization](part-001-vitals-budgeting-and-asset-delivery-optimization/part.md) | `draft` | Frontend Agent | 4d            |

## Acceptance Criteria

- [ ] Core Web Vitals collection and reporting path is established (field plus lab)
- [ ] LCP, INP, CLS budgets validated against acceptance thresholds
- [ ] Runtime resilience behavior for stale chunks/load failures is implemented and verified
- [ ] Perf evidence artifacts captured and linked

## Notes

Optimization decisions should prioritize user-perceived responsiveness, not only synthetic benchmark scores.
