# Worldbuild Pipeline Runner — Source Contract Evidence

## Created Files

- `src/modules/outline/services/worldbuild-pipeline-runner.ts` — centralized adapter
- `tests/outline/worldbuild-pipeline-runner.test.ts` — 11 source-contract tests

## Updated Files

- `src/lib/ai/types.ts` — added `PipelineRunState` type
- `src/routes/projects/[id]/outline/+page.svelte` — wired adapter to stage action handler + run status display
- `src/modules/world-building/stores/world-building-store.svelte.ts` — checkpoint refresh called post-run (existing API, no code change needed)

## Acceptance Criteria

1. **Adapter input** includes stage key (`WorldbuildTaskKey`), active hierarchy path (`PipelineHierarchyPath`), and optional instruction/options — verified via `WorldbuildRunInput` interface.
2. **Adapter output** includes draft artifact envelope (`PipelineArtifactEnvelope<WorldbuildPayload>`) + checkpoint (`WorldbuildCheckpointRecord`) — verified via discriminated `WorldbuildRunResult`.
3. **Error normalization** — 6 deterministic error reasons (`invalid_task`, `invalid_path`, `parse_failed`, `transport_failed`, `checkpoint_staging_failed`, `duplicate_run`) map to UI-safe states.
4. **No component builds raw orchestration payloads** — the outline page calls `runWorldbuildPipelineTask()` with typed input; payload construction is internal to the adapter.

## Edge Cases

- Missing `stageId` or `arcId` → blocked with explicit `invalid_path` reason.
- Duplicate submit during `running` state → blocked with `duplicate_run` reason.
- `activeRunKey` cleared in `finally` block to prevent stale lock on error.
- No server-only imports — adapter is client-safe (no `better-sqlite3`, no `$lib/server/`).
