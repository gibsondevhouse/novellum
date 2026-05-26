---
title: Create Structure Card
slug: part-002-create-structure-card
part_number: 2
status: draft
owner: frontend
assigned_to: frontend
phase: phase-002-collection-zone
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Build the `CreateStructureCard` component — a visually-subordinate, smaller-than-real-cards placeholder that serves as the creation affordance for new items in the active mode, appearing as the sole card when no items exist or as a trailing insertion utility when items do exist.

## Scope

**In scope:**

- `CreateStructureCard` component
- Two visual states: primary empty-state and trailing utility
- Mode-aware label (e.g., "New Arc", "New Act", "New Chapter", "New Scene")
- Click handler that triggers item creation

**Out of scope:**

- Inline creation form (keep it simple: click → create with default title)
- Drag-and-drop positioning of the create card

## Implementation Steps

1. Create `src/modules/workspace/components/CreateStructureCard.svelte`
2. Props:
   - `mode: WorkspaceMode` — determines the label text
   - `isEmpty: boolean` — true when no items exist for this mode
   - `onCreate: () => void`
3. Display:
   - Card surface: `var(--color-surface-overlay)` with dashed border (`border-style: dashed`)
   - Smaller than `StructureCrudCard`: reduced padding, shorter height (~60px)
   - Centered `+` icon and mode-specific label:
     - Arcs: "+ New Arc"
     - Acts: "+ New Act"
     - Chapters: "+ New Chapter"
     - Scenes: "+ New Scene"
   - Muted color treatment: `var(--color-text-muted)`, `opacity: 0.6` at rest
   - Hover: border becomes solid, opacity increases, subtle background brightening
   - Focus-visible: standard `var(--focus-ring)` treatment
4. When `isEmpty` is true:
   - Card sits in the collection area as the only item
   - Slightly larger / more prominent than the trailing utility version but still smaller than real cards
5. When `isEmpty` is false:
   - Card appears at the end of the grid after all real cards
   - Clearly visually subordinate: lighter, smaller, dashed border
6. Click → calls `onCreate()`
7. Export from workspace module barrel

## Files

**Create:**

- `src/modules/workspace/components/CreateStructureCard.svelte`

**Update:**

- `src/modules/workspace/index.ts` — export new component

## Acceptance Criteria

- [ ] `CreateStructureCard` renders a smaller card with dashed border
- [ ] Card displays `+` icon and mode-specific "New [Entity]" label
- [ ] Click calls `onCreate`
- [ ] Card is visually smaller than `StructureCrudCard`
- [ ] When `isEmpty` is true, card is the sole occupant of the collection area
- [ ] When `isEmpty` is false, card appears at end of grid as trailing utility
- [ ] Hover state: border solidifies, opacity increases
- [ ] Focus-visible state uses standard focus ring
- [ ] Card does not visually compete with real content cards
- [ ] Lint and typecheck pass

## Edge Cases

- Rapid double-clicks should not create duplicate items (debounce or disable after first click until creation completes)
- Card should not grow to match `StructureCrudCard` height in grid — use explicit `max-height` or `align-self: start`

## Notes

> The create card is intentionally understated. It should feel like an invitation, not a demand. Think of it as the "add another" affordance in a well-designed form — present but not pushy.
>
> When the user clicks the create card, the parent should:
>
> 1. Call the appropriate repository's create function with a default title (e.g., "Untitled Arc")
> 2. Add the new item to the local data array
> 3. Select the new item (update hero to show it)
> 4. Optionally enter rename mode on the new card immediately
