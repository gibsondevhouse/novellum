---
title: ZIP Export Flow
slug: phase-001-zip-export-flow
phase_number: 1
status: ready
owner: Planner Agent
stage: stage-002-zip-portability-workflow
parts:
  - part-001-backup-zip-builder-and-download
  - part-002-export-modal-backup-mode
estimated_duration: 1d
---

## Goal

> Build the end-to-end portability export path: snapshot-to-ZIP generation, archive naming, and user-triggered download from the export UI.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Backup ZIP Builder and Download](part-001-backup-zip-builder-and-download/part.md) | `draft` | backend | 0.5d |
| 002 | [Export Modal Backup Mode](part-002-export-modal-backup-mode/part.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] User can export a portability ZIP without server calls
- [ ] ZIP contains manifest, DB payloads, and KV payloads
- [ ] Filename includes project-safe slug + timestamp
- [ ] Export modal exposes backup mode with clear messaging

## Notes

> Reuse existing download helper behavior in export UI for consistent browser handling.
