---
date: 2026-05-31
part: part-001-prove-preaccept-proposals-remain-noncanonical
---

# Quality Gate Results

## pnpm test

- **205 files / 1489 tests PASS** (up from 203/1472 pre-phase)
- 17 new tests added across 2 new test files

## Test files created

### `tests/world-building/worldbuild-proposal-canon-safety.test.ts`
Unit regression suite for `acceptProposalAtomically`:

| Test | Assertion |
| --- | --- |
| characters table empty when pending_review | 0 rows in characters before any accept |
| all canon tables empty when proposal is pending | 0 rows in all 5 canon tables before any accept |
| writes character to canon for personae | 1 row in characters after accept; projectedToCanon: true |
| writes location for atlas | 1 row in locations after accept |
| writes lore entry for archive | 1 row in lore_entries after accept |
| writes plot thread for threads | 1 row in plot_threads after accept |
| writes timeline event for chronicles | 1 row in timeline_events after accept |
| rollback: no char write on missing name | 0 rows in characters; proposal stays pending_review |
| rollback: no write for unrecognized category | 0 rows in all tables; proposal stays pending_review |
| rollback: not_found returns error, no writes | 0 rows in all tables |
| double-accept: exactly 1 canon row | 1 row in characters after 2 accept calls; second returns invalid_transition |

### `tests/routes/worldbuilding-proposals.test.ts`
Route-level tests for `POST /api/worldbuilding/proposals/[proposalId]/accept`:

| Test | Assertion |
| --- | --- |
| 200 on success | proposal.acceptance.projectedToCanon === true |
| 422 on invalid_transition | status 422 |
| 422 on projection_failed | status 422 |
| 404 on not_found | status 404 |
| calls acceptProposalAtomically not setProjectMetadata | atomic path is used |
| legacy fallthrough | legacy checkpoint path called when new-style store returns undefined |

## Pre-accept write boundary verified

The regression suite explicitly asserts that `pending_review` proposals produce no writes
to `characters`, `locations`, `lore_entries`, `plot_threads`, or `timeline_events`. Canon
table writes only occur inside the `acceptProposalAtomically` transaction, which is the
only path that can set `projectedToCanon: true`.
