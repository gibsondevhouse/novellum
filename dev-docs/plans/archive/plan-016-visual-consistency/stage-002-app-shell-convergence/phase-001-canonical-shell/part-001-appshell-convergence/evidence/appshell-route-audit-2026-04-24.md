# AppShell Route Audit (2026-04-24)

## Objective

Close Phase 001 AppShell convergence by validating canonical shell ownership and documenting approved shell-adjacent wrappers.

## Canonical Shell Verification

- Root route layout composes the shared shell exactly once via `src/routes/+layout.svelte` -> `<AppShell>`.
- All reachable routes inherit that layout shell contract through SvelteKit layout nesting.

## Wrapper Audit Outcome

Route-level wrappers found in the sweep are archetype containers, not alternate app-shell implementations:

- `src/routes/projects/[id]/+layout.svelte` (`project-shell`, `mode-content`) keeps project-level context orchestration and view-transition naming.
- `src/routes/books/[id]/+page.svelte` (`reader-shell`) is a reading-surface content container.
- `src/routes/styles/+page.svelte` (`styles-page`) is a utility/settings content container.
- `src/routes/settings/migrate/+page.svelte` (`migrate-page`) is a migration utility content container.
- `src/routes/projects/[id]/arcs/+page.svelte` and `src/routes/projects/[id]/arcs/[arcId]/+page.svelte` (`future-shell`) are placeholder feature containers pending Arc Planner implementation.

No duplicate full-app shell (sidebar + header + main scroll frame) was found outside `AppShell`.

## Representative Visual Regression Set

Reviewed representative route families after convergence:

1. `/`
2. `/projects`
3. `/projects/[id]/hub`
4. `/books/[id]`
5. `/settings/migrate`

## Validation

- `pnpm run lint` -> pass
- `pnpm run check` -> `svelte-check found 0 errors and 0 warnings`
- `pnpm run check:tokens` -> `0 violations`

## Acceptance Mapping

- One AppShell backing all routes: satisfied.
- Route-local shell CSS exceptions documented: satisfied.
- Lint/typecheck/tokens/boundaries gates: satisfied.
- Representative visual regression route set captured: satisfied.
