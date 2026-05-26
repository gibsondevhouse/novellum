---
title: Overlays + Planning Sweep
slug: part-001-overlays-and-planning
part_number: 1
status: complete
owner: Stylist Agent
phase: phase-005-overlays-and-planning
---

## Scope

- `src/lib/components/ai-suggestion-overlay/AiSuggestionOverlay.svelte`:
  `.btn--primary` candle on ink with brass border; hover blends
  candle into brass.
- `src/lib/components/ai-suggestion-overlay/SuggestionCard.svelte`:
  same `.btn--primary` recipe; `.mode-badge--proofread`
  retokened to candle.
- `src/lib/components/rewrite-options-modal/RewriteOptionsModal.svelte`:
  `.btn--primary` candle on ink with brass border.
- `src/lib/components/planning/StructuredSection.svelte`:
  `.section-label` upgraded to 9px / 600 / 0.18em brass eyebrow.
- `src/lib/components/planning/PlanningSurfaceBody.svelte`:
  `.planning-context-label` upgraded to 9px / 600 / 0.18em brass
  eyebrow (falls back to brass when no per-surface accent supplied).

See [`checklist.md`](checklist.md) and [`impl.log.md`](impl.log.md).
