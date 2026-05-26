---
title: Wire Seven-Layer Outline Context
slug: part-001-wire-seven-layer-outline-context
part_number: 1
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-author-hierarchy-integration
started_at: ~
completed_at: ~
estimated_duration: 3d
---

## Objective

Ensure context retrieval, outline services, and author-stage validation all operate on the canonical seven-layer narrative hierarchy.

## Scope

**In scope:**

- Context builder retrieval across arcs/acts/milestones/chapters/scenes/beats/stages.
- Service updates where hierarchy traversal is currently shallow.
- Tests that enforce layer presence, ordering, and stage-status handling.

**Out of scope:**

- New visual redesign for outline surfaces.
- Non-hierarchy world-building schema changes.

## Implementation Steps

1. Audit hierarchy traversal paths and update service contracts.
2. Extend context assembly with milestone + stage references and status-aware filtering.
3. Add tests that fail on 5-layer fallback assumptions.

## Files

**Create:**

- `tests/outline/outline-hierarchy-seven-layer.test.ts`
- `tests/ai/pipeline/context-hierarchy-mapping.test.ts`

**Update:**

- `src/modules/outline/services/outline-data-service.ts`
- `src/modules/outline/services/story-structure-service.ts`
- `src/modules/editor/services/beat-repository.ts`
- `src/modules/editor/services/stage-repository.ts`
- `src/lib/ai/context-builder.ts`
- `src/lib/ai/context-engine.ts`
- `src/lib/db/domain-types.ts`
- `dev-docs/02-architecture/data-model.md`

## Acceptance Criteria

- [ ] Context assembly includes milestone and stage nodes for author-stage tasks.
- [ ] Stage lifecycle (`planned`, `in_progress`, `completed`) is consumed in retrieval/filtering rules.
- [ ] Outline services expose deterministic seven-layer traversal helpers.
- [ ] Tests fail if milestones or stages are omitted from hierarchy mapping.

## Edge Cases

- Scenes with beats but no stages must still be handled without null crashes.
- Milestones with out-of-order `chapterIds` must normalize deterministically.

## Notes

Keep cross-module imports compliant with public barrel boundaries.
