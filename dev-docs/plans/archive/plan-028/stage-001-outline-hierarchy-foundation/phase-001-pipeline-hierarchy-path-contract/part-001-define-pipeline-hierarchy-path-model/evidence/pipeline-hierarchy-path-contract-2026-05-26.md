# Pipeline Hierarchy Path Contract (2026-05-26)

## Canonical Path Shape

`PipelineHierarchyPath` (7 layers):

```ts
{
  arcId: string | null | undefined;
  actId: string | null | undefined;
  milestoneId: string | null | undefined;
  chapterId: string | null | undefined;
  sceneId: string | null | undefined;
  beatId: string | null | undefined;
  stageId: string | null | undefined;
}
```

Order is strict: `arc -> act -> milestone -> chapter -> scene -> beat -> stage`.

## Behavior Guarantees

- Parent change clears all descendants deterministically.
- Selecting descendants auto-populates missing ancestors as `null` (unassigned) instead of leaving `undefined` gaps.
- Readiness states:
  - `empty`: no selected layers
  - `partial`: some selection but not full 7-layer concrete ids
  - `ready`: all 7 ids present and non-empty

## Repair + Diagnostics

`repairPipelineHierarchyPath(...)` validates current selection against live hierarchy payloads and repairs stale/mismatched chains.

Diagnostic codes emitted:

- `stale_node`
- `missing_parent`
- `relationship_mismatch`
- `unsupported_legacy_branch`

Legacy beats without `sceneId` are cleared from strict stage selection (`beat/stage` reset) with `unsupported_legacy_branch`.

## Evidence of Verification

- Unit tests:
  - `tests/outline/pipeline-hierarchy-path-store.test.ts`
  - `tests/repositories/hierarchy-store.test.ts`
- Full gate output:
  - `evidence/test-output-2026-05-26.txt`
