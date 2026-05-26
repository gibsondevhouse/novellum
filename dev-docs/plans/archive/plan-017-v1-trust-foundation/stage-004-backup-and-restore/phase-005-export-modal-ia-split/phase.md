---
title: Export Modal IA Split
slug: phase-005-export-modal-ia-split
phase_number: 5
status: complete
owner: Planner Agent
stage: stage-004-backup-and-restore
parts:
  - part-001-separate-backup-from-export
  - part-002-retire-dexie-portability
estimated_duration: 1d
---

## Goal

In the UI, **Manuscript Export** (Markdown / DOCX / EPUB — owned by plan-018) and **Project Backup** (`.novellum`) become two distinct affordances. Old Dexie portability code is retired.

## Parts

| #   | Part                                                                              | Status  | Assigned To | Est. Duration |
| --- | --------------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Separate Backup from Export](part-001-separate-backup-from-export/part.md)       | `draft` | stylist     | 0.5d          |
| 002 | [Retire Dexie Portability](part-002-retire-dexie-portability/part.md)             | `draft` | architect   | 0.5d          |

## Acceptance Criteria

- [ ] `ExportModal.svelte` splits into "Manuscript Export" (placeholder hand-off to plan-018) and "Project Backup".
- [ ] "Project Backup" calls `POST /api/backup/projects/[id]`; restore flow uses preview → confirm → restore endpoints.
- [ ] `src/modules/export/services/portability/*` no longer imports `$lib/db/index`.
- [ ] `legacy-dexie-boundaries` Vitest guardrail asserts no production import of the legacy Dexie modules from new SQLite-backed code paths.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Coordinate with plan-018 stage-001 owner before flipping any UI strings that affect their copy work.
