# Drafting, Planning & Worldbuilding Journeys (2026-06-15)

## Journey Alignment

| Surface | Current role | Coherence result |
| --- | --- | --- |
| Project hub | Command center with hero, progress, next step, health, backup, export, save, and AI readiness cards | Hub actions point into drafting, export, backup, and AI setup without bypassing review-gated AI flows. |
| Editor | Canonical drafting surface with scene/chapter state, autosave, draft checkpoints, and Nova panel handoff | Draft generation remains scene-scoped and review-gated; accepted drafts dispatch scene update events after server acceptance. |
| Outline | Story hierarchy, stage readiness, worldbuild pipeline runs, and outline checkpoint review | Worldbuild-to-outline changes stay pending until explicit author acceptance. |
| Worldbuilding | Domain launcher, entity workspaces, readiness badges, help drawer, generation status, proposals, and diff/merge review | Domain generation opens Nova/review surfaces without silently projecting proposals to canon. |
| Export | Project-layout modal triggered from the hub or route query | Export remains a trusted app flow with explicit selection and delivery state rather than AI mutation. |

## Empty And Incomplete States

- Project hub uses status cards and next-step actions instead of explanatory landing copy.
- Worldbuilding empty states provide direct add/generate actions where the owning workspace supports them.
- Worldbuilding generation status exposes queued, running, pending review, missing context, failed, accepted, and rejected states.
- Nova panel exposes AI-key readiness and context disclosure before authors send a request.
- Export readiness shows word and scene counts before opening the export dialog.

## Handoff Rules

1. Worldbuilding generation can create proposals, but only accepted proposals update canon.
2. Accepted worldbuilding checkpoints can inform outline generation, but outline materialization requires an accepted outline checkpoint.
3. Accepted outline scenes can feed drafting, but generated prose remains an author draft checkpoint until accepted.
4. Editor autosave and draft application remain scene-scoped and evented through `dispatchSceneContentApplied`.
5. Export reads the project state after author decisions; it does not apply AI suggestions.

## Validation

Command:

```text
pnpm exec vitest run tests/lib/review-gate-labels.test.ts tests/nova/checkpoint-card.contract.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/world-building/worldbuilding-proposal-diff-view.test.ts tests/world-building/worldbuild-review-ui.test.ts
```

Result:

```text
Test Files  5 passed (5)
Tests       33 passed (33)
```

This validation covers review-card source contracts, outline checkpoint UI states, worldbuilding diff rendering, proposal review state selectors, and the shared review-gate label helper.
