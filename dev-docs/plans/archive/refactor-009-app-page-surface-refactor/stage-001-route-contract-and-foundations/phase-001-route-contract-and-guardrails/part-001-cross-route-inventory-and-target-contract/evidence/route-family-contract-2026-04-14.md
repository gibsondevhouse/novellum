# Route-Family Contract

**Date:** 2026-04-14
**Part:** S1P1 — Cross-Route Inventory and Target Contract

---

## Route-Family Inventory

### Family 1: Library & Reader (Read-Only)

| Route | Intent | Loader Source | Shell |
| --- | --- | --- | --- |
| `/` | Landing — literary library, read-only shelf | Client store (`project-hub.svelte.ts` via `onMount`) | Root shell (sidebar + main) |
| `/books` | Workspace shelf — project list with "New Project" CTA | Client store (`project-hub.svelte.ts` via `onMount`) | Root shell |
| `/books/[id]` | Reader — read-only book view (chapters + scenes) | Repository (`project-repository`, `chapter-repository`, `scene-repository`) | Root shell |
| `/stories` | Placeholder — coming-soon surface | None (static) | Root shell |

**Family Contract:**

- Read-only routes must never expose project-edit controls (delete, rename, export)
- `/` and `/books` share identical data loading patterns; empty states must be parity-consistent
- `/books/[id]` is a reader surface — no sidebar active-project context
- All routes use root shell (AppSidebar + main content)
- Navigation: Home active on `/` and `/books/[id]`; Books active on `/books` only

### Family 2: Project Core (Workspace)

| Route | Intent | Loader Source | Shell |
| --- | --- | --- | --- |
| `/projects/[id]` | Redirect → `/projects/[id]/hub` | Redirect (no data) | — |
| `/projects/[id]/hub` | Project dashboard — overview, word count, stats | **Dexie direct** ⚠️ | Project shell |
| `/projects/[id]/workspace` | Structure workspace — arcs, acts, chapters, scenes | Repository via `workspace-data-service` | Project shell |
| `/projects/[id]/outline` | Outline view — structural planning | Repository via `workspace-data-service` | Project shell |
| `/projects/[id]/editor` | Scene list — pick scene to edit | **Dexie direct** ⚠️ | Project shell |
| `/projects/[id]/editor/[sceneId]` | Scene editor — TipTap writing surface | Repository (`scene-repository`, `chapter-repository`) | Project shell |
| `/projects/[id]/continuity` | Continuity checker — AI analysis | Params only | Project shell |
| `/projects/[id]/consistency` | Redirect → `/projects/[id]/continuity` | Redirect | — |
| `/projects/[id]/arcs` | Arc list | None (inline) | Project shell |
| `/projects/[id]/arcs/[arcId]` | Arc detail | None (inline) | Project shell |

**Family Contract:**

- All routes share project shell (`+layout.svelte` provides `project` context)
- Sidebar shows ActiveProjectSection with mode links (Hub, Outline, Editor, Workspace, World Building, Continuity)
- Active-state must highlight the correct mode link on all deep routes (e.g., `/editor/[sceneId]` → Editor active)
- Loaders must use `/api/db/*` path through repositories — **hub and editor loaders violate this** and must be migrated
- Mode transitions use view transitions with reduced-motion safety
- Project-level modals (edit, delete, export) are layout-level and persist across mode switches

### Family 3: World Building (Knowledge)

| Route | Intent | Loader Source | Shell |
| --- | --- | --- | --- |
| `/projects/[id]/world-building` | WB hub — entry point for knowledge system | Params only | Project shell |
| `/projects/[id]/world-building/characters` | Character list | Repository (`character-repository`) | Project shell |
| `/projects/[id]/world-building/characters/[charId]` | Character detail with relationships | Repository (`character-repository`) | Project shell |
| `/projects/[id]/world-building/locations` | Location list | Repository (`location-repository`) | Project shell |
| `/projects/[id]/world-building/lore` | Lore entry list | Repository (`lore-entry-repository`) | Project shell |
| `/projects/[id]/world-building/plot-threads` | Plot thread list | **Mixed: repository + Dexie** ⚠️ | Project shell |
| `/projects/[id]/world-building/timeline` | Timeline events + characters | Repository (`timeline-event-repository`, `character-repository`) | Project shell |

**Bible Redirect Family** (all redirect to world-building equivalents):
- `/projects/[id]/bible` → `/projects/[id]/world-building`
- `/projects/[id]/bible/characters` → `/projects/[id]/world-building/characters`
- `/projects/[id]/bible/characters/[charId]` → `/projects/[id]/world-building/characters/[charId]`
- `/projects/[id]/bible/locations` → `/projects/[id]/world-building/locations`
- `/projects/[id]/bible/lore` → `/projects/[id]/world-building/lore`
- `/projects/[id]/bible/plot-threads` → `/projects/[id]/world-building/plot-threads`
- `/projects/[id]/bible/timeline` → `/projects/[id]/world-building/timeline`

**Family Contract:**

- All world-building routes use project shell (inherit project from layout)
- List/detail pattern: list pages show entities, detail pages show entity + relationships
- Deep links must resolve correctly without stale state
- plot-threads loader must be migrated away from `db.scenes.where()` Dexie call
- Bible routes are purely redirect stubs — no rendering, no loader logic

### Family 4: Utility & System

| Route | Intent | Loader Source | Shell |
| --- | --- | --- | --- |
| `/nova` | AI assistant — coming-soon or active | `ssr=false` | Root shell |
| `/images` | Image management | `ssr=false` | Root shell |
| `/styles` | Design system / token explorer | `ssr=false` | Root shell |
| `/settings` | App settings | None | Root shell |
| `/settings/migrate` | Migration tool | None | Root shell |

**Family Contract:**

- Utility routes use root shell only (no project context)
- Not in scope for this refactor (no structural changes needed)

---

## Dexie Violations Summary

| Route | Violation | Fix Required |
| --- | --- | --- |
| `/projects/[id]/hub/+page.ts` | `db.scenes.where('projectId')` | Replace with `getScenesByProjectId()` from scene-repository |
| `/projects/[id]/editor/+page.ts` | `db.scenes.where('projectId').sortBy('order')` | Replace with `getScenesByProjectId()` from scene-repository |
| `/projects/[id]/world-building/plot-threads/+page.ts` | `db.scenes.where('projectId')` | Replace with `getScenesByProjectId()` from scene-repository |

---

## Active-State Parity Requirements

| Sidebar Item | Active When |
| --- | --- |
| Home | `pathname === '/'` OR reader route (`/books/[id]`) |
| Nova | `/nova` |
| Images | `/images` or `/images/**` |
| Styles | `/styles` |
| Books | `/books` exactly |
| Stories | `/stories` (currently no active state — needs adding) |
| Settings | `/settings` or `/settings/**` |
| ActiveProjectSection | Any `/projects/[id]/**` route (mode-specific sub-items) |

**Gap:** Stories has no `active` prop passed in AppSidebar — should be added for parity.

---

## Regression Risks

1. **Hub word count**: Currently computed from Dexie `db.scenes` — migrating to repository must preserve the same data shape
2. **Editor scene list sorting**: Dexie's `.sortBy('order')` — repository must return sorted or caller must sort
3. **Plot-threads scene data**: Used inline for thread-scene relationships — repository equivalent must return same shape
4. **Home page store pattern**: Uses client-side store instead of loader — not a violation but inconsistent with other library routes
