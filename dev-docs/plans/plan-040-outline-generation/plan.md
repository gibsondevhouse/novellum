---
title: Outline Generation — Worldbuilding to Outline
slug: plan-040-outline-generation
version: 0.1.0
status: draft
owner: Planner Agent
created: 2026-06-01
last_updated: 2026-06-01
target_completion: ~
stages: []
dependencies:
  - plan-037-agentic-worldbuild-scan
  - plan-038-novel-engine-v1
quality_gates:
  - lint
  - typecheck
  - tests
  - check:tokens
---

## Objective

Close the gap between worldbuilding and drafting by adding AI-assisted outline generation.
Authors with established worldbuilding (characters, factions, lore, plot threads) should
be able to generate a structured outline (Arc → Act → Chapter → Scene) as a reviewable,
checkpointed artifact — completing the full authoring loop:

`Worldbuild → Outline → Draft → Review → Manuscript`

## Scope

**In scope (draft — refine before stage authoring):**

- Outline generation service that builds an `OutlineDraft` artifact from worldbuilding context.
- Checkpointed review model — generate stores a checkpoint; user explicitly accepts or rejects.
- Accept path materializes the outline into the existing hierarchy tables (arcs, acts,
  chapters, scenes) atomically with a rollback on failure.
- Per-scene intent fields (goal/conflict/turn/outcome) that feed downstream into
  plan-038's draft pipeline.
- Nova surface for triggering outline generation and reviewing the resulting outline.
- Tests for the generation contract, checkpoint persistence, accept materialization, and
  the review UI.

**Out of scope:**

- Re-generating an existing outline in place (treat as new outline + manual merge for v1).
- Cross-project outline templates.
- Outline diffing / structural merge tooling.

## Open Questions

- Should outline generation be one-shot or staged (Arcs first → Acts → Chapters → Scenes)?
  Staged generation is more robust but slower; one-shot is simpler but more brittle.
- What worldbuilding context is required as a prerequisite? (At minimum: characters and
  primary plot threads. Factions/locations enrich but shouldn't block.)
- Where should the outline review UI live — Nova, or a dedicated `/outline` workspace?
- How does this interact with manually-edited outlines? Conflict policy: refuse to
  generate over an existing populated outline unless user confirms.

## Stages

To be defined. Likely shape:

| #   | Stage                                 | Status   |
| --- | ------------------------------------- | -------- |
| 001 | Outline contract + checkpoint storage | `draft`  |
| 002 | Generation service + prompt           | `draft`  |
| 003 | Review surface in Nova                | `draft`  |
| 004 | Accept materialization (atomic write) | `draft`  |
| 005 | Quality gates + tests                 | `draft`  |

## Notes

This is a **skeleton draft**. Expand stages, phases, and parts before starting work,
following [`.github/instructions/plan-conventions.instructions.md`](../../../.github/instructions/plan-conventions.instructions.md).

Pattern this plan after plan-037 (worldbuild scan) and plan-038 (author draft pipeline) —
both established the checkpointed-review-then-accept idiom that this plan extends to
outlines.
