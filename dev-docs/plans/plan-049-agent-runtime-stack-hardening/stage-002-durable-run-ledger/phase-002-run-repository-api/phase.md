---
title: Run Repository API
slug: phase-002-run-repository-api
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-002-durable-run-ledger
parts:
  - part-001-run-repository-api
estimated_duration: TBD
---

## Goal

Add typed server-side repository APIs over the runtime ledger schema.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Run Repository API](part-001-run-repository-api/part.md) | `draft` | unassigned | TBD |

## Acceptance Criteria

- [ ] Runtime repositories expose typed create, append, transition, query, and redact operations.
- [ ] Invalid lifecycle transitions are rejected.
- [ ] Unit tests cover run creation, step append, tool call capture, artifact link, usage update, error capture, and redaction.

## Notes

Keep API boundaries server-side. Browser state should read summarized runtime status through routes or existing stores.
