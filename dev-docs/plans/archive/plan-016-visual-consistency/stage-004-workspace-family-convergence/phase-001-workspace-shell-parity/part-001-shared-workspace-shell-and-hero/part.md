---
title: Shared Workspace Shell & Hero
slug: part-001-shared-workspace-shell-and-hero
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-workspace-shell-parity
started_at: 2026-04-25 00:15 EDT
completed_at: 2026-04-25 18:45 EDT
estimated_duration: 1.5d
---

## Objective

Promote a canonical `WorkspaceShell` and canonical workspace `Hero` and migrate the three shipped workspace surfaces (outline planning workspace, arcs overview placeholder, arcs detail placeholder) onto them. Preserve the Scene editing surface as out-of-scope (Stage 006).

Scope is grounded in [evidence/workspace-family-inventory-2026-04-24.md](../../evidence/workspace-family-inventory-2026-04-24.md).

## Scope

**In scope:**

- Create `src/lib/components/ui/WorkspaceShell.svelte` as a layout primitive with optional sidebar + main regions and height-contained scroll behavior aligned with the existing `.outline-workspace` rhythm.
- Create `src/lib/components/ui/WorkspaceHero.svelte` as a hero primitive wrapping `PageHeader` with an optional `metrics` snippet and a scope-specific `actions` snippet.
- Export both primitives from `src/lib/components/ui/index.ts`.
- Migrate `src/routes/projects/[id]/outline/+page.svelte` onto `WorkspaceShell` + `WorkspaceHero`, replacing `.outline-shell`, `.outline-workspace`, and `.storyboard-metrics` local markup.
- Migrate `src/routes/projects/[id]/arcs/+page.svelte` and `src/routes/projects/[id]/arcs/[arcId]/+page.svelte` onto `WorkspaceShell` + `WorkspaceHero` while keeping their placeholder copy intact.

**Out of scope:**

- Inspector / clarity panel refactors (Phase 002).
- Selection / create / edit interaction parity (Phase 003).
- Scene editor writing surface at `editor/[sceneId]` (Stage 006).
- Hierarchy data flow changes (owned by plan-013).

## Implementation Steps

1. Add `WorkspaceShell` and `WorkspaceHero` under `src/lib/components/ui/` with minimal prop surfaces and scoped tokens.
2. Export both primitives from `src/lib/components/ui/index.ts`.
3. Migrate `outline/+page.svelte` first; preserve sidebar/main split and metrics content.
4. Migrate `arcs/+page.svelte`, then `arcs/[arcId]/+page.svelte`.
5. Run lint, svelte-check, token enforcement, and targeted tests after each migration.
6. Capture before/after evidence screenshots for the outline workspace.

## Files

**Create:**

- `src/lib/components/ui/WorkspaceShell.svelte`
- `src/lib/components/ui/WorkspaceHero.svelte`

**Update:**

- `src/lib/components/ui/index.ts`
- `src/routes/projects/[id]/outline/+page.svelte`
- `src/routes/projects/[id]/arcs/+page.svelte`
- `src/routes/projects/[id]/arcs/[arcId]/+page.svelte`

## Acceptance Criteria

- [x] `WorkspaceShell` and `WorkspaceHero` exist and are exported from `src/lib/components/ui/index.ts`.
- [x] All three listed routes render via `WorkspaceShell` + `WorkspaceHero`; no workspace-level shell/hero CSS remains in those routes.
- [x] Hero surface is identical across routes except for scope-specific title, description, and metrics content.
- [x] Gates pass: `pnpm exec eslint` on touched files, `pnpm run check`, `pnpm run check:tokens`.

## Edge Cases

- If plan-013 lands a hierarchy-context display in the outline hero, render it through the hero's `meta` snippet rather than adding bespoke markup.
- Arc placeholder routes must keep their "coming soon" messaging; only the shell and hero markup converge.

## Notes

- Preserve workspace scope context — only presentation converges.
- Keep `WorkspaceHero` a thin composition over `PageHeader`; do not duplicate header typography tokens.
