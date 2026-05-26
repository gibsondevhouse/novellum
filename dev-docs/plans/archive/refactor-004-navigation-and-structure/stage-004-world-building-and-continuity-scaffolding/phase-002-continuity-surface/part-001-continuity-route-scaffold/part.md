---
title: Continuity Route Scaffold
slug: part-001-continuity-route-scaffold
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-continuity-surface
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create the `/projects/[id]/continuity` route. Redirect the old `/consistency` route to `/continuity`. Create `src/modules/continuity/index.ts` as a proxy barrel for the Consistency module. Render the existing `ConsistencyPanel` content on the new Continuity page.

## Context

- Consistency surface currently lives at `src/routes/projects/[id]/consistency/+page.svelte`
- `src/modules/consistency/` contains `ConsistencyPanel.svelte`, `IssueGroup.svelte`, `IssueRow.svelte`
- The Continuity surface is a superset of Consistency — it will eventually include Writing Styles and Prompts; for now it renders the existing consistency issues content
- `ActiveProjectSection` has a Continuity item at `href="{base}/continuity"` (Stage 001 Phase 001)

## Scope

**In scope:**

- Create `src/routes/projects/[id]/continuity/+page.svelte` — renders consistency issues via ConsistencyPanel
- Create `src/routes/projects/[id]/continuity/+page.ts` — load project data (same as consistency)
- Add redirect from `src/routes/projects/[id]/consistency/+page.ts`
- Create `src/modules/continuity/index.ts` as proxy barrel

**Out of scope:**

- Writing Styles and Prompts stubs — Part 002 of this phase
- `src/modules/consistency/` rename

## Implementation Steps

1. Create `src/modules/continuity/index.ts`:

   ```ts
   // src/modules/continuity/index.ts
   // Proxy barrel — re-exports all public API from the consistency module.
   // Continuity is the product name for the consistency + styles + prompts surface.
   export * from '../consistency/index.ts';
   ```

   Verify `src/modules/consistency/index.ts` exists. If not, create it exporting all components from `src/modules/consistency/components/`.

2. Create `src/routes/projects/[id]/continuity/+page.svelte`:
   - Import `ConsistencyPanel` from `src/modules/continuity`
   - Heading: "Continuity"
   - Render `<ConsistencyPanel projectId={data.projectId} />` (or equivalent based on existing consistency page)
   - Page must be ≤150 lines

3. Create `src/routes/projects/[id]/continuity/+page.ts`:
   - Copy load function from `consistency/+page.ts`

4. Update `src/routes/projects/[id]/consistency/+page.ts`:
   - Replace load function with redirect: throw `redirect(307, '/projects/:id/continuity')` where `:id` is `params.id`

5. Ensure `consistency/+page.svelte` is kept as a minimal empty shell (SvelteKit requires a `+page.svelte` even when load function redirects)

## Files

**Create:**

- `src/modules/continuity/index.ts`
- `src/routes/projects/[id]/continuity/+page.svelte`
- `src/routes/projects/[id]/continuity/+page.ts`

**Update:**

- `src/routes/projects/[id]/consistency/+page.ts` — add redirect to `/continuity`
- `src/routes/projects/[id]/consistency/+page.svelte` — empty shell

## Acceptance Criteria

- [ ] `src/modules/continuity/index.ts` exists and proxies Consistency module API
- [ ] `/projects/[id]/continuity` renders consistency issues panel
- [ ] `/projects/[id]/consistency` redirects to `/projects/[id]/continuity`
- [ ] Continuity sidebar item shows active state on `/continuity` route
- [ ] `pnpm run check` exits clean

## Edge Cases

- If `ConsistencyPanel` requires specific context that was previously set in the Consistency layout, ensure that context is available in the Continuity page
- Preserve the `ConsistencyPanel`'s live issue count badge behavior (if it was synced to a store used by the ProjectModeSwitcher tab badge, that badge is now gone — the count display is internal to the panel)

## Notes

- The live issue count that previously appeared as a badge on the `ProjectModeSwitcher` "Consistency" tab no longer has an obvious display home. This is acceptable — the badge was a feature of the removed tab bar, not of the surface itself. The ConsistencyPanel shows its own counts internally.
