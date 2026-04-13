---
part: part-002-rewrite-agent-and-ui
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `dev-docs/agents-map.md` §RewriteAgent — confirm constraints
- [ ] Read `src/lib/ai/types.ts` post part-001 — confirm no naming conflicts
- [ ] Decide diff library for option cards: evaluate `diff` npm package or implement char-level diff manually

## Post-Implementation

- [ ] `RewriteOption` interface in `types.ts`
- [ ] `resolveTask('rewrite', ctx)` returns correct AiTask
- [ ] Prompt Builder produces correctly formatted REWRITE prompt
- [ ] Output parser validates exactly 3 options; returns error state if count ≠ 3
- [ ] `RewriteOptionsModal` shows 3 options with diff highlighting
- [ ] Select: text replacement applied; autosave triggered; modal closes
- [ ] Cancel: no changes; modal closes
- [ ] Vitest tests pass for all output scenarios (attach evidence)
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
- [ ] `RewriteOptionsModal.svelte` ≤150 lines
