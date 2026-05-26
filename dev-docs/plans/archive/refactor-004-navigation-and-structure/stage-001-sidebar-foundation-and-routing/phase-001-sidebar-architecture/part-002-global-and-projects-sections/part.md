---
title: Global & Projects Sections
slug: part-002-global-and-projects-sections
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-sidebar-architecture
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Extend `AppSidebar.svelte` with the static GLOBAL section (Home active link + Nova, Images, Styles locked stubs) and the static PROJECTS section (Books nav item). These sections are visible at all times, regardless of whether a project is active.

## Context

- `AppSidebar.svelte` shell exists from Part 001 — it currently renders an empty `<aside>`
- `SidebarSection` and `SidebarItem` primitives are available
- GLOBAL section: no label (unlabeled top section), contains site-wide surfaces
- PROJECTS section: label "PROJECTS", contains project type entries
- Inline SVG icons should be simple single-path icons (monochrome), sized via `--text-base` or `1rem`

## Scope

**In scope:**

- Populate `AppSidebar.svelte` with GLOBAL section items: Home, Nova (locked), Images (locked), Styles (locked)
- Add PROJECTS section items: Books, Stories (locked)
- Inline SVG icons for each item (home, sparkle, image, palette, book, scroll)

**Out of scope:**

- Active Project section — Part 003
- Recent section — Stage 005
- Root layout swap — Phase 003

## Implementation Steps

1. In `AppSidebar.svelte`, add GLOBAL section (no label):
   - `<SidebarSection>` with no `label` prop
   - `<SidebarItem href="/" label="Home">` with home icon; active when `pathname === '/'` (exact match)
   - `<SidebarItem label="Nova" locked={true}>` with sparkle/AI icon
   - `<SidebarItem label="Images" locked={true}>` with image icon
   - `<SidebarItem label="Styles" locked={true}>` with palette icon

2. Add PROJECTS section:
   - `<SidebarSection label="PROJECTS">`
   - `<SidebarItem href="/" label="Books">` — links to project list (Home is project library); add icon: open-book SVG
   - `<SidebarItem label="Stories" locked={true}>` with scroll/story icon

3. For SVG icons: define each as a minimal inline SVG in a `{#snippet icon()}` block passed to `SidebarItem`. Icons must be `16x16` or `1em × 1em`, `fill="currentColor"`, and use simple paths only.

4. Add a visual separator (`<hr class="sidebar-divider">`) between GLOBAL and PROJECTS sections. Style: `border: none; border-top: 1px solid var(--color-border-default); margin: var(--space-2) var(--space-3)`.

## Files

**Update:**

- `src/lib/components/AppSidebar.svelte` — add GLOBAL and PROJECTS sections

## Acceptance Criteria

- [ ] GLOBAL section renders all four items: Home (active link), Nova (locked), Images (locked), Styles (locked)
- [ ] PROJECTS section renders: Books (active link), Stories (locked)
- [ ] Home item active state uses exact path match (`pathname === '/'`)
- [ ] Locked items are visually distinct (reduced opacity, non-interactive)
- [ ] All icons are monochrome inline SVG at `1em` size
- [ ] Visual separator between GLOBAL and PROJECTS sections
- [ ] `pnpm run check` exits clean

## Edge Cases

- Home and Books both link to `/` — this is intentional (both represent the project library); they will diverge when `/projects` becomes a separate route in a future plan
- Locked items must not prevent `AppSidebar` from rendering — treat as static inert elements

## Notes

- GLOBAL section has no label — this is correct per the navigation taxonomy. The first section has no header.
- The `SidebarItem` for Home uses exact-match active logic (edge case documented in Part 001)
