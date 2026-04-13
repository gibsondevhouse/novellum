---
part: part-002-inline-suggestion-ui
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `dev-docs/modular-boundaries.md` — confirm that `src/lib/components/` is the correct location for cross-module shared components
- [ ] Read `src/lib/ai/types.ts` — confirm `EditSuggestion` interface shape post part-001
- [ ] Confirm `spanStart` / `spanEnd` are character offsets in `scene.text` (not DOM offsets)

## Post-Implementation

- [ ] `AiSuggestionOverlay` renders all returned suggestions with original/suggested text and reason
- [ ] Accept per-card applies text replacement at correct character offsets in `scene.text`
- [ ] Reject per-card removes card without changing text
- [ ] "Accept All" / "Reject All" bulk actions work correctly
- [ ] Loading and error states render correctly
- [ ] Keyboard navigation: Tab cycles through cards; Enter accepts focused card; Escape rejects
- [ ] Component accepts `suggestions` prop typed as `EditSuggestion[]` (extensible to `StyleDeviation[]` in stage-003)
- [ ] `AiSuggestionOverlay.svelte` ≤150 lines (attach `wc -l` output)
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
