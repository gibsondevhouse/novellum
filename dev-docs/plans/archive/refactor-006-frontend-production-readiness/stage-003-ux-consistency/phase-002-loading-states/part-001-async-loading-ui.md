---
title: Async Loading UI Patterns
slug: part-001-async-loading-ui
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-002-loading-states
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Add appropriate loading UI to all async surfaces that currently render blank content during data fetch or AI streaming operations.

## Scope

**In scope:**

- `src/modules/ai/components/ChatInterface.svelte` — typing indicator during streaming
- `src/modules/export/components/ImportBackupDialog.svelte` — visual progress indicator during restore
- SvelteKit `+page.svelte` routes that use `data` from loaders but show no skeleton: identify via grep for `export let data` with no `{#if loading}` guard

**Out of scope:**

- Server-side loading skeletons (SSR)
- Lazy-loading route code splitting (separate concern)

## Implementation Steps

1. **Chat typing indicator:** In `ChatInterface.svelte`, when `isStreaming` is `true` and no content has been returned yet, render an animated three-dot typing indicator (`...` with CSS `@keyframes`). Once content starts streaming in, replace the indicator with the partial content.

2. **Import progress indicator:** In `ImportBackupDialog.svelte`, when the restore action is in progress, show a spinner (CSS `border-radius: 50%` with `@keyframes spin`) alongside the "Restoring…" button text. The spinner should be `aria-busy="true"` on the container.

3. **Route skeleton audit:** Run `grep -rln "export let data" src/routes/` to find all data-loaded route pages. For each, check whether it has a loading guard. If not, add a `<Skeleton>` placeholder or a simple shimmer `<div>` using:

   ``` ts
   {#await data.items}
     <div class="skeleton" aria-busy="true" aria-label="Loading..."></div>
   {:then items}
     ...content...
   {/await}
   ```

   (Only apply to routes where the data is genuinely async and noticeable latency is likely — i.e., routes hitting the SQLite API.)

4. Add a `.skeleton` CSS class to the global stylesheet (`src/styles/utilities.css` or similar) with a pulsing animation using `--color-surface-elevated` as the base colour.

5. Run `pnpm run lint && pnpm run check`.

## Files

**Update:**

- `src/modules/ai/components/ChatInterface.svelte`
- `src/modules/export/components/ImportBackupDialog.svelte`
- `src/styles/utilities.css` (or equivalent global CSS file)
- Any route pages identified in step 3

## Acceptance Criteria

- [ ] Sending a chat message shows a typing indicator before the first streamed character arrives.
- [ ] Starting an import restore operation renders a visible spinner (not just changed button text).
- [ ] No data-loaded route renders completely blank while awaiting data.
- [ ] `.skeleton` class produces a visible pulsing animation.
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- If streaming returns an error before any content, the typing indicator must be removed and the error toast should fire.
- `aria-busy="true"` must be removed from the container once loading completes.

## Notes

Keep CSS animations performant: use `transform` and `opacity` only — never animate `height`, `width`, or `background-position` on skeleton elements.
