# Worldbuild Checkpoint Flow Sequence (2026-05-26)

## Lifecycle Contract

`draft -> review -> accepted`

Alternative terminal path:

`draft|review -> rejected`

Rejected checkpoints preserve rationale and remain in pipeline metadata for auditability.

## Storage Contract

- Metadata scope: `pipeline`
- Owner id: `vibe-worldbuild`
- Key: artifact/checkpoint id
- Value: `WorldbuildCheckpointRecord` (`version`, lifecycle state, artifact envelope, review/accept/reject state)

## Accept Projection Boundary

- Projection mode: `atomic` (single SQLite transaction)
- Canon mutation occurs only during explicit `accept` operation
- No mutation on `upsert`, `review`, or `reject`

## Populated World Bible Projection Targets

On `accept`, `tableWrites` are projected to:

- `characters`
- `locations`
- `factions`
- `themes`
- `glossary_terms`
- `lore_entries`
- `plot_threads`
- `timeline_events`

## Concurrency / Idempotency Rule

- If a checkpoint is already `accepted`, repeat `accept` calls return existing accepted state and do not re-project rows.

## Version Guard

- Unsupported checkpoint `version` rejects lifecycle transition with non-destructive failure.
- Canon tables remain unchanged when version validation fails.
