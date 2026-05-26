---
title: Restore as Copy
slug: part-002-restore-as-copy
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-004-restore-execution-transactional
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Add the `'copy'` restore mode: mint a fresh `project.id` and rewrite **every** foreign key in the parsed rows so the imported project sits alongside any existing project.

## Scope

**In scope:**

- Extend `restoreProject(db, parsed, mode: 'copy')` and add an internal `rewriteIdsForCopy(parsed): ParsedBackup`.

**Out of scope:**

- Asset-file copying (assets in V1 archives are referenced by URL or embedded — handle in stage-005 if needed).

## Implementation Steps

1. Build an id-mapping table by walking every primary key column declared in the registry. Generate a fresh UUID per old PK.
2. Walk every row again and rewrite any column whose name ends in `Id` or matches a registry-declared FK column to the mapped value.
3. Verify zero collisions by checking that no rewritten PK already exists in the live DB.
4. Hand the rewritten parsed backup to the existing `'overwrite'` writer path with the new `projectId`.
5. Extend `tests/backup/project-restore.test.ts` — copy branch:
   - Seed project A. Backup it. Restore-as-copy. Assert: project A still present unchanged; new project B exists with all rows; no FK in B references any id from A.

## Files

**Update:**

- `src/lib/server/restore/restore-project.ts`
- `tests/backup/project-restore.test.ts`

## Acceptance Criteria

- [ ] No row in the copied project references any id from the source project.
- [ ] Original project untouched.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Tables that store ids inside JSON blobs (e.g. `arcRefs TEXT NOT NULL DEFAULT '[]'` on `chapters`): the rewriter must parse, remap, and re-serialize. The registry entry should declare these JSON-id fields so the rewriter knows where to look.
- Self-referential rows (e.g. character_relationships referencing two characters) — both ids must be remapped via the same map.

## Notes

- This is the highest-risk subroutine in the stage. Add property-style tests if useful: random seed → backup → copy → assert id-graph isomorphism.
