---
title: Composite Patterns Sweep
slug: part-001-composite-patterns-sweep
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-003-composite-patterns
started_at: 2026-04-24 22:15 EDT
completed_at: 2026-04-25 00:02 EDT
estimated_duration: 1.5d
---

## Objective

Promote or converge composite patterns: `SectionHeader`, metadata row, entity card, stat card, list row, inspector panel, workspace hero card.

## Scope

**In scope:**

- Decide per composite: promote to shared primitive, keep module-local with explicit reason, or retire.
- Migrate consumers of promoted composites.

**Out of scope:**

- Workspace hero card layout inside the workspace family shell (that's Stage 004).
- Inspector panel contract (that's Stage 004).

## Implementation Steps

1. Per composite, make the promote/local/retire decision; record it in `impl.log.md`.
2. For promoted composites, create (or confirm) shared primitives under `src/lib/components/ui`.
3. Migrate consumers.
4. Run gates.

## Files

**Create:**

- Any new shared composite primitives.

**Update:**

- `src/modules/bible/components/CharacterCorePanel.svelte`
- `src/modules/bible/components/NarrativeStatePanel.svelte`
- `src/modules/bible/components/ContinuityPanel.svelte`
- `src/modules/bible/components/VoicePanel.svelte`
- `src/modules/bible/components/StoryFunctionPanel.svelte`
- `src/modules/bible/components/RelationshipPanel.svelte`
- `src/modules/bible/components/FactionCoreIdentityPanel.svelte`
- `src/modules/bible/components/LineageRelationshipPanel.svelte`
- `src/modules/bible/components/FactionCulturePanel.svelte`
- `src/modules/bible/components/LineageCoreIdentityPanel.svelte`
- `src/modules/bible/components/FactionContinuityPanel.svelte`
- `src/modules/bible/components/LineageContinuityPanel.svelte`
- `src/modules/bible/components/FactionCurrentStatePanel.svelte`
- `src/modules/bible/components/LineageCurrentStatePanel.svelte`
- `src/modules/bible/components/FactionMembersPanel.svelte`
- `src/modules/bible/components/LineageMembersPanel.svelte`
- `src/modules/bible/components/FactionStoryFunctionPanel.svelte`
- `src/modules/bible/components/LineageStoryFunctionPanel.svelte`
- `src/modules/bible/components/FactionRelationshipPanel.svelte`
- `src/modules/bible/components/LineageInheritanceCulturePanel.svelte`
- `src/modules/bible/components/RealmForm.svelte`
- `src/modules/bible/components/LandmarkForm.svelte`
- `src/modules/project/components/ProjectCreateCard.svelte`
- Additional files are appended as each batch is executed.

## Acceptance Criteria

- [x] Every composite has an explicit decision.
- [x] Promoted composites are used by every consumer.
- [x] Gates pass.

## Edge Cases

- A composite that appears only in one route stays local and is documented as intentional.

## Notes

- None.
