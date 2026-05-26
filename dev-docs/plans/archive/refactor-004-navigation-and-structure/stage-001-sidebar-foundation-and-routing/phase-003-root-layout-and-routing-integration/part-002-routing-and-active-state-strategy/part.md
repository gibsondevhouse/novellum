---
title: Routing & Active State Strategy
slug: part-002-routing-and-active-state-strategy
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-003-root-layout-and-routing-integration
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Harden the `active-project.svelte.ts` store so projectId is always derived reactively from the page URL params — eliminating the risk of stale state after navigation. Document the canonical URL routing scheme for all surfaces in the frontend context doc.

## Context

- `src/lib/stores/active-project.svelte.ts` currently holds the active project state. It may currently be set via a manual setter called in `+layout.ts` load functions.
- A reactive derivation from `$page.params.id` is more reliable: if any component reads the active project, it always reflects the current URL.
- SvelteKit's `$page` store is reactive to all client-side navigation events.
- The URL scheme table will be the single source of truth for all surface routes.

## Scope

**In scope:**

- Review `active-project.svelte.ts` and update to derive `projectId` reactively from `$page.params.id`
- Document the canonical URL scheme in the appropriate docs file
- Verify sidebar active state is correct for all surfaces after the routing update

**Out of scope:**

- Creating the actual surface route files (done in Stages 002–005)
- Changing any route paths — this part only handles state and documentation

## Implementation Steps

1. Open `src/lib/stores/active-project.svelte.ts`. Inspect the current implementation.

2. Update the store to use reactive URL derivation:

   ```ts
   // src/lib/stores/active-project.svelte.ts
   import { page } from '$app/stores';
   import { derived } from 'svelte/store';

   export const activeProjectId = derived(page, ($page) => $page.params.id ?? null);
   ```

   If the store uses Svelte 5 runes pattern instead of `derived`, adapt accordingly:

   ```ts
   // rune-based: read $page.params.id reactively inside components
   // Export a helper that reads from $page directly
   ```

   Choose the approach consistent with the rest of the codebase (check other stores for pattern).

3. If any `+layout.ts` load function currently calls a setter to update the active project store, check whether that setter is still needed. Remove it if the reactive derivation makes it redundant.

4. Add the canonical URL routing scheme table to `dev-docs/context-docs/frontend.md` (or create it if it doesn't exist):

   | Surface | URL Pattern | Active Project Required |
   | --- | --- | --- |
   | Home | `/` | No |
   | Hub | `/projects/[id]/hub` | Yes |
   | Workspace | `/projects/[id]/workspace` | Yes |
   | Editor | `/projects/[id]/editor/[sceneId]` | Yes |
   | World Building | `/projects/[id]/world-building` | Yes |
   | Continuity | `/projects/[id]/continuity` | Yes |
   | Outline (future) | `/projects/[id]/outline` | Yes |
   | Nova (future) | `/nova` | No |
   | Images (future) | `/images` | No |
   | Styles (future) | `/styles` | No |

## Files

**Update:**

- `src/lib/stores/active-project.svelte.ts` — reactive projectId derivation
- `dev-docs/context-docs/frontend.md` — add URL scheme table (create file if absent)

## Acceptance Criteria

- [ ] `activeProjectId` is derived from `$page.params.id` reactively (no manual setter required on navigation)
- [ ] Navigating between project routes updates `activeProjectId` without page reload
- [ ] Navigating to Home (non-project route) sets `activeProjectId` to `null`
- [ ] URL scheme table documented in context docs
- [ ] `pnpm run check` exits clean

## Edge Cases

- If the store is used in many components via a named import, changing the shape of the export is a breaking change — preserve the same export name (`activeProjectId` or equivalent) and update the internal implementation only

## Notes

- If `active-project.svelte.ts` is a Svelte 5 rune-based module (uses `$state` at module level), derivation from `$page` must happen at the call site via `$derived($page.params.id)` rather than in the module — determine this from the current file before writing
- The goal of this part is correctness, not a full store refactor; keep the change minimal
