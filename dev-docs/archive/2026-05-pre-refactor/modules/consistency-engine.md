# Consistency Engine

> Last updated: 2026-04-20

## Purpose

Detect story issues (continuity conflicts, timeline errors, lore violations, unresolved threads) and surface them for author review.

## Modules

Novellum splits the engine and its UI into two modules with strict boundaries:

- `src/modules/consistency/` — pure analysis engine. Runs passes, builds issue records, persists to `consistency_issues`. No Svelte UI.
- `src/modules/continuity/` — UI surface. Reads issues, renders tables/detail views, lets the author dismiss or resolve.

The route `src/routes/projects/[id]/consistency` exposes engine output; `src/routes/projects/[id]/continuity` is the UI pass-through.

## Checks

- Name/trait conflicts.
- Timeline errors.
- Lore rule violations.
- Unresolved plot threads.
- Repetition / redundancy.
- Plot holes (`ContinuityAgent`-assisted).

## Output

- `ConsistencyIssue` rows (schema v4): `type`, `severity`, `status`, `sceneId`, `spanStart/End`, `description`.
- Optionally annotated by `ContinuityAgent` (see [`../agents-map.md`](../agents-map.md)).

## AI Integration

The `ContinuityAgent` consumes the `continuity_scope` context policy: current scene text + relevant characters + lore + timeline events + plot threads. It produces a structured issue list that the engine merges with rule-based findings before persistence.
