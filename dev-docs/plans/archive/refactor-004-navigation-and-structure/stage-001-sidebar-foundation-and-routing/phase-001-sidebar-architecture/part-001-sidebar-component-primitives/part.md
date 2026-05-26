---
title: Sidebar Component Primitives
slug: part-001-sidebar-component-primitives
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-sidebar-architecture
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Create the three foundational Svelte 5 components for the new sidebar system: `SidebarItem` (individual nav entry), `SidebarSection` (labeled grouping container), and `AppSidebar` (root sidebar shell). These primitives are used exclusively by all navigation compositions built in subsequent parts.

## Context

- Current `src/lib/components/Sidebar.svelte` is a single minimal component with one nav link — it is replaced in full.
- The new system is a three-layer composition: `AppSidebar` → `SidebarSection` → `SidebarItem`.
- `--sidebar-width: 220px` is already a token in `tokens.css`.
- Design tokens: `--color-surface-ground` (sidebar bg, `#111111`), `--color-teal` (active indicator), `--color-text-primary`, `--color-text-muted`, `--text-sm`, `--text-xs`, `--space-2`, `--space-3`, `--space-4`.
- SvelteKit's `$page` store (from `$app/stores`) provides `page.url.pathname` for active-state derivation.

## Scope

**In scope:**

- Create `src/lib/components/SidebarItem.svelte`
- Create `src/lib/components/SidebarSection.svelte`
- Create `src/lib/components/AppSidebar.svelte` (shell only — no sections content yet; added in Part 002)
- Export all three from `src/lib/components/index.ts`

**Out of scope:**

- Section content (GLOBAL, PROJECTS, ACTIVE PROJECT) — Part 002 and Part 003
- Root layout swap — Phase 003
- Active Project dynamic section — Part 003

## Implementation Steps

1. Create `src/lib/components/SidebarItem.svelte` (Svelte 5):
   - Props: `href?: string`, `label: string`, `icon?: import('svelte').Snippet`, `active?: boolean`, `locked?: boolean`
   - When `locked === true`: render a non-interactive `<span class="sidebar-item sidebar-item--locked">` with reduced opacity (`0.4`) and a lock character or SVG; no `href` binding
   - When not locked and `href` is set: render `<a href={href} class="sidebar-item" class:active>` where `active` is auto-derived from `page.url.pathname.startsWith(href)` if not explicitly passed
   - Active state styles: left border `2px solid var(--color-teal)`, background `rgba(255,255,255,0.05)`
   - Padding: `var(--space-2) var(--space-3)`; font-size `var(--text-sm)`; color `var(--color-text-primary)`

2. Create `src/lib/components/SidebarSection.svelte` (Svelte 5):
   - Props: `label?: string` (if undefined no header rendered), `children: import('svelte').Snippet`
   - Section header when `label` is set: `<h3 class="sidebar-section__label">` styled `--text-xs`, `--color-text-muted`, uppercase, `letter-spacing: 0.08em`, `padding: var(--space-3) var(--space-3) var(--space-1)`
   - Renders `{@render children()}` below the optional header

3. Create `src/lib/components/AppSidebar.svelte` (Svelte 5):
   - Renders `<aside class="app-sidebar" aria-label="Navigation">` with `width: var(--sidebar-width)`, `background: var(--color-surface-ground)`, `height: 100vh`, `overflow-y: auto`, `display: flex; flex-direction: column`
   - Body is a `{@render children()}` slot — populated in Part 002 and 003
   - No logic in this shell; it is a layout container only

4. Update `src/lib/components/index.ts`:
   - Add: `export { default as AppSidebar } from './AppSidebar.svelte'`
   - Add: `export { default as SidebarSection } from './SidebarSection.svelte'`
   - Add: `export { default as SidebarItem } from './SidebarItem.svelte'`
   - Do NOT remove `Sidebar` or `ProjectModeSwitcher` exports yet (removed in Phase 003)

## Files

**Create:**

- `src/lib/components/SidebarItem.svelte`
- `src/lib/components/SidebarSection.svelte`
- `src/lib/components/AppSidebar.svelte`

**Update:**

- `src/lib/components/index.ts` — add three new exports

## Acceptance Criteria

- [ ] `SidebarItem` renders as `<a>` when `href` provided and `locked === false/undefined`
- [ ] `SidebarItem` renders as non-interactive `<span>` when `locked === true`; clicking does nothing
- [ ] `SidebarItem` applies active styles when `page.url.pathname.startsWith(href)` is true
- [ ] `SidebarSection` renders optional label header with correct uppercase muted styling
- [ ] `AppSidebar` renders `<aside>` shell at `--sidebar-width` width
- [ ] All styles use CSS custom properties — no hardcoded hex values or px spacing
- [ ] `pnpm run check` exits clean with zero TypeScript errors

## Edge Cases

- `href === '/'` for Home item: active state must use exact match (`pathname === '/'`) to avoid matching all routes — use `href === '/' ? pathname === '/' : pathname.startsWith(href)`
- `label` prop must always be provided; `icon` is optional — the item must render correctly without an icon
- `SidebarSection` with no `label` prop must render no heading element (not an empty `<h3>`)

## Notes

- Svelte 5 snippet pattern: `let { children, icon }: { children?: Snippet, icon?: Snippet } = $props()` — do not use legacy `<slot>` syntax
- `$page` imported from `$app/stores`; use `$page.url.pathname` (reactive)
- Keep all component files under 100 lines
