---
title: Wire Project Entity Querying
slug: part-001-wire-project-entity-querying
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-003-project-entity-attachments
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

# Part 001 — Wire Project Entity Querying

## Objective

Populate the Project tab with searchable scenes, characters, locations, and outline nodes from existing project data sources.

## Scope

**In scope:**

- Populate the Project tab with searchable scenes, characters, locations, and outline nodes from existing project data sources.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Inventory existing repository/API access for scenes, characters, locations, and outline nodes.
2. Use existing `/api/db/*` resource paths; do not add client SQLite access.
3. Normalize returned entities into attachment candidates.
4. Add search/filter behavior scoped to loaded candidates.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/context-hooks.ts`
- `src/modules/nova/components/NovaAttachmentPopover.svelte`
- `src/routes/api/db/*`

## Acceptance Criteria

- [ ] Project tab lists available entities for an active project.
- [ ] Selection creates typed entity attachments with enough payload for context construction.
- [ ] No direct sibling-module internal imports are introduced.

## Edge Cases

- Projects with zero scenes but populated Project Hub metadata should still allow future entity types when available.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
