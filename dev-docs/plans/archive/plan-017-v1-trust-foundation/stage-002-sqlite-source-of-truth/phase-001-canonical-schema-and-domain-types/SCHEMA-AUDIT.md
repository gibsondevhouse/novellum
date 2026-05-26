# Schema Coverage Audit

**Date:** 2026-04-28
**Part:** [phase-001-canonical-schema-and-domain-types/part-001-schema-coverage-audit](../part-001-schema-coverage-audit/part.md)
**Source file:** [src/lib/server/db/schema.ts](../../../../../../src/lib/server/db/schema.ts)

## Method

`grep -E '^CREATE TABLE' src/lib/server/db/schema.ts` produced 22 unique tables. Each was cross-referenced against the canonical entity list defined in the parent stage exit criteria.

## Coverage Matrix

| #   | Canonical Entity            | Table Name                | Present | Notes                                                                                  |
| --- | --------------------------- | ------------------------- | ------- | -------------------------------------------------------------------------------------- |
| 1   | projects                    | `projects`                | ✓       | 16 columns; `lastOpenedAt`, `stylePresetId` supported.                                  |
| 2   | chapters                    | `chapters`                | ✓       | Has `actId`, `arcRefs` for hierarchy linkage.                                          |
| 3   | scenes                      | `scenes`                  | ✓       | Includes `povCharacterId`, `locationId`, `timelineEventId`, `arcRefs`.                 |
| 4   | beats                       | `beats`                   | ✓       | Polymorphic parent: `sceneId` OR `arcId`.                                              |
| 5   | stages                      | `stages`                  | ✓       | FK to `beats` via `beatId`. **Naming caveat:** distinct from `schema_migrations` (stage-003); story-stage rows only. |
| 6   | characters                  | `characters`              | ✓       | Wide entity (~50 columns) — story bible canonical.                                     |
| 7   | character_relationships     | `character_relationships` | ✓       | Unique index on `(projectId, characterAId, characterBId)` enforces pair uniqueness.    |
| 8   | locations                   | `locations`               | ✓       | Includes realm/landmark/faction linkage and `kind` discriminator.                      |
| 9   | lore_entries                | `lore_entries`            | ✓       | Canonical name; no `lore` alias in code.                                               |
| 10  | plot_threads                | `plot_threads`            | ✓       | `relatedSceneIds` / `relatedCharacterIds` are JSON arrays.                             |
| 11  | timeline_events             | `timeline_events`         | ✓       | `date` is free-form text (in-world calendar).                                          |
| 12  | consistency_issues          | `consistency_issues`      | ✓       | `entityIds` JSON array; sceneId / arcId nullable.                                      |
| 13  | export_settings             | `export_settings`         | ✓       | One row per project; export profile params.                                            |
| 14  | scene_snapshots             | `scene_snapshots`         | ✓       | Polymorphic: `sceneId` OR `arcId`; immutable (no `updatedAt`).                         |
| 15  | story_frames                | `story_frames`            | ✓       | One per project (premise / theme / toneNotes).                                         |
| 16  | acts                        | `acts`                    | ✓       | FK to `arcs` via `arcId` (nullable to allow act-only flows).                           |
| 17  | arcs                        | `arcs`                    | ✓       | `arcType` nullable; `status` defaults `'planned'`.                                     |
| 18  | milestones                  | `milestones`              | ✓       | FK to `acts` via `actId`; `chapterIds` JSON array.                                     |
| 19  | writing_styles              | `writing_styles`          | ✓       | Per-project style presets.                                                             |
| 20  | templates                   | `templates`               | ✓       | Reusable scaffolds; `type` discriminator.                                              |
| 21  | system_prompts              | `system_prompts`          | ✓       | `isDefault` integer flag.                                                              |
| 22  | chat_instructions           | `chat_instructions`       | ✓       | `isDefault` integer flag.                                                              |

## Result

**All 22 canonical entities are present.** No DDL additions required for this part.

## Observations (deferred to later stages)

These are not gaps for stage-002 but should inform later stages:

1. **No `schema_migrations` table yet.** Stage-003 will add this; the `migrations.ts` runner currently advances version via simple boolean tracking.
2. **No `app_preferences` table yet.** Phase-002 part-003 will add it.
3. **`acts.arcId` is nullable** — the new hierarchy work in plan-013 created acts that can exist without an arc parent. Confirmed intentional.
4. **JSON-as-TEXT columns** (e.g. `arcRefs`, `entityIds`, `aliases`) — every list-shaped column stores serialized JSON. Domain-types extraction (part-002) must surface these as `string[]` / structured types and serialize at the repository boundary.
5. **`createdAt` / `updatedAt` use TEXT (ISO 8601 strings), not INTEGER epoch.** This contradicts the part-001 part doc's suggestion of "epoch milliseconds as `number`" — the actual project convention is ISO strings. Domain types must follow the existing convention for back-compat. Audit flag updated to: epoch normalization is **not** required.
6. **Wide `characters` table.** Consider splitting `characters` into core + bible-fields in a future stage if the row size becomes a perf issue. **Not** in scope for plan-017.
7. **`locations.realmId` is a string default `''`, not a FK column.** Realms are conceptual; no separate `realms` table exists. If a future plan formalizes realms, add a table and migrate.

## Acceptance

- [x] Audit lists every canonical entity with status.
- [x] No missing tables; no DDL changes made.
- [x] `pnpm run check` and `pnpm run test` were green prior to this audit (no code changes).
