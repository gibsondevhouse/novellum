---
title: Snapshot Extraction Services
slug: phase-002-snapshot-extraction-services
phase_number: 2
status: ready
owner: Planner Agent
stage: stage-001-portability-contract-and-snapshot-foundation
parts:
  - part-001-dexie-and-kv-snapshot-service
estimated_duration: 0.5d
---

## Goal

> Build deterministic snapshot extraction services that capture all portable data from Dexie and selected browser key-value storage.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Dexie and KV Snapshot Service](part-001-dexie-and-kv-snapshot-service/part.md) | `draft` | backend | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] Snapshot includes all Dexie tables listed in DB index
- [ ] Snapshot includes selected localStorage keys required for planning continuity
- [ ] Snapshot output shape is stable and test-covered
- [ ] Service excludes ephemeral session-only keys by design

## Notes

> Keep extraction logic pure and reusable. ZIP assembly must not directly query Dexie tables.
