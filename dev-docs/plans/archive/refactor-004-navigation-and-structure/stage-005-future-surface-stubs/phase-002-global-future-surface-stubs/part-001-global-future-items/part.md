---
title: Global Future Items
slug: part-001-global-future-items
part_number: 1
status: draft
owner: Frontend Agent
assigned_in: Frontend Agent
phase: phase-002-global-future-surface-stubs
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Create route stub pages for the three global future surfaces — Nova (AI assistant), Images (asset library), and Styles (global writing style tokens). Register each in the GLOBAL section of `AppSidebar` as locked items, and add a RECENT section to the sidebar below PROJECTS.

## Context

- `AppSidebar` currently has: GLOBAL (Dashboard link) + PROJECTS section + ACTIVE PROJECT section (when project loaded)
- The full GLOBAL section should expose three future surfaces: Nova, Images, Styles
- A RECENT section is planned — it will show recent session history. Stub it now with a single locked item
- Each stub page follows the same pattern as the Outline stub (Part 001, Phase 001): centered layout, surface name, one-sentence description, "Coming soon" badge
- Routes are at app root level (not under `/projects/[id]/`): `/nova`, `/images`, `/styles`

## Scope

**In scope:**

- Create three global stub route files: `nova`, `images`, `styles`
- Update `AppSidebar` GLOBAL section with three new locked nav items: Nova, Images, Styles
- Add RECENT section below PROJECTS with one locked placeholder item "Recent sessions"

**Out of scope:**

- Implementing Nova, Images, or Styles functionality
- Implementing real recent-session tracking
- Any Backend work

## Implementation Steps

1. For each global surface, create two files using the shared `surface-stub` CSS pattern:

   **Nova** (`src/routes/nova/`):
   - `+page.ts`: `export const ssr = false;`
   - `+page.svelte`: Heading "Nova", description "AI assistant for writing, research, and project intelligence — context-aware prompting across all your projects", "Coming soon" badge

   **Images** (`src/routes/images/`):
   - `+page.ts`: `export const ssr = false;`
   - `+page.svelte`: Heading "Images", description "Asset library for covers, references, character portraits, and scene visuals — manage and tag media across projects", "Coming soon" badge

   **Styles** (`src/routes/styles/`):
   - `+page.ts`: `export const ssr = false;`
   - `+page.svelte`: Heading "Styles", description "Global writing style tokens — define tone, voice, and prose conventions that apply across all projects or collections", "Coming soon" badge

2. Update `src/lib/components/AppSidebar.svelte` GLOBAL section:
   - Existing: `<SidebarItem href="/" label="Dashboard" />`
   - Add after Dashboard: three locked items using `<SidebarItem href="/nova" label="Nova" locked={true} />`, Images, Styles

3. Add RECENT section to `AppSidebar` after PROJECTS section:

   ```svelte
   <SidebarSection label="RECENT">
     <SidebarItem href="#" label="Recent sessions" locked={true} />
   </SidebarSection>
   ```

4. `SidebarItem` with `locked={true}` must:
   - Render a lock icon (or reduced opacity) — already implemented in Part 001 (Stage 001 / Phase 001)
   - Not respond to click (pointer-events: none or href="#" + e.preventDefault())

## Files

**Create:**

- `src/routes/nova/+page.ts`
- `src/routes/nova/+page.svelte`
- `src/routes/images/+page.ts`
- `src/routes/images/+page.svelte`
- `src/routes/styles/+page.ts`
- `src/routes/styles/+page.svelte`

**Update:**

- `src/lib/components/AppSidebar.svelte` — GLOBAL section additions + RECENT section

## Acceptance Criteria

- [ ] `/nova`, `/images`, `/styles` all render meaningful stub pages
- [ ] Each stub page: heading, one-sentence description, "Coming soon" badge
- [ ] GLOBAL section in sidebar: Dashboard, Nova (locked), Images (locked), Styles (locked)
- [ ] RECENT section visible below PROJECTS with locked "Recent sessions" placeholder
- [ ] Locked items are visually de-emphasised (reduced opacity or lock icon)
- [ ] `pnpm run check` exits clean

## Edge Cases

- If user navigates directly to `/nova` before GLOBAL items are visible (scroll), the stub page renders independently — sidebar not required for the page to function
- RECENT section should appear above ACTIVE PROJECT section (if present): GLOBAL → PROJECTS → RECENT → ACTIVE PROJECT

## Notes

- The `surface-stub` class pattern from Part 001 of Phase 001 should be extracted into a shared component or style if it is being repeated for more than 2 surfaces
- Nova is the AI assistant surface — keep its description neutral and general; it is not yet defined architecturally
- Styles is global writing style tokens — distinct from per-project Continuity Writing Styles; the sidebar placement and scope differ
