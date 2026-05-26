---
title: Bible Constants & Types
slug: part-001-bible-constants-types
part_number: 1
status: review
owner: Architect
assigned_to: Architect
phase: phase-002-bible-extraction
started_at: 2025-07-17
completed_at: 2025-07-17
estimated_duration: 0.5d
---

## Objective

> Create `src/modules/bible/constants.ts` and enhance `src/modules/bible/types.ts` to consolidate all inline constant arrays (character role options, relationship type options, lore category options, thread status options, location type options, etc.) and shared interfaces used across bible components and forms.

## Implementation Steps

1. Audit bible components for inline constant arrays: `grep -rn "const.*=.*\[" src/modules/bible/`
2. Create `src/modules/bible/constants.ts` with all extracted arrays
3. Update `src/modules/bible/types.ts` with shared form-related types
4. Update each bible component to import from `../constants` and `../types`
5. Update barrel export in `src/modules/bible/index.ts`

## Files

**Create:**

- `src/modules/bible/constants.ts`

**Update:**

- `src/modules/bible/types.ts`
- `src/modules/bible/index.ts`
- Bible form components using inline constant arrays (CharacterForm, LocationForm, LoreForm, PlotThreadForm, TimelineEventForm, RelationshipForm, etc.)

## Acceptance Criteria

- [ ] Zero inline constant arrays in bible components
- [ ] All constants importable from `@modules/bible/constants`
- [ ] `pnpm check` — 0 errors
- [ ] `pnpm run lint` — 0 boundary violations
