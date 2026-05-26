---
title: Backup Contract and Versioning
slug: phase-001-backup-contract-and-versioning
phase_number: 1
status: ready
owner: Planner Agent
stage: stage-001-portability-contract-and-snapshot-foundation
parts:
  - part-001-manifest-schema-and-compatibility-policy
estimated_duration: 0.5d
---

## Goal

> Define the portability archive contract and explicit compatibility behavior so imports are deterministic and safe across app versions.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Manifest Schema and Compatibility Policy](part-001-manifest-schema-and-compatibility-policy/part.md) | `draft` | backend | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] Manifest includes `formatVersion`, `exportedAt`, `appVersion`, `dbSchemaVersion`, `tableCounts`, and checksums
- [ ] Compatibility matrix for older/newer backups is codified in service logic
- [ ] Unsupported backups fail with actionable UI error messages
- [ ] Manifest schema is documented in developer docs

## Notes

> The manifest is the long-term portability contract. Breaking changes require a format version bump and migration path.
