---
title: Memory Leak Fixes
slug: part-002-memory-leaks
part_number: 2
status: complete
owner: frontend
assigned_to: frontend
phase: phase-001-code-quality
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.25d
---

## Objective

Fix all event-listener registrations in layout and long-lived components that are not cleaned up on component destroy, preventing cumulative memory leaks during navigation.

## Scope

**In scope:**

- `src/routes/+layout.svelte` — service worker `addEventListener` without removal
- `src/modules/settings/components/ThemeSelector.svelte` — `matchMedia` event listener without removal
- Any other component with `addEventListener` / `setInterval` / `setTimeout` that is not cleaned up

**Out of scope:**

- Listeners on SSR-only server hooks
- Listeners added by third-party libraries (TipTap, etc.)

## Implementation Steps

1. Run `grep -rn "addEventListener\|setInterval\|setTimeout" src/ --include="*.svelte"` to enumerate all listener registrations.

2. For each match, check whether a corresponding `removeEventListener` / `clearInterval` / `clearTimeout` exists in an `onDestroy` or `$effect` cleanup callback.

3. **`+layout.svelte` service worker listener:** Wrap the registration in a Svelte 5 `$effect`:
   ```
   $effect(() => {
     const handler = (event) => { ... };
     navigator.serviceWorker?.addEventListener('message', handler);
     return () => navigator.serviceWorker?.removeEventListener('message', handler);
   });
   ```

4. **`ThemeSelector.svelte` matchMedia listener:** Wrap the `matchMedia.addEventListener('change', ...)` call in a `$effect` with a cleanup return that calls `matchMedia.removeEventListener('change', handler)`.

5. For any `setInterval` found in components, ensure it is cleared with `clearInterval` in the `$effect` cleanup or `onDestroy`.

6. Run `pnpm run lint && pnpm run check`.

## Files

**Update:**

- `src/routes/+layout.svelte`
- `src/modules/settings/components/ThemeSelector.svelte`
- Any additional files identified in step 1

## Acceptance Criteria

- [ ] Every `addEventListener` in `src/` has a matching `removeEventListener` in a cleanup function.
- [ ] Every `setInterval` has a matching `clearInterval`.
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- Svelte 5 `$effect` cleanup functions only run when the effect re-runs or the component is destroyed. If a listener depends on reactive state, place it inside the effect that reacts to that state — not a top-level `onMount`.

## Notes

Use `$effect` (Svelte 5) rather than `onMount`/`onDestroy` pairs. The `$effect` return value is the cleanup function — this is the idiomatic Svelte 5 pattern.
