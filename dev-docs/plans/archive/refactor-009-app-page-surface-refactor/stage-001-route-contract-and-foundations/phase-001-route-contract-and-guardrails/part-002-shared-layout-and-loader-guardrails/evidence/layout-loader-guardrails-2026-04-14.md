# Layout and Loader Guardrails

**Date:** 2026-04-14
**Part:** S1P2 — Shared Layout and Loader Guardrails

---

## Shell Composition Contract

### Root Shell (all routes)

```
┌──────────────────────────────────────────────┐
│ AppSidebar (sticky left) │ main-content      │
│  ┌──────────┐            │  ┌──────────────┐ │
│  │ Toggle    │            │  │ {children}   │ │
│  │ Section 1 │            │  │              │ │
│  │  - Home   │            │  │              │ │
│  │  - Nova   │            │  │              │ │
│  │  - Images │            │  │              │ │
│  │  - Styles │            │  │              │ │
│  │ PROJECTS  │            │  │              │ │
│  │  - Books  │            │  │              │ │
│  │  - Stories│            │  │              │ │
│  │ RECENT    │            │  │              │ │
│  │ [Active]  │            │  │              │ │
│  │ Settings  │            │  └──────────────┘ │
│  └──────────┘            │                    │
└──────────────────────────────────────────────┘
```

- Sidebar: collapsible (64px collapsed, `--sidebar-width` expanded)
- Main content: `flex: 1`, `overflow-y: auto`, `height: 100vh`
- Skip-to-main link for accessibility
- View transitions on route navigation
- OnboardingModal + ToastContainer at root level

### Project Shell (nested inside root shell)

```
┌─────────────────────────────────┐
│ project-shell (flex column)     │
│  ┌───────────────────────────┐  │
│  │ edit-panel (conditional)  │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ mode-content (flex: 1)    │  │
│  │  {@render children()}     │  │
│  │  (view-transition-name)   │  │
│  └───────────────────────────┘  │
│  [delete dialog - modal]        │
│  [export modal - modal]         │
└─────────────────────────────────┘
```

- Provides `project` data via layout loader (`fetch /api/db/projects/:id`)
- Exposes `projectActions` context (openEdit, openDelete, openExport)
- Modals are layout-level — persist across mode switches
- Mode content transitions: fade-out 100ms, fade-in 180ms (reduced-motion safe)
- `initCurrentProject()` called on mount to sync sidebar ActiveProjectSection

---

## Loader-Source Policy

### APPROVED Patterns

| Pattern | Example | When to Use |
| --- | --- | --- |
| **Repository via api-client** | `getScenesByProjectId(id)` | All entity data loads |
| **Layout fetch** | `fetch('/api/db/projects/:id')` | Layout-level context |
| **Params passthrough** | `({ params }) => ({ projectId: params.id })` | When page only needs IDs |
| **Redirect** | `redirect(307, ...)` | Route aliases (bible→world-building) |
| **Service aggregator** | `getWorkspaceData(id)` | Composite data (uses repositories internally) |

### FORBIDDEN Patterns

| Pattern | Example | Why Forbidden |
| --- | --- | --- |
| **Direct Dexie in loader** | `db.scenes.where('projectId')` | Bypasses API layer; breaks data source consistency |
| **Direct Dexie in page component** | `import { db } from '$lib/db'` in `+page.svelte` | Same violation in render path |
| **Client store as sole loader** | `onMount(() => loadProjects())` with empty `load()` | Data fetched outside SvelteKit lifecycle |

### EXCEPTION

| Pattern | File | Reason |
| --- | --- | --- |
| `db.open()` | `src/routes/+layout.svelte` | Database initialization — not a data query |
| `import type` from db | Layout type imports | Type-only — no runtime Dexie access |

---

## Violations Requiring Fix (Stage 002)

| File | Current | Target |
| --- | --- | --- |
| `projects/[id]/hub/+page.ts` | `db.scenes.where('projectId').equals(project.id).toArray()` | `getScenesByProjectId(project.id)` via scene-repository |
| `projects/[id]/editor/+page.ts` | `db.scenes.where('projectId').equals(params.id).sortBy('order')` | `getScenesByProjectId(params.id)` (returns sorted by order) |
| `projects/[id]/world-building/plot-threads/+page.ts` | `db.scenes.where('projectId').equals(params.id).toArray()` | `getScenesByProjectId(params.id)` via scene-repository |

**Note:** `getScenesByProjectId` from scene-repository already exists and uses `apiGet`. Verify it returns sorted by `order` to maintain editor behavior.

---

## Navigation and Active-State Guardrails

### Sidebar Active-State Rules

1. **Exactly one** top-level nav item may be active at a time
2. Active state is derived from `page.url.pathname` — never from component state
3. Stories item must have `active` prop wired (currently missing)
4. Project deep routes → ActiveProjectSection handles sub-item highlighting
5. Reader route (`/books/[id]`) → Home is active (reader is part of library family)

### Project Mode Active-State Rules

1. ActiveProjectSection must highlight the correct mode for all deep routes
2. `/editor/[sceneId]` → Editor must be active
3. `/arcs/[arcId]` → Arcs must be active (or Workspace, depending on sidebar design)
4. `/world-building/**` → World Building must be active
5. Mode switching must preserve project context (no re-fetch of project data)

---

## Svelte 5 and Boundary Requirements

### Mandatory for All Page Refactors

- `$state`, `$derived`, `$effect`, `$props()` — no legacy patterns
- `{#snippet}` / `{@render}` — no `<slot />`
- `onclick={...}` — no `on:click`
- No `export let` in any modified file

### Boundary Rules

- Route pages import from module public APIs only (`$modules/*/index.ts` or `$modules/*/services/*`)
- No cross-module internal component imports
- Shared UI primitives come from `$lib/components/ui/`
- `eslint-plugin-boundaries` must pass after every change

---

## Quality Gate Checklist (applies to every Stage 002 part)

```bash
pnpm run lint      # includes eslint-plugin-boundaries
pnpm run check     # svelte-check TypeScript
pnpm run test      # Vitest full suite
```

All three must exit 0 before any part transitions to `review`.
