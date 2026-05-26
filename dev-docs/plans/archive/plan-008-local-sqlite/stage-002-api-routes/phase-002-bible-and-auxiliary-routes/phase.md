---
title: Bible and Auxiliary Routes
slug: phase-002-bible-and-auxiliary-routes
phase_number: 2
status: draft
owner: Backend Agent
stage: stage-002-api-routes
parts:
  - part-001-bible-entities-api
  - part-002-auxiliary-entities-api
estimated_duration: 1d
---

## Goal

> Build API routes for the story bible entity tables (characters, character_relationships, locations, lore_entries, plot_threads, timeline_events) and the auxiliary tables (consistency_issues, export_settings, story_frames, acts, arcs).

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Bible Entities API Routes](part-001-bible-entities-api/part.md) | `draft` | Backend Agent | 0.5d |
| 002 | [Auxiliary Entities API Routes](part-002-auxiliary-entities-api/part.md) | `draft` | Backend Agent | 0.5d |

## Acceptance Criteria

- [ ] `characters`, `character_relationships`, `locations`, `lore_entries`, `plot_threads`, `timeline_events` all have full CRUD routes
- [ ] `consistency_issues`, `export_settings`, `story_frames`, `acts`, `arcs` all have full CRUD routes
- [ ] All routes filter by `projectId` on collection GET
- [ ] Array fields (Character `traits`, `goals`, `flaws`, `arcs`, `tags`; Location `tags`; LoreEntry) correctly encoded/decoded
- [ ] `pnpm check` and `pnpm lint` pass

## Notes

> `export_settings` is a 1:1 per project — GET by `projectId` is the primary access pattern. Consider adding `GET /api/db/export_settings?projectId=X` that returns a single object (or null) rather than an array.
