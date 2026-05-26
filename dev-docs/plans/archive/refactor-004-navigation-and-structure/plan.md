---
title: Navigation & Product Structure Refactor
slug: refactor-004-navigation-and-structure
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-13
last_updated: 2026-04-13
target_completion: 2026-04-25
stages:
  - stage-001-sidebar-foundation-and-routing
  - stage-002-hub-and-workspace-alignment
  - stage-003-editor-alignment
  - stage-004-world-building-and-continuity-scaffolding
  - stage-005-future-surface-stubs
dependencies:
  - refactor-003-hub-story-identity
  - refactor-002-story-planning-workspace
quality_gates:
  - lint
  - typecheck
  - tests
---

## Objective

Replace the current tab-based horizontal navigation model with a sidebar-driven product architecture. This refactor introduces a unified `AppSidebar` with section-grouped, context-aware navigation that replaces the project layout header and `ProjectModeSwitcher`. It renames and repositions key surfaces (Outline → Workspace, Bible → World Building, Consistency → Continuity) to reflect their expanded roles, scaffolds future surfaces (Outline compiled, Nova, Images, Styles), and establishes the canonical product surface model that all future features build on.

This is not a sidebar refactor — it is a **product structure refactor**. It determines how users orient within Novellum, how surfaces relate to each other, and how every future module integrates.

---

## Product Architecture

The canonical surface model defined by this refactor:

| Surface | Role | Route | State |
| --- | --- | --- | --- |
| Home | Project library — Netflix-style display of all works | `/` | Active |
| Hub | Story identity + structural metrics overview | `/projects/[id]/hub` | Active |
| Workspace | Full story planning surface (acts, chapters, scenes, beats) | `/projects/[id]/workspace` | Active (renamed from Outline) |
| Editor | Manuscript writing surface (scene-based drafting) | `/projects/[id]/editor/[sceneId]` | Active |
| World Building | Structured entity and lore management | `/projects/[id]/world-building` | Scaffold |
| Continuity | Consistency validation + writing styles + prompts | `/projects/[id]/continuity` | Scaffold |
| Outline | Compiled structural read-out derived from Workspace | `/projects/[id]/outline` | Stub (future) |
| Nova | AI agent surface | `/nova` | Stub (future) |
| Images | Asset manager for covers and portraits | `/images` | Stub (future) |
| Styles | Templates, system prompts, negative prompts | `/styles` | Stub (future) |

---

## Navigation Taxonomy

### GLOBAL *(top section, no label, not collapsible)*

- **Home** — `/` — project library
- **Nova** — `/nova` — AI agent *(future, locked)*
- **Images** — `/images` — asset manager *(future, locked)*
- **Styles** — `/styles` — templates + prompts *(future, locked)*

### PROJECTS

- **Books** — `/projects` or `/` — all active projects *(primary project type)*
- **Stories** — *(future, locked)*

### ACTIVE PROJECT *(dynamic, rendered only when a project route is active)*

- **Hub** — `/projects/[id]/hub`
- **Workspace** — `/projects/[id]/workspace`
- **World Building** — `/projects/[id]/world-building`
- **Continuity** — `/projects/[id]/continuity`
- **Outline** — `/projects/[id]/outline` *(future, locked)*

### RECENT *(future, stub)*

- Recent AI chat sessions

---

## Data Flow Between Surfaces

| Source | Destination | Data |
| --- | --- | --- |
| Workspace | Editor | Scene definition (id, title, act) handed off as the drafting target; clicking a scene in Workspace navigates to `/editor/[sceneId]` |
| Workspace | Outline (future) | Compiled structural hierarchy — acts → chapters → scenes assembled into read-only manuscript outline |
| Hub | All surfaces | Entry point and overview; metric counts are pulled from all surfaces (chapters, scenes, act counts) |
| Continuity | Workspace + Editor | Consistency constraints and writing style rules applied as validation |
| World Building | Workspace + Editor | Entity reference data (character names, locations, lore) surfaced as context |

---

## Component Architecture

| Component | File | Purpose |
| --- | --- | --- |
| `AppSidebar` | `src/lib/components/AppSidebar.svelte` | Root sidebar shell — section grouping, project context detection, GLOBAL + PROJECTS + ACTIVE PROJECT + RECENT sections |
| `SidebarSection` | `src/lib/components/SidebarSection.svelte` | Labeled or unlabeled section container with optional collapse affordance |
| `SidebarItem` | `src/lib/components/SidebarItem.svelte` | Individual nav item — icon, label, active state, locked/coming-soon state |
| `ActiveProjectSection` | `src/lib/components/ActiveProjectSection.svelte` | Dynamic section — reads projectId from `$page.params.id`, renders project-specific nav items |

---

## UX Principles

- **Sidebar = navigation + orientation.** The sidebar tells you where you are and where you can go. It does not contain tool actions or in-surface controls.
- **Hub = identity + overview.** The first screen for any project — story cover, title, logline, metrics, and progress. Entry point to all other surfaces.
- **Workspace = planning.** Where acts, chapters, scenes, and beats are structured. The source of truth for story architecture.
- **Editor = writing.** Where prose is drafted, scene by scene. Scene navigation lives inside the Editor surface — not in the sidebar.
- **World Building + Continuity = support systems.** They constrain and inform the creative loop; they are not the primary writing surfaces.
- **No surface should try to do everything.** Surface boundaries are hard limits. Cross-surface concerns surface through data flow, not UI leakage.

---

## Scope

**In scope:**

- `AppSidebar`, `SidebarSection`, `SidebarItem`, `ActiveProjectSection` component creation
- Root layout sidebar swap (`<Sidebar />` → `<AppSidebar />`)
- Project layout header removal (`.project-header` + `ProjectModeSwitcher`)
- Utility action migration (export, edit, delete from header → Hub surface toolbar)
- Hub route: `/projects/[id]/` → `/projects/[id]/hub` with redirect from old route
- Outline → Workspace rename at route + module levels; redirect from old URL
- World Building surface scaffold (route + module shell, entity sub-routes)
- Continuity surface scaffold (route + module shell; `/consistency` → `/continuity` redirect)
- Stub pages for compiled Outline, Nova, Images, Styles
- RECENT sidebar section stub
- Locked sidebar items for all future surfaces

**Out of scope:**

- Nova AI agent implementation
- Images asset manager implementation
- Styles template system implementation
- Workspace feature additions beyond rename and route update
- Hub feature additions beyond route alignment
- World Building entity form redesign
- Database schema changes

---

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Sidebar Foundation, Header Removal & Routing](stage-001-sidebar-foundation-and-routing/stage.md) | `draft` | 3d |
| 002 | [Hub & Workspace Alignment](stage-002-hub-and-workspace-alignment/stage.md) | `draft` | 2d |
| 003 | [Editor Alignment](stage-003-editor-alignment/stage.md) | `draft` | 1.5d |
| 004 | [World Building & Continuity Scaffolding](stage-004-world-building-and-continuity-scaffolding/stage.md) | `draft` | 2d |
| 005 | [Future Surface Stubs](stage-005-future-surface-stubs/stage.md) | `draft` | 1d |

---

## Quality Gates

All stages must pass the following gates before this plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` zero errors
- [ ] **typecheck** — `pnpm run check` zero errors
- [ ] **visual** — sidebar renders correctly across all active surfaces in a browser; active state per route is correct
- [ ] **routing** — all renamed routes resolve; all old route URLs redirect correctly; no dead links
- [ ] **docs_sync** — `novellum-docs/docs/architecture.md` updated to reflect new surface model; relevant module docs updated

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Route rename (Outline → Workspace) breaks existing links in components | high | Add SvelteKit `redirect()` from old route; grep codebase for `/outline` hardcoded references |
| Consistency → Continuity module rename breaks existing imports | high | Create proxy `src/modules/continuity/index.ts` that re-exports from `src/modules/consistency/` initially |
| `active-project.svelte.ts` store not updated reactively on sidebar navigation | medium | Subscribe to SvelteKit's `$page` store; derive `projectId` from `$page.params.id` |
| `ProjectModeSwitcher` removal leaves deep sub-routes unreachable | medium | All surfaces are reachable via sidebar Active Project section; verify each route on completion |
| Sidebar width (220px) conflicts with narrow content at tablet (768px) | low | Sidebar overlays or collapses at `≤768px`; add breakpoint handling in `AppSidebar.svelte` |
| Bible and Consistency modules left as dead code | medium | Bible and Consistency modules are not deleted — they are re-exported under World Building and Continuity; full rename is a future task |

---

## Notes

- The existing `Sidebar.svelte` in `src/lib/components/` is replaced entirely by `AppSidebar.svelte`. Create `AppSidebar.svelte` alongside it; do not modify `Sidebar.svelte`. Swap in root layout, verify, then delete `Sidebar.svelte`.
- `ProjectModeSwitcher.svelte` is deleted outright in Stage 001 — it is not adapted or extended.
- The route rename Outline → Workspace frees `/projects/[id]/outline` for Stage 005's compiled output surface. This is intentional.
- All new components must use CSS custom properties from `tokens.css` exclusively — no hardcoded colour or spacing values.
- All new Svelte files must use Svelte 5 runes (`$state`, `$derived`, `$effect`) — no legacy `writable` stores in new files.
- `eslint-plugin-boundaries` is enforced. All new module public APIs must be exported via `index.ts` barrel files.
- Page-level Svelte files must remain ≤150 lines. Service files must remain ≤300 lines.
