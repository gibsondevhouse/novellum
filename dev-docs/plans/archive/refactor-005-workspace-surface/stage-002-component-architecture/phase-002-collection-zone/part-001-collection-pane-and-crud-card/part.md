---
title: Collection Pane & CRUD Card
slug: part-001-collection-pane-and-crud-card
part_number: 1
status: draft
owner: frontend
assigned_to: frontend
phase: phase-002-collection-zone
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Build the `WorkspaceCollectionPane` (the scrollable lower management zone) and `StructureCrudCard` (the per-entity utility card with select, rename, and delete actions), creating the primary CRUD interface for the active mode's structural entities.

## Scope

**In scope:**

- `WorkspaceCollectionPane` component — scrollable grid container
- `StructureCrudCard` component — dense utility card per entity
- Select, rename (inline), and delete actions on each card
- Hidden scrollbar on collection pane
- Visual hierarchy: cards are shorter and denser than the hero

**Out of scope:**

- Drag-and-drop reordering
- Create card (Part 002)
- Batch operations

## Implementation Steps

1. Create `src/modules/workspace/components/WorkspaceCollectionPane.svelte`:
   - Accepts `children` snippet for card content
   - Renders a scrollable container with CSS grid layout
   - Grid: responsive columns, e.g., `repeat(auto-fill, minmax(260px, 1fr))`
   - Hidden scrollbar: `-webkit-scrollbar { display: none }`, `scrollbar-width: none`
   - `overflow-y: auto` enables scrolling
   - Padding and gap matching Hub card grid spacing
2. Create `src/modules/workspace/components/StructureCrudCard.svelte`:
   - Props:
     - `title: string`
     - `subtitle?: string` (second line of info, mode-dependent)
     - `selected: boolean` (highlight if this is the hero-active item)
     - `onSelect: () => void`
     - `onRename: (newTitle: string) => void`
     - `onDelete: () => void`
   - Display:
     - Card surface: `var(--color-surface-overlay)`, `var(--radius-lg)`, subtle border
     - Title: `var(--text-sm)`, `var(--font-weight-semibold)`
     - Subtitle: `var(--text-xs)`, `var(--color-text-muted)`
     - Selected state: slightly brighter border or subtle accent glow
   - Actions:
     - Click card body → calls `onSelect`
     - Rename button (pencil icon, hover reveal) → enters inline edit mode for title
     - Inline edit: replace title with `<input>`, confirm on Enter or blur, cancel on Escape
     - Delete button (trash icon, hover reveal) → shows confirmation, then calls `onDelete`
   - Cards should be compact: ~80px height, dense padding
3. Export both components from workspace module barrel

## Files

**Create:**

- `src/modules/workspace/components/WorkspaceCollectionPane.svelte`
- `src/modules/workspace/components/StructureCrudCard.svelte`

**Update:**

- `src/modules/workspace/index.ts` — export new components

## Acceptance Criteria

- [ ] `WorkspaceCollectionPane` renders a scrollable grid container
- [ ] Scrollbar is visually hidden but scrolling works
- [ ] Grid columns are responsive (`auto-fill`, min 260px)
- [ ] `StructureCrudCard` displays title and optional subtitle
- [ ] Clicking the card calls `onSelect`
- [ ] Selected card has a visually distinct state (accent border/glow)
- [ ] Rename via hover-reveal pencil icon → inline input → confirm/cancel
- [ ] Delete via hover-reveal trash icon → confirmation → calls `onDelete`
- [ ] Cards are compact and denser than the hero card
- [ ] Visual treatment matches Hub card language
- [ ] Lint and typecheck pass

## Edge Cases

- Very long titles should truncate with ellipsis in the card
- Rename input should be pre-filled with current title and auto-focused
- Delete confirmation should prevent accidental data loss
- Empty collection (no cards) should not show an empty grid — handled by the create card (Part 002)

## Notes

> The card subtitle is mode-dependent and computed by the parent page:
>
> - Arc cards: truncated description
> - Act cards: truncated planning notes
> - Chapter cards: "X scenes" count
> - Scene cards: truncated summary
>
> The confirmation for delete can be a simple inline "Delete? Yes / No" pattern rather than a modal, keeping the interaction lightweight and in-context.
>
> Hover-reveal action buttons: render with `opacity: 0` at rest, `opacity: 1` on card hover. Include `focus-visible` handling for keyboard users.
