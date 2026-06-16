# Module: `outline`

> Last verified: 2026-06-16 (plan-053 outline review polish)
> Source: [src/modules/outline/](../../src/modules/outline/)

## Purpose

Hierarchy workspace for Arc -> Act -> Milestone -> Chapter -> Scene -> Beat -> Stage planning and traversal.

## v2 Surface Contract

- Scene rows and hierarchy cards use candle-tinted emphasis states.
- Type badges and structural metadata use brass foreground accents.
- Hover and active affordances follow warm-surface variants.

## Structure

```text
src/modules/outline/
├── components/
├── services/
├── stores/
├── types/
├── types.ts
└── index.ts
```

## Persistence

- `arcs`, `acts`, `milestones`, `chapters`, `scenes`, `beats`, and `stages` are stored through `/api/db/*`.
- Scene intent sidecars live in `project_metadata` with scene scope when produced by accepted outline generation.

## Outline Generation Contract

Plan-040 adds review-gated outline generation, but the canonical outline module still only owns normal hierarchy data once the author accepts.

Author workflow:

```text
Worldbuilding context -> Nova outline proposal -> explicit accept -> hierarchy rows
```

Important boundaries:

- Generation creates an `OutlineDraftCheckpointRecord` under `project_metadata` and does not write `arcs`, `acts`, `milestones`, `chapters`, `scenes`, `beats`, or `stages`.
- Rejection records audit metadata and leaves hierarchy untouched.
- Acceptance uses `/api/outline/checkpoints/{checkpointId}/accept`, not the generic metadata route.
- The accept service maps generated Arc -> Act -> Chapter -> Scene output into canonical `arcs`, `acts`, default `milestones`, `chapters`, and `scenes` inside a single transaction.
- Beats and stages are not generated in V1.
- Existing populated hierarchy blocks accept with `outline_conflict`; merge, overwrite, and regeneration-in-place are out of scope.

See [outline-generation.md](../03-ai/outline-generation.md) and [data-model.md](../02-architecture/data-model.md#outline-draft-materialization-map).

## Checkpoint Review Panel

Plan-053 keeps the plan-040 review gate but makes the outline route
review UI author-readable:

- The checkpoint queue uses `getPipelineTaskLabel()` and
  `checkpointLifecycleLabel()` so authors see labels such as "Outline
  draft" and "In review" instead of raw task/lifecycle keys.
- The default detail panel shows task, lifecycle, scope, generated and
  updated timestamps, readiness/warning copy, and action impact.
- Raw checkpoint ids, task keys, pipeline/stage/parser versions,
  hierarchy references, and payload JSON are hidden by default under
  `Advanced details` for developer inspection.
- Accept/reject controls remain explicit. Accept materializes through
  `/api/outline/checkpoints/{checkpointId}/accept`; reject records audit
  metadata and leaves hierarchy rows untouched.
- Milestone `chapterIds` are normalized when loading seven-layer outline
  data so SQLite-encoded arrays render consistently in the route and E2E
  coverage.

## Key Tests

- `tests/outline/*`
- `tests/e2e/outline-review-polish.spec.ts`
