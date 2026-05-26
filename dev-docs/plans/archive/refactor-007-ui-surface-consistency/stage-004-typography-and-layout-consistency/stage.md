---
title: Typography & Layout Consistency
slug: stage-004-typography-and-layout-consistency
stage_number: 4
status: complete
owner: Planner Agent
plan: refactor-007-ui-surface-consistency
phases:
  - phase-001-typography-layout-normalization
estimated_duration: 2d
risk_level: medium
---

## Goal

Normalize typography, prose rhythm, and layout cadence across surfaces so the application reads as one coherent product system.

## Phases

| #   | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Typography & Layout Normalization](phase-001-typography-layout-normalization/phase.md) | `draft` | 2d |

## Entry Criteria

- Stage 003 primitive migration is complete.
- Shared token and type scale references are stable.

## Exit Criteria

- Font-family and text-scale deviations are remediated.
- Prose width token enforcement is applied on prose surfaces.
- Sidebar and panel spacing rhythm is normalized.
- Evidence includes before/after visual diffs and grep outputs.

## Notes

Motion rules must comply with prefers-reduced-motion where animations are present.
