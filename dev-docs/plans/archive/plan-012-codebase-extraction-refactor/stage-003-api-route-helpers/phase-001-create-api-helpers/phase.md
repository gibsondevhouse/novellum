---
title: Create API Helpers & Migrate Routes
slug: phase-001-create-api-helpers
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-003-api-route-helpers
parts:
  - part-001-api-helper-impl
  - part-002-migrate-post-handlers
estimated_duration: 1.5d
---

## Goal

> Create the server-side API helper factory and migrate all POST handlers to use it.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
|---|------|--------|-------------|---------------|
| 001 | [API Helper Implementation](part-001-api-helper-impl/part.md) | `draft` | Backend | 0.5d |
| 002 | [Migrate POST Handlers](part-002-migrate-post-handlers/part.md) | `draft` | Backend | 1d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Factory handles UUID, timestamps, defaults, validation, and SQLite insert
- [ ] All 14 POST handlers migrated
