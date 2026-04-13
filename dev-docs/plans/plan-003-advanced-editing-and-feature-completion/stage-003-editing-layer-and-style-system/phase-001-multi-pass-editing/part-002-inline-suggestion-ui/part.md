---
title: Inline Suggestion UI
slug: part-002-inline-suggestion-ui
part_number: 2
status: complete
owner: Frontend Agent
phase: phase-001-multi-pass-editing
estimated_duration: 1.5d
---

## Objective

Build the shared `AiSuggestionOverlay` component: a reusable UI layer that displays `EditSuggestion[]` (and later `StyleDeviation[]`) over scene text, letting users accept or reject each suggestion individually.

## Context

- `src/lib/ai/types.ts` — `EditSuggestion` interface (from part-001)
- `src/lib/components/` — shared component location (per modular-boundaries: shared components not owned by a single module live here)
- Edit mode selector: "Developmental", "Line Edit", "Proofread" buttons in the editor toolbar

## Target Files

| File                                                                  | Action                                  |
| --------------------------------------------------------------------- | --------------------------------------- |
| `src/lib/components/ai-suggestion-overlay/AiSuggestionOverlay.svelte` | Create — main overlay component         |
| `src/lib/components/ai-suggestion-overlay/SuggestionCard.svelte`      | Create — per-suggestion card            |
| `src/lib/components/ai-suggestion-overlay/index.ts`                   | Create — barrel export                  |
| `src/modules/editor/components/EditModeToolbar.svelte`                | Create — mode selector + trigger button |

## Overlay Behaviour

1. User clicks "Edit: Developmental / Line Edit / Proofread" in toolbar → pipeline invoked → `EditSuggestion[]` returned
2. Overlay renders each suggestion as a card anchored near its `spanStart` offset in the displayed text
3. Each card shows: original text (strikethrough), suggested text, reason
4. "Accept" button: replaces `original` with `suggestion` in `scene.text` and triggers autosave (when available); removes card
5. "Reject" button: removes card without changes
6. "Accept All" and "Reject All" bulk actions in overlay header
7. Loading state shown while pipeline is running
8. Error state shown if pipeline fails

## Accessibility

- Cards must be keyboard navigable (Tab to move between cards; Enter to accept; Escape to reject)
- Cards have `role="dialog"` and descriptive `aria-label`

## Acceptance Criteria

- [ ] `AiSuggestionOverlay` renders all suggestions from `EditSuggestion[]` correctly
- [ ] Accept / Reject per-card work; text mutation is applied to the correct span offsets
- [ ] "Accept All" / "Reject All" apply bulk actions
- [ ] Loading state shown during pipeline execution
- [ ] Component is reusable: accepts `suggestions: EditSuggestion[] | StyleDeviation[]` as a prop (union type)
- [ ] Keyboard navigation works as specified
- [ ] `pnpm run check` exits clean; component ≤150 lines (extract `SuggestionCard` to keep this)
