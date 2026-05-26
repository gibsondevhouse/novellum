---
title: Global Toast Service
slug: part-001-toast-service
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-001-feedback-systems
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Implement a global toast notification service using a Svelte 5 rune store and a `<ToastContainer>` component mounted in the root layout, then migrate all ad-hoc inline status messages to use `toast()`.

## Scope

**In scope:**

- `src/lib/stores/toast.svelte.ts` — the toast state store with `toast()` helper
- `src/lib/components/ToastContainer.svelte` — renders the active toast stack
- `src/routes/+layout.svelte` — mounts `<ToastContainer>`
- Migrating these known ad-hoc status message sites to `toast()`:
  - `src/modules/continuity/components/PromptEditor.svelte`
  - `src/modules/project/components/ProjectCreateCard.svelte`
  - `src/modules/export/components/ExportModal.svelte`
  - `src/modules/settings/components/ApiSettings.svelte`

**Out of scope:**

- Toast persistence across page navigations
- Server-side error reporting

## Implementation Steps

1. Create `src/lib/stores/toast.svelte.ts`:
   - Define a `Toast` interface: `{ id: string; message: string; type: 'success' | 'error' | 'info'; duration?: number }`.
   - Use `$state<Toast[]>([])` as the list.
   - Export `function toast(message: string, type: Toast['type'] = 'info', duration = 3500)` that pushes a toast with a unique `id` (crypto.randomUUID) and auto-removes after `duration` ms.
   - Export the toasts list as a getter for the container to read.

2. Create `src/lib/components/ToastContainer.svelte`:
   - Import the toast store.
   - Render toasts in a fixed `role="status"` `aria-live="polite"` region anchored to the bottom-right corner.
   - Use CSS transitions (`transition:fly`) for enter/exit animations.
   - Each toast has a dismiss button with `aria-label="Dismiss notification"`.
   - Use design tokens exclusively: `--color-surface-overlay`, `--color-nova-blue`, `--color-error` (if defined), `--space-*`, `--text-sm`.

3. In `src/routes/+layout.svelte`, import and render `<ToastContainer />` below `<slot />` (or `{@render children()}` for Svelte 5).

4. In each of the four migration sites listed in scope:
   - Remove the inline status `$state` variable and any reactive status text binding.
   - On success, call `toast('Saved successfully', 'success')`.
   - On error, call `toast(error.message ?? 'An error occurred', 'error')`.

5. Run `pnpm run lint && pnpm run check && pnpm run test`.

## Files

**Create:**

- `src/lib/stores/toast.svelte.ts`
- `src/lib/components/ToastContainer.svelte`

**Update:**

- `src/routes/+layout.svelte`
- `src/modules/continuity/components/PromptEditor.svelte`
- `src/modules/project/components/ProjectCreateCard.svelte`
- `src/modules/export/components/ExportModal.svelte`
- `src/modules/settings/components/ApiSettings.svelte`

## Acceptance Criteria

- [ ] `toast('test', 'success')` called in any component renders a visible toast in the UI.
- [ ] Toast auto-dismisses after its duration.
- [ ] Toast has a dismiss button accessible by keyboard.
- [ ] `aria-live="polite"` region announces the toast text to screen readers.
- [ ] None of the four migrated components contain inline status message variables any more.
- [ ] `pnpm run lint && pnpm run check && pnpm run test` exit 0.

## Edge Cases

- Multiple toasts queued rapidly: render as a stack, not overlapping.
- `crypto.randomUUID` may not be available in test environments; provide a fallback (`Date.now().toString() + Math.random()`).

## Notes

The `ToastContainer` must be positioned with `position: fixed; z-index: var(--z-toast, 9999)` so it overlays modals. Add `--z-toast` to the token file if it doesn't exist.
