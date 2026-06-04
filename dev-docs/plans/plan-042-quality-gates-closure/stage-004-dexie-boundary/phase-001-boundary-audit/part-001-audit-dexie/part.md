---
title: Audit Dexie Boundary
slug: part-001-audit-dexie
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-boundary-audit
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Audit all Dexie usage in the codebase to verify it's properly scoped within the intentional
portability/migration boundary and not leaking into live application code.

## Scope

**In scope:**

- Search for all `import.*dexie` statements
- Verify each import is within the portability boundary (e.g., migration, backup/restore)
- Document any out-of-scope usage
- Move or remove any Dexie usage that should use SQLite instead

**Out of scope:**

- Removing Dexie from intentional portability code
- Changing the data model itself

## Implementation Steps

1. Search the codebase for `import.*dexie` (use grep or semantic search)
2. For each import, determine:
   - Whether it's in a portability/migration/backup file
   - Whether it's appropriate for that location
   - If out-of-scope, identify the proper fix
3. Create a mapping document showing all Dexie imports and their classification
4. Make any necessary moves or changes to relocate out-of-scope usage
5. Verify no unintended Dexie imports remain outside the boundary

## Files

**Update:**

- Any files with out-of-scope Dexie imports (move code or switch to SQLite)

**Create:**

- Dexie boundary audit document in `evidence/`

## Acceptance Criteria

- [ ] All Dexie imports identified and mapped
- [ ] All out-of-scope imports relocated or removed
- [ ] Boundary enforcement documented
- [ ] Audit mapping saved to `evidence/`
- [ ] No unintended Dexie usage in live app code

## Edge Cases

- Type-only imports (`import type { ... } from 'dexie'`) are acceptable where needed
- Re-exports of Dexie types should be within the portability boundary

## Notes

The portability boundary was established to:

1. Retain Dexie in migration code for legacy import flows
2. Use SQLite exclusively for all live application data access

This audit ensures that boundary is maintained and respected.
