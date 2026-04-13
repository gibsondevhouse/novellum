---
title: Consistency Engine UI
slug: phase-002-consistency-engine-ui
phase_number: 2
status: complete
owner: Frontend Agent
stage: stage-002-phase-2-ai-agents
parts:
  - part-001-issue-display-panel
  - part-002-issue-resolution-flow
estimated_duration: 2d
---

## Goal

Build the Consistency Engine UI: a panel that displays the structured issue list produced by ContinuityAgent, lets users drill into each issue, and provides a resolution workflow (mark resolved, dismiss, or navigate to the flagged location).

## Parts

| #   | Part                                                            | Status  |
| --- | --------------------------------------------------------------- | ------- |
| 001 | [Issue Display Panel](part-001-issue-display-panel/part.md)     | `draft` |
| 002 | [Issue Resolution Flow](part-002-issue-resolution-flow/part.md) | `draft` |

## Entry Criteria

- ContinuityAgent implemented and producing `ConsistencyIssue[]` output (phase-001 complete)
- `ConsistencyIssue` Dexie table exists with schema: `{ id, projectId, type, severity, description, entityIds, sceneId, status, createdAt }`
- `ConsistencyRepository` available for CRUD on issues

## Exit Criteria

- Consistency panel accessible from sidebar; shows count badge when open issues exist
- Issue list grouped by type (timeline, character, lore, plot); sortable by severity
- Clicking an issue highlights the relevant scene/entity and shows full issue description
- User can mark an issue `resolved` or `dismissed`; status change persists to Dexie
- Re-running ContinuityAgent on same scope appends new issues rather than replacing existing ones
- Empty state shown when no open issues exist
