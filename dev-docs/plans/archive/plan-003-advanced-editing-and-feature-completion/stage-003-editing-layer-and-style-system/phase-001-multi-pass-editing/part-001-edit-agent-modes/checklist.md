---
part: part-001-edit-agent-modes
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `dev-docs/agents-map.md` §EditAgent — confirm inputs/outputs/constraints
- [ ] Read `src/lib/ai/types.ts` post stage-002 — confirm `edit` not already present
- [ ] Read `prompt-builder.ts` — understand how to add a new template variant
- [ ] Read `task-resolver.ts` — understand action-mapping table structure

## Post-Implementation

- [ ] `EditSuggestion` interface in `types.ts` matches spec exactly
- [ ] All 3 actions resolve with correct `contextPolicy` and `outputFormat`
- [ ] 3 distinct prompt templates produce different TASK sections
- [ ] Output parser handles: valid `EditSuggestion[]`, empty array, malformed JSON
- [ ] Vitest tests pass for all 3 modes (attach test output as evidence)
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
