---
part: part-001-style-agent-and-presets
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `dev-docs/agents-map.md` §StyleAgent
- [ ] Read `src/lib/components/ai-suggestion-overlay/AiSuggestionOverlay.svelte` — confirm `suggestions` prop accepts a union type or generic without requiring code changes
- [ ] Read `src/lib/ai/types.ts` post phase-001 — confirm no naming conflicts

## Post-Implementation

- [ ] `StyleDeviation` and `StylePreset` types exported from `types.ts`
- [ ] `style-presets.ts` exports `STYLE_PRESETS: StylePreset[]` with all 4 presets
- [ ] `resolveTask('style_check', ctx)` returns correct `AiTask`
- [ ] Prompt Builder injects preset `rules[]` into CONTEXT section
- [ ] `AiSuggestionOverlay` renders `StyleDeviation[]` correctly (no prop-type errors)
- [ ] Preset selector visible in editor toolbar; selecting a preset and triggering style check uses correct preset rules
- [ ] Vitest tests pass (attach output as evidence)
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
