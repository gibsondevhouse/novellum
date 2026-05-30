---
title: Scope and Extend Entities
slug: part-001-scope-and-extend-entities
part_number: 1
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-003-schema-extension-scope
started_at: 2026-05-26T12:10:00Z
completed_at: 2026-05-26T18:00:00Z
estimated_duration: 3d
---

## Objective

Resolve schema treatment for factions/themes/glossary and implement migration/API scaffolds for whichever entities are approved in-scope for V1.1.

## Scope

**In scope:**

- Decision record for entity scope and fallback behavior.
- Migration + type + endpoint scaffolds for approved entities.
- Backup registry and data-model doc updates.

**Out of scope:**

- Full UI completion for every new entity surface.
- Cross-project template sharing model.

## Implementation Steps

1. Produce an ADR with accept/defer decisions for factions, themes, glossary, and research provenance.
2. If accepted, add migration 0004 and wire schema/domain/API support for first-class entities.
3. Update docs and migration tests to ensure deterministic boot on existing databases.

## Files

**Create:**

- `dev-docs/02-architecture/adr/adr-0027-pipeline-entity-scope.md`
- `src/lib/server/db/migrations/0004_pipeline_entities.ts`
- `src/routes/api/db/factions/+server.ts`
- `src/routes/api/db/factions/[id]/+server.ts`
- `src/routes/api/db/themes/+server.ts`
- `src/routes/api/db/themes/[id]/+server.ts`
- `src/routes/api/db/glossary_terms/+server.ts`
- `src/routes/api/db/glossary_terms/[id]/+server.ts`
- `tests/db/migration-0004-pipeline-entities.test.ts`

**Update:**

- `src/lib/server/db/schema.ts`
- `src/lib/server/db/migration-registry.ts`
- `src/lib/db/domain-types.ts`
- `src/lib/server/backup/table-registry.ts`
- `dev-docs/02-architecture/data-model.md`

## Acceptance Criteria

- [ ] ADR explicitly marks entities as `in-scope` or `deferred` with rationale.
- [ ] Approved entities have migration-backed persistence and CRUD route scaffolds.
- [ ] Migration tests cover clean boot and upgrade from pre-0004 databases.
- [ ] If any entity is deferred, fallback mapping to existing tables/metadata is documented.

## Edge Cases

- Existing projects with faction data in metadata/JSON fields must not lose data during migration.
- Migration must remain idempotent if partially applied in interrupted desktop startup.

## Notes

Do not force entity creation purely for completeness; only ship first-class tables for approved, value-bearing scope.
