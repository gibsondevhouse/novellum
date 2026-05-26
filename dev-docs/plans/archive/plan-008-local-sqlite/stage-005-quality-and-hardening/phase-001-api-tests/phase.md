---
title: API Route Tests
slug: phase-001-api-tests
phase_number: 1
status: draft
owner: Reviewer Agent
stage: stage-005-quality-and-hardening
parts:
  - part-001-route-unit-tests
estimated_duration: 0.5d
---

## Goal

> Write Vitest unit tests for the SQLite API routes covering CRUD operations, validation errors, filter params, and JSON array (de)serialization correctness.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Route Unit Tests](part-001-route-unit-tests/part.md) | `draft` | Reviewer Agent | 0.5d |

## Acceptance Criteria

- [ ] Tests exist for projects CRUD (create, read, update, delete, 404 on unknown ID)
- [ ] Tests exist for chapters CRUD + `?projectId` filter + reorder
- [ ] Tests cover Scene JSON array fields round-trip (write arrays, read back as arrays)
- [ ] Tests cover Character array fields round-trip
- [ ] All tests use an in-memory SQLite DB (`:memory:`) not the real `novellum.db`
- [ ] `pnpm test` passes with all new tests green

## Notes

> Use an in-memory SQLite database for tests: `new Database(':memory:')`. Tests should call route handlers directly (not over HTTP) to keep them fast and isolated from the running server.
