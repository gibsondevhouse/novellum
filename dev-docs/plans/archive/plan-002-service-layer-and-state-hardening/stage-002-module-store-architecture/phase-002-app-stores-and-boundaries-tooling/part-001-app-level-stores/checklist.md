---
part: part-001-app-level-stores
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `phase-001-module-scoped-stores` is `complete`
- [ ] Read existing `src/lib/stores/active-project.svelte.ts` (if it exists) — identify current API
- [ ] Read existing `src/lib/stores/ai-panel.svelte.ts` (if it exists) — identify current API
- [ ] Read `dev-docs/modular-boundaries.md` — confirm `src/lib/stores/` is the correct shared-layer location

## Post-Implementation

- [ ] Both store files use only `$state` / `$derived` runes (no legacy writable/readable)
- [ ] All consumers updated to new API (run `grep -r "active-project\|ai-panel"` to find all imports)
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean
