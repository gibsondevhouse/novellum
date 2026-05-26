---
title: Global Error Boundaries
slug: part-001-error-boundaries
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-001-error-infrastructure
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Create SvelteKit `+error.svelte` files at the root and project-scoped routes so that runtime errors render a branded, actionable recovery screen rather than a blank page or unhandled SvelteKit default.

## Scope

**In scope:**

- `src/routes/+error.svelte` — root-level catch-all error page
- `src/routes/projects/[id]/+error.svelte` — project-context error page

**Out of scope:**

- Custom error logging/reporting service (Sentry, etc.)
- Per-feature deep error pages beyond the two listed

## Implementation Steps

1. Create `src/routes/+error.svelte` using `$page.error` reactive data from SvelteKit's `$app/state` (Svelte 5 compatible). Display error status code, message, and a "Go to Library" button that navigates to `/`.
2. Create `src/routes/projects/[id]/+error.svelte`. Read the `id` param from `$page.params`. Display error message and a "Back to Library" button navigating to `/`.
3. Both pages must use only design-system tokens — `--color-surface-raised`, `--text-*`, `--space-*`, `--color-text-*`. No inline `style` attributes with raw values.
4. Both pages must have a visible `<h1>` with descriptive text (e.g., "Something went wrong") for screen readers.
5. Run `pnpm run lint && pnpm run check` to confirm no new errors.

## Files

**Create:**

- `src/routes/+error.svelte`
- `src/routes/projects/[id]/+error.svelte`

**Update:**

- None

## Acceptance Criteria

- [ ] Navigating to a non-existent route (e.g., `/does-not-exist`) renders the root error page with a visible CTA.
- [ ] Navigating to `/projects/invalid-id/outline` renders the project-scoped error page.
- [ ] Both pages pass `pnpm run check` with no type errors.
- [ ] Both pages use only design-system CSS tokens — grep for raw `px`/`rem`/`#[0-9a-f]` returns no matches in the new files.

## Edge Cases

- `$page.error` may be null in some edge paths; destructure safely with a fallback message string.
- The project `id` param may not be present on root error page; do not read it there.

## Notes

Use SvelteKit's `$app/state` (`page` rune) for Svelte 5 compatibility, not the legacy `$app/stores` pattern.
