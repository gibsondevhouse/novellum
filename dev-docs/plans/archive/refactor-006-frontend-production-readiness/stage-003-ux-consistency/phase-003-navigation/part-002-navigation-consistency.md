---
title: Navigation API Consistency
slug: part-002-navigation-consistency
part_number: 2
status: complete
owner: frontend
assigned_to: frontend
phase: phase-003-navigation
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Replace all `window.location.href` assignments with SvelteKit's `goto()` to prevent full-page reloads that destroy in-memory state and break the SPA navigation model.

## Scope

**In scope:**

- All `.svelte` and `.ts` files in `src/` with `window.location.href` assignments
- Known violation: `src/routes/projects/[id]/world-building/characters/+page.svelte`

**Out of scope:**

- `window.location.reload()` calls that are intentional (e.g. post-migration full reload) — annotate with a comment explaining why

## Implementation Steps

1. Run `grep -rn "window\.location\.href" src/` to enumerate all violations.
2. For each violation, replace the assignment with the equivalent `goto()` call:
   - `window.location.href = '/some/path'` → `goto('/some/path')`
   - `window.location.href = url` → `goto(url)`
   - Ensure `goto` is imported from `$app/navigation` at the top of each updated file.
3. For any `window.location.href` that is a *read* (not assignment), e.g. to get base URL, replace with `$page.url.origin` from `$app/state`.
4. After replacements, run `grep -rn "window\.location\.href" src/` to confirm zero remaining assignments.
5. Run `pnpm run lint && pnpm run check`.

## Files

**Update:**

- `src/routes/projects/[id]/world-building/characters/+page.svelte`
- Any additional files identified in step 1

## Acceptance Criteria

- [ ] `grep -rn "window\.location\.href\s*=" src/` returns zero matches.
- [ ] Navigation in the characters listing does not trigger a full page reload.
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- If a `window.location.href` assignment follows a form submit and is intended to force a hard reload (e.g. anti-caching), replace with `goto(url, { invalidateAll: true })` instead.
- The `openrouter.ts` `HTTP-Referer` header reads `window.location.origin` at runtime — this is a read not an assignment and can stay as-is, but add a browser env guard (`typeof window !== 'undefined'`).

## Notes

`goto()` from `$app/navigation` is a no-op during SSR, making it safe for isomorphic components. `window.location` is not.
