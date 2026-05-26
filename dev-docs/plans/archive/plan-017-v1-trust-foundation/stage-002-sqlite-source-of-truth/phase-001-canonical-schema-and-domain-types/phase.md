---
title: Canonical Schema and Domain Types
slug: phase-001-canonical-schema-and-domain-types
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-002-sqlite-source-of-truth
parts:
  - part-001-schema-coverage-audit
  - part-002-domain-types-extraction
estimated_duration: 1.5d
---

## Goal

Declare `src/lib/server/db/schema.ts` the canonical schema and produce `src/lib/db/domain-types.ts` as the single, framework-agnostic entity-type module that every runtime consumer (server routes, repositories, components) can import without pulling in Dexie.

## Parts

| #   | Part                                                                       | Status  | Assigned To | Est. Duration |
| --- | -------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Schema Coverage Audit](part-001-schema-coverage-audit/part.md)            | `draft` | backend     | 0.5d          |
| 002 | [Domain Types Extraction](part-002-domain-types-extraction/part.md)        | `draft` | backend     | 1d            |

## Acceptance Criteria

- [ ] All 22 entities listed in stage exit criteria are confirmed present (or added) in `src/lib/server/db/schema.ts`.
- [ ] `src/lib/db/domain-types.ts` exists, exports every project-owned entity interface, and is imported by at least one server route and one client component as a smoke test.
- [ ] `src/lib/db/types.ts` no longer claims to define "Dexie types"; it re-exports from `domain-types.ts` for back-compat, with a deprecation comment.
- [ ] `pnpm run check` passes.

## Notes

- Schema audit baseline: 22 `CREATE TABLE` statements already exist in `src/lib/server/db/schema.ts` (projects, chapters, scenes, beats, characters, character_relationships, locations, lore_entries, plot_threads, timeline_events, consistency_issues, export_settings, scene_snapshots, story_frames, acts, arcs, writing_styles, templates, system_prompts, chat_instructions, stages, milestones).
- Do not refactor the schema in this phase — coverage check + naming hygiene only. Versioned migrations are stage-003.
