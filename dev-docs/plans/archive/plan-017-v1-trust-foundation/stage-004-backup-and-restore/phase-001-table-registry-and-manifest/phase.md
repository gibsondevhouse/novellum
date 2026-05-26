---
title: Table Registry and Manifest
slug: phase-001-table-registry-and-manifest
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-004-backup-and-restore
parts:
  - part-001-table-registry
  - part-002-manifest-builder
estimated_duration: 1d
---

## Goal

Establish the two foundational, side-effect-free modules that every later phase depends on: the canonical project-table registry and the manifest builder/validator. Both must be pure, fully unit-tested, and free of any I/O.

## Parts

| #   | Part                                                  | Status  | Assigned To | Est. Duration |
| --- | ----------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Table Registry](part-001-table-registry/part.md)     | `draft` | backend     | 0.5d          |
| 002 | [Manifest Builder](part-002-manifest-builder/part.md) | `draft` | backend     | 0.5d          |

## Acceptance Criteria

- [ ] `src/lib/server/backup/table-registry.ts` enumerates every project-owned table from `SCHEMA_SQL` with explicit include/exclude reasons; an unhandled table fails the type system or the test suite.
- [ ] `src/lib/server/backup/manifest.ts` exports `buildManifest(input)` and `validateManifest(value)` that match the research §6 shape exactly: `format`, `formatVersion`, `appVersion`, `schemaVersion`, `exportedAt`, `project`, `tables`, `compatibility`.
- [ ] `appVersion` is read from a single canonical source (`src/lib/version.ts`); `schemaVersion` is read from the migration registry's max version.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Source: research §6 file lists.
- Stage-004 is high-risk; locking these two pure modules first lets every subsequent phase be tested in isolation.
- The registry must drive the schema-coverage tests added by phase-002 — i.e. backup/restore code paths import from this registry, never hand-list tables.
