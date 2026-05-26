---
title: Hub Sidebar Alignment
slug: part-001-hub-sidebar-alignment
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-hub-surface-integration
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Move the Hub page from `/projects/[id]/` to `/projects/[id]/hub`. Add a SvelteKit redirect from the old root route. Verify the Hub page works correctly with the removed project header (utility actions already migrated in Stage 001). Ensure the Hub sidebar item reflects active state when on this route.

## Context

- Hub page currently lives at `src/routes/projects/[id]/+page.svelte` and `+page.ts`
- The Hub's content (`ProjectHubHero`, `StructuralMetricsCarousel`, etc.) was composed in `refactor-003-hub-story-identity`; it must be moved intact
- Edit/Export/Delete actions were added to the current Hub page in Stage 001 Phase 002 — these carry over to the new route
- `ActiveProjectSection` (Stage 001 Phase 001) already has a Hub item at `href="{base}/hub"` — it just needs the route to exist

## Scope

**In scope:**

- Create `src/routes/projects/[id]/hub/` — move Hub page content here
- Update `src/routes/projects/[id]/+page.ts` to redirect to `/projects/[id]/hub`
- Ensure Hub page compiles and runs at new route without errors

**Out of scope:**

- Hub content changes
- Workspace rename — Phase 002

## Implementation Steps

1. Create `src/routes/projects/[id]/hub/` directory with:
   - `+page.svelte` — copy full content from `src/routes/projects/[id]/+page.svelte`
   - `+page.ts` — copy load logic from `src/routes/projects/[id]/+page.ts`

2. Update `src/routes/projects/[id]/+page.ts` to redirect:

   ```ts
   import { redirect } from '@sveltejs/kit';
   import type { PageLoad } from './$types';

   export const load: PageLoad = ({ params }) => {
     throw redirect(307, `/projects/${params.id}/hub`);
   };
   ```

3. Update `src/routes/projects/[id]/+page.svelte` to be empty (the load redirect in `+page.ts` handles navigation):
   - Replace the entire `+page.svelte` content with an empty shell or delete it if SvelteKit allows `+page.ts`-only redirect without a `+page.svelte`

4. Verify the new `hub/+page.svelte` renders identically to how the old page rendered at the root route

5. Check that utility actions (Edit, Export, Delete) added in Stage 001 are present in the new `hub/+page.svelte` (they were copied from the old page; confirm they are there)

## Files

**Create:**

- `src/routes/projects/[id]/hub/+page.svelte`
- `src/routes/projects/[id]/hub/+page.ts`

**Update:**

- `src/routes/projects/[id]/+page.ts` — replace load with redirect
- `src/routes/projects/[id]/+page.svelte` — empty shell or minimal redirect notice

## Acceptance Criteria

- [ ] Navigating to `/projects/[id]/` redirects to `/projects/[id]/hub` (307 in dev, 308 acceptable in prod)
- [ ] Hub page renders at `/projects/[id]/hub` with all `refactor-003` hero content
- [ ] Edit, Export, Delete action buttons present on the Hub page
- [ ] Hub sidebar item in `ActiveProjectSection` shows active state when on `/projects/[id]/hub`
- [ ] `pnpm run check` exits clean

## Edge Cases

- SvelteKit requires a `+page.svelte` file when a `+page.ts` is present — create a minimal empty `<script></script>` if needed to avoid missing component error
- The redirect uses `params.id` — ensure `params` is destructured in the load function signature

## Notes

- This is a route move, not a feature change — the Hub page content is identical; only the URL changes
- If `+page.ts` at the project root level included side effects (e.g., fetching project data shared with child routes), those effects should be in `+layout.ts`, not `+page.ts` — verify this is the case before making the root `+page.ts` a redirect-only file
