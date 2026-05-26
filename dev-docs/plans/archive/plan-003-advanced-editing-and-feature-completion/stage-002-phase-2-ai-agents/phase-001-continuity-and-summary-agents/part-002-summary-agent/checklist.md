---
part: part-002-summary-agent
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [x] Read `dev-docs/agents-map.md` §SummaryAgent
- [x] Read `src/lib/ai/types.ts` post part-001 — confirm `summarize` not already added
- [x] Read `src/lib/ai/task-resolver.ts` post part-001 — understand current pattern before extending
- [x] Read `src/lib/ai/prompt-builder.ts` post part-001 — confirm section-rendering pattern

## Post-Implementation

- [x] `summarize` in `TaskType` union
- [x] Both `summarize_scene` and `summarize_chapter` actions resolve correctly
- [x] Prompt Builder produces correctly formatted 5-section summary prompt
- [x] Vitest tests pass (4 tests: 2 resolution + 2 prompt construction)
- [x] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
