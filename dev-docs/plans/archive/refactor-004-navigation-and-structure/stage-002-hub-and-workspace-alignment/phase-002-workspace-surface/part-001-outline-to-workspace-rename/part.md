---
title: Outline to Workspace Rename
slug: part-001-outline-to-workspace-rename
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-workspace-surface
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Rename the Outline surface to Workspace. Create the new `/projects/[id]/workspace` route directory with the full Outline page content. Add a SvelteKit redirect from the old `/outline` route. Create a proxy `src/modules/workspace/index.ts` barrel that re-exports from `src/modules/outliner/`.

## Context

- The Outline page lives at `src/routes/projects/[id]/outline/+page.svelte` and `+page.ts`
- The Outline module is at `src/modules/outliner/` — it contains `HierarchyNavigator`, `StoryFramePanel`, `ActGroup`, `ChapterGroup`, `SceneRow`, `OutlineSummaryBar`, beats, and planning-surface components
- The rename at module level uses a proxy barrel to avoid changing every import across the codebase — `workspace/index.ts` re-exports everything from `outliner/`
- The old `/outline` URL must redirect to `/workspace` — Stage 005 will later re-use `/outline` for the compiled output. The redirect created here must be removed when Stage 005 creates a real page at that route.
- Page file limit: Workspace `+page.svelte` ≤150 lines

## Scope

**In scope:**

- Create `src/routes/projects/[id]/workspace/+page.svelte` — copy from `outline/+page.svelte`
- Create `src/routes/projects/[id]/workspace/+page.ts` — copy from `outline/+page.ts`
- Update `src/routes/projects/[id]/outline/+page.ts` to redirect to `/workspace`
- Create `src/modules/workspace/index.ts` as proxy barrel for outliner module

**Out of scope:**

- Renaming or modifying `src/modules/outliner/` internals
- Feature changes to Workspace/Outline content
- Stage 005 replacement of the `/outline` redirect (that happens in Stage 005 Part 001)

## Implementation Steps

1. Create `src/routes/projects/[id]/workspace/`:
   - `+page.svelte` — copy full content from `src/routes/projects/[id]/outline/+page.svelte`
   - `+page.ts` — copy content from `src/routes/projects/[id]/outline/+page.ts`
   - Update any component imports in `+page.svelte` that use the term "outline" or "Outline" in display strings; rename to "Workspace" only in user-visible labels
   - Do NOT change module import paths (they can still import from `$modules/outliner` or equivalent)

2. Create `src/modules/workspace/index.ts`:

   ```ts
   // src/modules/workspace/index.ts
   // Proxy barrel — re-exports the public API of the outliner module.
   // Workspace is the product name for the story planning surface.
   export * from '../outliner/index.ts';
   ```

   Verify `src/modules/outliner/index.ts` exists and has a complete barrel export.

3. Update `src/routes/projects/[id]/outline/+page.ts` to redirect:

   ```ts
   import { redirect } from '@sveltejs/kit';
   import type { PageLoad } from './$types';

   export const load: PageLoad = ({ params }) => {
     throw redirect(307, `/projects/${params.id}/workspace`);
   };
   ```

4. Update `src/routes/projects/[id]/outline/+page.svelte` to an empty minimal shell (SvelteKit redirect via load function; keep a `+page.svelte` to avoid missing component error)

5. Verify page line count: if `workspace/+page.svelte` exceeds 150 lines, extract any over-the-limit sections into sub-components within `src/modules/workspace/` before committing

## Files

**Create:**

- `src/routes/projects/[id]/workspace/+page.svelte`
- `src/routes/projects/[id]/workspace/+page.ts`
- `src/modules/workspace/index.ts`

**Update:**

- `src/routes/projects/[id]/outline/+page.ts` — replace with redirect
- `src/routes/projects/[id]/outline/+page.svelte` — empty shell

## Acceptance Criteria

- [ ] `/projects/[id]/workspace` renders the story planning surface (same as previous Outline content)
- [ ] `/projects/[id]/outline` redirects to `/projects/[id]/workspace`
- [ ] `src/modules/workspace/index.ts` exists and exports all outliner public API
- [ ] Workspace `+page.svelte` is ≤150 lines
- [ ] Workspace sidebar item in `ActiveProjectSection` shows active state on this route
- [ ] `pnpm run check` exits clean; no broken imports

## Edge Cases

- If `src/modules/outliner/index.ts` does not have a complete barrel export, create one or import components directly in the workspace proxy
- The old outline `+page.svelte` redirect shell must not cause a flash-of-content at the old URL

## Notes

- This rename frees the `/outline` route permanently; Stage 005 will claim it for the compiled output surface. When Stage 005 runs, the developer must remove the redirect in `outline/+page.ts` and add real page content.
- User-visible text "Outline" in any surface headings should be updated to "Workspace" in the new page files
