---
title: Pacing Telemetry and Signals
slug: stage-006-pacing-telemetry-and-signals
stage_number: 6
status: complete
owner: Frontend Agent
plan: refactor-002-story-planning-workspace
phases:
  - phase-001-structural-counts-and-density-signals
estimated_duration: 3d
risk_level: low
---

## Goal

Add lightweight pacing telemetry so users can detect structure imbalance without leaving the planning workspace.

## Phases

- 001: [Structural Counts and Density Signals](phase-001-structural-counts-and-density-signals/phase.md) (`draft`, 3d)

## Entry Criteria

- Beat model updates from Stage 005 are available
- Story hierarchy counts can be computed from load data

## Exit Criteria

- Counts for acts, chapters, scenes, and beats are visible in navigator and planning header
- Density warnings highlight underplanned and overloaded sections
- Signals are informative and non-blocking

## Notes

Keep telemetry descriptive, not prescriptive.
