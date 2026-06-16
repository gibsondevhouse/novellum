---
part: part-002-add-pending-proposal-badges
date: 2026-06-16
owner: Codex
---

# Verification Evidence

## Summary

Added pending suggestion badges to worldbuilding domain cards and the base route jump links. Counts use the hydrated proposal suggestion store and hide entirely when a domain has no pending proposals. Badge copy is author-readable and accessible through `formatPendingSuggestionLabel`.

## Commands

- `pnpm test tests/world-building/worldbuild-pending-badges.test.ts tests/world-building/worldbuild-suggestion-route-state.test.ts tests/world-building/worldbuild-review-ui.test.ts`
  - Result: passed, 3 files / 21 tests.
- `pnpm check`
  - Result: passed, 0 errors / 0 warnings.
- `pnpm exec eslint src/lib/project-metadata.ts src/modules/world-building/index.ts src/modules/world-building/worldbuilding-workflow.ts src/modules/world-building/stores/worldbuild-suggestion-state.svelte.ts 'src/routes/projects/[id]/world-building/+page.svelte' 'src/routes/projects/[id]/world-building/help/+page.svelte' tests/world-building/worldbuild-suggestion-route-state.test.ts tests/world-building/worldbuild-pending-badges.test.ts tests/e2e/worldbuilding-suggestion-route-state.spec.ts`
  - Result: passed for all files changed by this part.
- `pnpm lint`
  - Result: failed on unrelated pre-existing baseline error:
    `src/routes/api/author-draft/checkpoints/stage-inline/+server.ts:36:10 'usedCanonRefsValue' is defined but never used`.
- `pnpm lint:css`
  - Result: passed.
- `pnpm check:tokens`
  - Result: passed, 348 files scanned / 0 violations.
- `pnpm run build`
  - Result: passed. Existing Lightning CSS warnings for Tailwind-style `@theme` / `@utility` rules were emitted during minification.
- `pnpm exec playwright test tests/e2e/worldbuilding-suggestion-route-state.spec.ts --project=chromium`
  - Result: passed, 1 test. Covers default desktop visibility plus mobile viewport bounds for the pending badge.

## Notes

The base `/world-building` route still redirects before rendering; its jump-link badge wiring is source-covered. The reachable `/world-building/help` route is browser-covered with seeded persisted proposal metadata.
