---
title: Story Frame and Act Entity Implementation
slug: part-001-story-frame-and-act-entity-implementation
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-story-frame-and-act-domain-foundation
started_at: ~
completed_at: ~
estimated_duration: 4d
---

## Objective

Add Story Frame and Act primitives to the data model and planning UI so the app is no longer constrained by chapter-first structure.

## Scope

**In scope:**

- Story Frame and Act types, persistence schema, and default migration values
- Story Frame and Act planning panels/components
- Chapter-to-act assignment in hierarchy load and rendering

**Out of scope:**

- Arc-specific modeling beyond optional placeholder fields
- Beat overlay behavior

## Implementation Steps

1. Extend schema and typed entities for Story Frame and Act structures.
2. Implement repository/service operations for Story Frame and Act CRUD.
3. Add planning panels for Story Frame summary and Act-level planning notes.
4. Update outline load contract to include Act grouped hierarchy.
5. Verify chapter reassignment and ordering integrity.

## Files

**Create:**

- src/modules/outliner/services/story-structure-service.ts
- src/modules/outliner/components/StoryFramePanel.svelte
- src/modules/outliner/components/ActPlanningPanel.svelte

**Update:**

- src/lib/db/schema.ts
- src/lib/db/types.ts
- src/modules/outliner/types.ts
- src/routes/projects/[id]/outline/+page.ts

## Acceptance Criteria

- [ ] Story Frame data can be created and edited per project
- [ ] Acts can be added, ordered, and linked to chapters
- [ ] Existing projects can load without hard failures after schema extension

## Edge Cases

- Projects without act assignments should render in a safe fallback group.
- Empty Story Frame fields should not block save or navigation.

## Notes

Guard all new fields with defaults to keep migration and loading tolerant.
