---
title: Hero Card
slug: part-002-hero-card
part_number: 2
status: draft
owner: frontend
assigned_to: frontend
phase: phase-001-hero-zone
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Build the `WorkspaceHeroCard` component that adapts its content based on the active structural mode, displaying the currently selected item's key details, or a polished empty state with a creation CTA when no items exist for the active mode.

## Scope

**In scope:**

- `WorkspaceHeroCard` component with four mode-specific rendering branches
- Empty state rendering with mode-specific CTA messaging
- Stable card height across all modes and states
- Visual alignment with Hub hero card treatment

**Out of scope:**

- Inline editing of hero fields (future enhancement)
- Cover image / avatar in hero card

## Implementation Steps

1. Create `src/modules/workspace/components/WorkspaceHeroCard.svelte`
2. Props:
   - `mode: WorkspaceMode`
   - `item: Arc | Act | Chapter | Scene | null` (null = empty state)
   - `sceneCount?: number` (for chapter mode — count of scenes in chapter)
   - `povCharacterName?: string | null` (for scene mode — resolved character name)
   - `onCreate: () => void` (called when empty-state CTA is clicked)
3. Mode-specific rendering:
   - **Arc**: title, description (or empty placeholder), purpose (or empty placeholder)
   - **Act**: title, planningNotes as "Intent" (or empty placeholder), structural purpose hint
   - **Chapter**: title, summary (or empty placeholder), scene count badge
   - **Scene**: title, POV character name (or "No POV assigned"), purpose/conflict summary
4. Empty state rendering (when `item` is null):
   - Mode-specific heading: "No arcs yet", "No acts yet", "No chapters yet", "No scenes yet"
   - Mode-specific CTA subtext:
     - Arcs: "Create your first arc to define major narrative movement"
     - Acts: "Create your first act to structure the story's progression"
     - Chapters: "Create your first chapter to begin organizing content"
     - Scenes: "Create your first scene to start writing"
   - Subtle create button that calls `onCreate`
5. Ensure card height is stable:
   - Use `min-height` consistent with content state
   - Empty state content should fill the same vertical space as populated content
6. Typography:
   - Title: `var(--font-display)`, `var(--text-2xl)`, `var(--color-text-primary)`
   - Labels: `var(--font-sans)`, `var(--text-xs)`, uppercase, `var(--color-text-muted)`
   - Values/body: `var(--font-sans)`, `var(--text-sm)`, `var(--color-text-secondary)`

## Files

**Create:**

- `src/modules/workspace/components/WorkspaceHeroCard.svelte`

**Update:**

- `src/modules/workspace/index.ts` — export new component

## Acceptance Criteria

- [ ] Arc hero displays: title, description, purpose
- [ ] Act hero displays: title, planning notes as "Intent", structural hint
- [ ] Chapter hero displays: title, summary, scene count
- [ ] Scene hero displays: title, POV character name, purpose/conflict
- [ ] Empty state shows mode-specific heading and CTA subtext
- [ ] Empty state CTA button calls `onCreate`
- [ ] Card height remains stable across all modes and states
- [ ] Typography and color tokens match Hub design language
- [ ] Lint and typecheck pass

## Edge Cases

- Item with empty string fields (e.g., arc with no description): show dashed placeholder text like "No description" in muted style
- Scene with null `povCharacterId`: display "No POV assigned"
- Chapter with 0 scenes: show "0 scenes" badge
- Very long titles/descriptions: text should truncate or wrap gracefully without breaking layout

## Notes

> The hero card is a presentation component — it receives resolved data (character name already looked up, scene count already computed). The parent page is responsible for computing derived props.
>
> The empty state CTA button should be understated — not a large primary button, but a subtle link-style affordance that invites without demanding. Match the Hub's restrained accent approach.
>
> Consider using a type discriminator or mode switch to select the correct rendering branch. Svelte `{#if mode === 'arcs'}...{:else if}...{/if}` is appropriate.
