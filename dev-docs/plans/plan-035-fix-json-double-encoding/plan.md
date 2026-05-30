---
title: Fix GeneratedEntityModal Double-Encoding + JSON Hardening
slug: plan-035-fix-json-double-encoding
version: 1.0.0
status: in-progress
owner: Planner Agent
created: 2026-05-30
last_updated: 2026-05-30
target_completion: 2026-05-31
stages:
  - stage-001-fix-json-encoding
  - stage-002-pre-merge-polish
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
---

## Objective

Fix a critical double-encoding bug in `GeneratedEntityModal.saveDraft` that pre-encodes array fields with `JSON.stringify()` before posting to the API. The POST handler (`createPostHandler`) also encodes these fields, producing double-encoded strings in SQLite (e.g., `'"[]"'` instead of `'[]'`). When decoded on GET, these come back as strings instead of arrays, causing `TypeError` crashes and a frozen UI on the Realms page.

**Impact**: Blocks navigation to the Realms page in world-building; affects 5 entity types (character, location, lore entry, plot thread, timeline event) with 13 instances of pre-encoding.

## Scope

**In scope:**

- Remove 13 pre-encoding `JSON.stringify()` calls from `GeneratedEntityModal.saveDraft`
- Add type guards to 4 crash-prone array consumer functions (`joinCommaSeparated`, `aliases.join`, `tags.join`, `traits.join`)
- Harden `createPostHandler` to tolerate pre-stringified values
- Create one-time DB repair script for existing corrupt rows
- Add regression tests for JSON encoding/decoding round-trips

**Out of scope:**

- Refactoring `GeneratedEntityModal` component structure
- Changing the repository factory or API layer architecture
- Modifying other entity types beyond the 5 affected

## Stages

| #   | Stage                                                           | Status        | Est. Duration |
| --- | --------------------------------------------------------------- | ------------- | ------------- |
| 001 | [Fix JSON Double-Encoding](stage-001-fix-json-encoding/stage.md) | `in-progress` | 2d            |
| 002 | [Pre-Merge Polish](stage-002-pre-merge-polish/stage.md)           | `draft`       | 0.5d          |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors in modified and new files
- [ ] **typecheck** — zero type errors
- [ ] **tests** — all tests pass (existing + new regression tests)
- [ ] **manual_verify** — Realms page navigates without freeze, no crashes in dossier views

## Risks & Mitigations

| Risk                                     | Likelihood | Mitigation                                                                                     |
| ---------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| DB repair script corrupts existing data  | low        | Script runs in read-first mode, logs all changes, can be manually reviewed before committing   |
| Incomplete guard coverage                | medium     | Subagent audit found all crash sites; tests validate guards work on string/array inputs       |
| Pre-stringified values still in DB       | low        | Phase 4 repair script handles existing corrupted rows; Phase 3 hardening prevents future cases |
| Merge conflicts with active refactors    | low        | Small, focused changes; only touches 8 files; no schema migrations                            |

## Notes

- The branch `fix/json-double-encoding` has been created from `master`
- Phases 1 & 2 (source fixes) can be implemented in parallel
- Phase 4 (DB repair) should run before deployment to clean corrupted data
- No schema migrations required — all changes are application-level
- `faction` entity confirmed unaffected — no JSON array fields

## Execution Plan by Phase

1. **Phase 1 & 2 (Parallel):** Remove pre-encoding + add type guards across 8 files
2. **Phase 3:** Harden server POST handler against pre-stringified values
3. **Phase 4:** Create DB repair script and validate it detects/repairs corrupt rows
4. **Phase 5:** Add regression tests for JSON encoding/decoding patterns
5. **Verification:** Run all checks (`lint`, `typecheck`, `test`), manual UI verification
