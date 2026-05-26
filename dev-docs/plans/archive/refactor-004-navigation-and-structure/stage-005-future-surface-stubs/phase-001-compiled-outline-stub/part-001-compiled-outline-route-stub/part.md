---
title: Compiled Outline Route Stub
slug: part-001-compiled-outline-route-stub
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-compiled-outline-stub
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Claim the `/projects/[id]/outline` route (freed by the Workspace rename in Stage 002) as the future compiled structural output surface. Replace the Stage 002 redirect with a real stub page. The route must be registered in the sidebar as a locked/coming-soon item.

## Context

- In Stage 002, `src/routes/projects/[id]/outline/+page.ts` was replaced with a redirect to `/workspace`; `+page.svelte` was left as an empty shell
- Now that the plan is reaching its end, the `/outline` route must stand on its own: a stub page communicating what this surface will become
- `ActiveProjectSection` already renders Outline with `locked={true}` — this is correct and does not change
- The compiled Outline is a future feature: it reads the act/chapter/scene hierarchy from Workspace and assembles a readable structural output. No implementation here.

## Scope

**In scope:**

- Replace Stage 002's redirect in `outline/+page.ts` with a real load function
- Replace the empty `outline/+page.svelte` with a proper "Coming soon" stub page

**Out of scope:**

- Implementing the compiled Outline (data assembly, rendering, export)
- Any changes to Workspace data structures

## Implementation Steps

1. Remove the redirect from `src/routes/projects/[id]/outline/+page.ts`:

   ```ts
   // src/routes/projects/[id]/outline/+page.ts
   export const ssr = false;
   ```

   (Minimal CSR-only load; no redirect, no data loading needed for the stub)

2. Replace `src/routes/projects/[id]/outline/+page.svelte` with:

   ```html
   <script lang="ts">
     // No props or data needed for the stub
   </script>

   <div class="surface-stub">
     <div class="surface-stub__icon">&#9776;</div>
     <h1 class="surface-stub__title">Outline</h1>
     <p class="surface-stub__description">
       Compiled structural output — acts, chapters, and scenes assembled from your Workspace into a
       readable manuscript outline. Reviews arc structure, pacing, and chapter sequencing at a glance.
     </p>
     <span class="surface-stub__badge">Coming soon</span>
   </div>

   <style>
     .surface-stub {
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       min-height: 60vh;
       text-align: center;
       gap: var(--space-4);
       padding: var(--space-12);
       color: var(--color-text-primary);
     }
     .surface-stub__icon { font-size: var(--text-4xl); opacity: 0.3; }
     .surface-stub__title { font-family: var(--font-display); font-size: var(--text-3xl); margin: 0; }
     .surface-stub__description {
       font-size: var(--text-sm);
       color: var(--color-text-muted);
       max-width: 400px;
       line-height: var(--leading-relaxed);
       margin: 0;
     }
     .surface-stub__badge {
       font-size: var(--text-xs);
       padding: var(--space-1) var(--space-3);
       background: var(--color-surface-overlay);
       border-radius: var(--radius-full);
       color: var(--color-text-muted);
     }
   </style>
   ```

3. Verify `ActiveProjectSection` Outline item still has `locked={true}` — no change needed

## Files

**Update:**

- `src/routes/projects/[id]/outline/+page.ts` — remove redirect; CSR-only export
- `src/routes/projects/[id]/outline/+page.svelte` — replace with stub page

## Acceptance Criteria

- [ ] `/projects/[id]/outline` renders the Outline stub page (no redirect)
- [ ] Stub page clearly describes the surface purpose: "compiled structural output from Workspace"
- [ ] Outline sidebar item remains locked (`locked={true}` in `ActiveProjectSection`) — non-interactive
- [ ] Page uses design token CSS properties only — no hardcoded values
- [ ] `pnpm run check` exits clean

## Edge Cases

- If any bookmarked URL was pointing to `/outline` and previously redirected to `/workspace`, it will now show the stub page — this is the correct behavior from Stage 005 onward

## Notes

- The `surface-stub` CSS class pattern can be reused for the Nova, Images, and Styles stub pages in Part 001 of Phase 002
- The Outline sidebar item is intentionally non-interactive — clicking it does nothing. This communicates "future surface" clearly.
