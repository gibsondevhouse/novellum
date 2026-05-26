# Scroll & Padding Kickoff Evidence (2026-04-24)

## Scope

Stage 002 / Phase 003 / Part 001 kickoff pass focused on top-level hub surfaces using duplicate horizontal padding inside canonical AppShell content padding.

## Changes Applied

- Normalized route container horizontal padding to rely on AppShell `main-content` padding.
- Kept route-level vertical rhythm (top/bottom spacing) unchanged.
- Adjusted oversized empty-state horizontal padding in Stories route to avoid double shell padding.

### Updated Files

- `src/routes/+page.svelte`
- `src/routes/projects/+page.svelte`
- `src/routes/stories/+page.svelte`
- `src/routes/images/+page.svelte`
- `src/routes/books/+page.svelte`

## Validation

- `pnpm run check:tokens` -> pass (`0 violations`)
- `pnpm run check` -> pass (`svelte-check found 0 errors and 0 warnings`)
- `grep` verification for explicit route-level `var(--panel-padding)` usage -> no matches in `src/routes/**/*.svelte`.

## Follow-up Sweep Targets

- Project-scoped surfaces with route-level `padding: ... var(--panel-padding)` usage.
- Nested workspace routes where scroll container ownership must remain archetype-specific (editor/inspector exceptions).
