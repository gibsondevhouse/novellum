---
title: Retire Dexie Portability
slug: part-002-retire-dexie-portability
part_number: 2
status: complete
owner: architect
assigned_to: architect
phase: phase-005-export-modal-ia-split
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Remove the Dexie-backed snapshot/restore code paths from production routes and lock in a guardrail so they can never be reintroduced.

## Scope

**In scope:**

- `src/modules/export/services/portability/snapshot-service.ts`, `restore-service.ts`, `zip-export.ts`, `zip-import-parse.ts` — delete or reduce to thin no-op shims that throw `LegacyPortabilityRemovedError` if invoked at runtime.
- `kv-registry.ts`, `manifest-policy.ts`, `types.ts` — keep only what is still referenced by non-Dexie code; otherwise delete.
- `tests/lib/legacy-dexie-boundaries.test.ts` — extend to assert that no `src/routes/**` or `src/lib/server/**` file imports any of the legacy portability modules.

**Out of scope:**

- Removing Dexie from the codebase entirely (Dexie is still in scope for the editor's local cache; we are only retiring the portability path).

## Implementation Steps

1. Audit every importer of the legacy portability modules. For each: cut over to the new SQLite-backed client (phase-005 part-001) or delete the call site if it was dead.
2. Reduce the legacy files to a single throwing stub or remove them entirely if zero importers remain.
3. Extend the legacy-Dexie boundaries test with explicit module-path assertions.
4. Update `dev-docs/portability-recovery-runbook.md` with the new flow.

## Files

**Update:**

- `src/modules/export/services/portability/*`
- `tests/lib/legacy-dexie-boundaries.test.ts`
- `dev-docs/portability-recovery-runbook.md`

## Acceptance Criteria

- [ ] No production code path reaches the legacy portability modules.
- [ ] Boundaries guardrail test passes and would fail if a future PR added such an import.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Coordinate with the architect agent before deleting files: any Svelte components or stores still bound to the old services must be migrated first.
