---
title: Domain Types Extraction
slug: part-002-domain-types-extraction
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-001-canonical-schema-and-domain-types
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 1d
---

## Objective

Make `src/lib/db/domain-types.ts` the canonical, Dexie-free entity type module so server, client, and test code can import shared interfaces without pulling in `dexie` as a transitive dependency.

## Scope

**In scope:**

- Create `src/lib/db/domain-types.ts` with one exported interface per project-owned entity (mirror of stage-002 entity list).
- Reduce `src/lib/db/types.ts` to a thin compatibility shim that re-exports from `domain-types.ts` and is annotated with `@deprecated use $lib/db/domain-types`.
- Replace the leading comment in `src/lib/db/types.ts` ("Dexie schema version 2") with a neutral domain-types description.
- Pick **one** server route (suggested: `src/routes/api/db/scenes/+server.ts`) and **one** client component (suggested: `src/modules/outliner/components/SceneClarityPanel.svelte`) and switch their imports to `$lib/db/domain-types` as a smoke test.

**Out of scope:**

- Bulk import rewrites across all `$lib/db/types.js` consumers — phase-003 import sweep handles that.
- Removing or moving `$lib/db/index.ts` (Dexie `AppDB`) — phase-003.

## Implementation Steps

1. Read `src/lib/db/types.ts` end-to-end and identify each entity interface.
2. Create `src/lib/db/domain-types.ts` and copy each interface verbatim, removing any Dexie-specific helpers (`Table<…>`).
3. Replace `src/lib/db/types.ts` content with `export * from './domain-types';` plus the deprecation comment.
4. Update the chosen smoke-test server route and component to import from `$lib/db/domain-types`.
5. Run `pnpm run check`, `pnpm run lint`, `pnpm run test`.

## Files

**Create:**

- `src/lib/db/domain-types.ts`

**Update:**

- `src/lib/db/types.ts`
- `src/routes/api/db/scenes/+server.ts` (smoke import)
- `src/modules/outliner/components/SceneClarityPanel.svelte` (smoke import)

## Acceptance Criteria

- [ ] `src/lib/db/domain-types.ts` exports every interface that `types.ts` previously defined.
- [ ] Importing from `$lib/db/domain-types` does not cause `dexie` to appear in the import graph (verify with `pnpm exec madge` or equivalent if available; otherwise manual grep).
- [ ] One server route and one component compile clean against the new module.
- [ ] `pnpm run check` and `pnpm run test` pass.

## Edge Cases

- Interfaces that reference Dexie types (e.g. `Table`) must be rewritten as plain TS types.
- Types whose JSON-serialized form differs between Dexie and SQLite (e.g. `Date` vs `number`) should be normalized to the SQLite shape (epoch milliseconds as `number`); flag any divergence in `SCHEMA-AUDIT.md`.

## Notes

- The deprecation shim must remain until phase-003 has rewritten all consumer imports.
