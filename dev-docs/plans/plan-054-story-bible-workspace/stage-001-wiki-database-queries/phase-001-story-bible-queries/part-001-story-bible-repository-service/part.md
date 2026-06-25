---
title: Story Bible Repository Service Class
slug: part-001-story-bible-repository-service
part_number: 1
status: in-progress
owner: Planner Agent
assigned_to: —
phase: phase-001-story-bible-queries
started_at: ~
completed_at: ~
estimated_duration: undefined
---

## Objective

Construct a unified read service mapping all worldbuilding tables in SQLite to Svelte-ready stores.

## Scope

**In scope:**

- Create a single StoryBibleRepository class returning characters, locations, factions, glossary, themes, lore, and timeline tables.
- Format lists with pagination and filters.

**Out of scope:**

- Write or save operations (handled in Stage 002).

## Implementation Steps

1. Create src/modules/story-bible/services/story-bible-repository.ts.
2. Inject Database reference and create helper queries.
3. Verify with a unit test suite.

## Files

**Create:**

- `src/modules/story-bible/services/story-bible-repository.ts`
- `tests/story-bible/story-bible-repository.test.ts`

**Update:**

- `src/modules/story-bible/index.ts`

## Acceptance Criteria

- [ ] StoryBibleRepository exposes getCharacters, getLocations, getFactions, getLoreEntries, getGlossaryTerms, getTimelineEvents, and getThemes.
- [ ] Unit tests verify return values.

## Edge Cases

- Database returns zero rows: should resolve to empty arrays instead of throwing exceptions.

## Notes

> Part-level context for Story Bible Repository Service Class.
