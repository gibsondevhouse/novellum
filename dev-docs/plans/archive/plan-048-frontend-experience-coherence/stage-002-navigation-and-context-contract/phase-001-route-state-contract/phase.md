---
title: Route State Contract
slug: phase-001-route-state-contract
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-002-navigation-and-context-contract
parts:
  - part-001-route-state-contract
estimated_duration: 1h
---

## Goal

Define how active project, chapter, scene, workspace, and Nova context are resolved and displayed from route state.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Route State Contract](part-001-route-state-contract/part.md) | `complete` | Codex | 1h |

## Acceptance Criteria

- [x] Route-derived active context is documented for every project workspace.
- [x] Store-derived context cannot silently disagree with the visible route.
- [x] Nova context disclosure reflects the same contract users can see in the UI.

## Notes

This phase should build directly on plan 044 rather than duplicate it.
