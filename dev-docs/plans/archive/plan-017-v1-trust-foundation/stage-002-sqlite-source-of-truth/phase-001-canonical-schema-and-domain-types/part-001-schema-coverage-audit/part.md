---
title: Schema Coverage Audit
slug: part-001-schema-coverage-audit
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-001-canonical-schema-and-domain-types
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Verify that `src/lib/server/db/schema.ts` covers all 22 project-owned entities required by the stage and produce a written gap report. Add any missing tables (DDL only, not migrations).

## Scope

**In scope:**

- Inventory every table currently declared in `schema.ts`.
- Cross-reference against the canonical list: projects, chapters, scenes, beats, stages, characters, character_relationships, locations, lore_entries, plot_threads, timeline_events, consistency_issues, export_settings, scene_snapshots, story_frames, acts, arcs, milestones, writing_styles, templates, system_prompts, chat_instructions.
- Append any missing `CREATE TABLE IF NOT EXISTS …` statements at the bottom of `schema.ts`.
- Write a gap report at `dev-docs/plans/plan-017-v1-trust-foundation/stage-002-sqlite-source-of-truth/phase-001-canonical-schema-and-domain-types/SCHEMA-AUDIT.md`.

**Out of scope:**

- Versioned migration files (`schema_migrations` table) — stage-003.
- Index optimization, ALTER TABLE column adds — capture in audit, defer.
- Repository / domain-type changes — part-002.

## Implementation Steps

1. Run `grep -E '^CREATE TABLE' src/lib/server/db/schema.ts` and list every table found.
2. Build an entity-coverage matrix in `SCHEMA-AUDIT.md` with columns: `entity`, `present`, `notes`.
3. For any missing entity, draft a minimal `CREATE TABLE IF NOT EXISTS …` block with `id TEXT PRIMARY KEY`, FK to `projects(id) ON DELETE CASCADE` where applicable, and `created_at` / `updated_at` integer epoch columns matching the existing convention.
4. Append the new DDL to `schema.ts`.
5. Run `pnpm run check` and `pnpm run test` to confirm no regressions.

## Files

**Create:**

- `dev-docs/plans/plan-017-v1-trust-foundation/stage-002-sqlite-source-of-truth/phase-001-canonical-schema-and-domain-types/SCHEMA-AUDIT.md`

**Update (only if gaps found):**

- `src/lib/server/db/schema.ts`

## Acceptance Criteria

- [ ] `SCHEMA-AUDIT.md` exists and lists all 22 entities with present/missing status.
- [ ] If any entity is missing, DDL is added to `schema.ts` and the audit notes the addition.
- [ ] `pnpm run check` passes.
- [ ] `pnpm run test` passes.

## Edge Cases

- A table may be present but under an unexpected name (e.g. `lore_entries` vs `lore`). Treat naming alignment as a gap and document the chosen canonical name.
- The `stages` table holds story-stage rows, not migration stages — do not confuse with `schema_migrations` (stage-003).

## Notes

- This is a verification-only part. Schema-shape changes that require data migration belong to stage-003.
