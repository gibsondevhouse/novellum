---
title: Restore Projects Sidebar Nav & Page Layout
slug: plan-011-restore-projects-sidebar-nav
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-04-16
last_updated: 2026-04-16
target_completion: 2026-04-16
stages:
  - stage-001-sidebar-projects-link
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
---

## Objective

> Restore two reverted UI changes: (1) add "Projects" as a top-level sidebar navigation item linking to `/projects`, and (2) swap the column order on the `/projects` page so **Stories appear on the left** and **Books appear on the right**.

## Context

These changes were previously implemented but lost during a refactor commit (`0b0d480`). The `/projects/+page.svelte` was recreated with the correct two-column layout but the column order was reversed, and the sidebar was never updated to include a direct "Projects" link — it only has "Books" and "Stories" as sub-items under a collapsible "PROJECTS" section header.

## Scope

**In scope:**

- Add a "Projects" `SidebarItem` to the primary nav section of `AppSidebar.svelte`, linking to `/projects`.
- Swap the column order in `src/routes/projects/+page.svelte` so Stories are on the left and Books are on the right.
- Add `isProjectsActive` derived state to highlight the sidebar item when on `/projects`.

**Out of scope:**

- Removing the existing "Books" / "Stories" sub-items in the collapsible PROJECTS section (they can coexist).
- Changes to the home page (`/+page.svelte`) layout.
- New components or data model changes.

## Stages

| #   | Stage                                                                  | Status  | Est. Duration |
| --- | ---------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Sidebar & Page Layout](stage-001-sidebar-projects-link/stage.md)      | `draft` | 0.5d          |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` passes with zero `eslint-plugin-boundaries` violations
- [ ] **typecheck** — `pnpm run check` passes with zero type errors
- [ ] **tests** — `pnpm run test` passes
- [ ] **visual** — `/projects` page renders Stories left, Books right; sidebar shows "Projects" link

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Sidebar icon inconsistency | Use an existing project/folder icon consistent with the design system |
| Route conflict with existing `/projects/[id]` | `/projects` is a static route and takes priority over dynamic params |

## Files to Modify

| File | Change |
| --- | --- |
| `src/lib/components/AppSidebar.svelte` | Add `isProjectsActive` derived; add "Projects" `SidebarItem` to primary nav |
| `src/routes/projects/+page.svelte` | Swap Books and Stories column order in the template |
