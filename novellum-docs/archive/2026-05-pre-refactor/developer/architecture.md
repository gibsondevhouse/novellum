# Architecture Overview

This document provides a high-level overview of the Novellum codebase for contributors and agents. For deeper detail on each topic, follow the links to the authoritative source documents in `dev-docs/`.

---

## Tech Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| UI framework | SvelteKit 2 + Svelte 5 Runes | SvelteKit 2.x, Svelte 5.x |
| Build tool | Vite | Bundled with SvelteKit |
| Language | TypeScript (strict) | 5.x |
| Primary data layer | SQLite via `better-sqlite3` | 9.x |
| Portability layer | Dexie (IndexedDB) | restricted — see below |
| Desktop shell | Tauri v2 | 2.x |
| Rich text editor | TipTap 2 | 2.x |
| Test framework | Vitest + @testing-library/svelte | Vitest 3.x |
| Visual regression | Playwright | 1.x |
| Package manager | pnpm | 9.x |
| Node.js | Node.js 20+ | >= 20.19 |

→ See: [dev-docs/tech-stack-docs.md](../../dev-docs/tech-stack-docs.md)

---

## Module Boundary Architecture

Novellum enforces **Vertical Slice Architecture (VSA)** combined with **Feature-Sliced Design (FSD)** principles, managed by `eslint-plugin-boundaries`.

### Directory Layout

```text
src/
  app/            # SvelteKit app shell, layout components
  modules/        # Vertical domain modules (see below)
  lib/            # Shared utilities and cross-cutting concerns
  routes/         # SvelteKit file-based routes
  stores/         # App-level Svelte 5 rune stores
  styles/         # Global design tokens and base CSS
```

### The Six Boundary Layers

The six enforced boundary layers, in dependency order:

1. `app` — top-level shell; can import from everything below
2. `modules` — vertical domain slices; may only import from `lib`, `stores`, `styles`
3. `lib` — shared utilities; no domain knowledge; no module imports
4. `routes` — SvelteKit route files; can import from `modules` via public index
5. `stores` — app-level reactive state; no module internals
6. `styles` — design tokens and global CSS; no JS imports

### The Core Rule

Every module (`src/modules/<domain>/`) exposes **only what is declared in its `index.ts`**. Importing from internal module paths (e.g., `$modules/bible/services/character-service`) is a boundary violation and will cause `pnpm run lint` to fail.

```ts
// Allowed — consume the public module API
import { getCharacters } from '$modules/bible';

// Forbidden — bypass the barrel and import internals
import { getCharacters } from '$modules/bible/services/character-service';
```

Run `pnpm run lint` to verify boundary compliance. Violations are blocking — do not suppress them; restructure the import instead.

→ See: [dev-docs/modular-boundaries.md](../../dev-docs/modular-boundaries.md)

---

## Data Layer Discipline

**SQLite is the single source of truth** for all project data. All database access flows through SvelteKit API routes at `/api/db/*`, which use `better-sqlite3` synchronously on the server side.

**Dexie (IndexedDB) is strictly limited** to portability operations — specifically the `.novellum.zip` import/export archive system. Never access Dexie from a module service file. If you are writing a feature that reads or writes project data, use the SQLite API layer.

```ts
// Allowed — project data via SQLite API
const project = await fetch('/api/db/projects/123').then(r => r.json());

// Forbidden — reading project data from Dexie
import { db } from '$lib/dexie'; // only valid in portability modules
```

→ See: [dev-docs/data-model.md](../../dev-docs/data-model.md), [dev-docs/backend-context.md](../../dev-docs/backend-context.md)

---

## State Management

Novellum uses **Svelte 5 runes** exclusively. There are no Svelte 4 `writable` or `readable` stores anywhere in the codebase.

- Reactive state is declared with `$state` in `.svelte.ts` files or inside `.svelte` components.
- Derived values use `$derived` and `$derived.by`.
- Side effects use `$effect`.
- App-level cross-cutting state (active project, AI panel visibility) lives in `src/stores/` as `.svelte.ts` files.

```ts
// Correct — Svelte 5 rune store
// src/stores/active-project.svelte.ts
let activeProjectId = $state<string | null>(null);
export const getActiveProjectId = () => activeProjectId;
export const setActiveProjectId = (id: string | null) => { activeProjectId = id; };
```

→ See: [dev-docs/frontend-context.md](../../dev-docs/frontend-context.md)

---

## AI Pipeline

The AI system is a pipeline with five distinct layers:

```text
User Action → Context Engine → Prompt Builder → Model Router → OpenRouter API
```

1. **Context Engine** — builds the minimum required context for the current task (current scene, active characters, relevant outline nodes). Never sends the full manuscript.
2. **Prompt Builder** — assembles the structured prompt following the ROLE / TASK / CONTEXT / CONSTRAINTS / OUTPUT FORMAT template.
3. **Model Router** — selects the OpenRouter model based on user settings.
4. **OpenRouter API** — external AI provider; requests go directly from the client to OpenRouter, never through a Novellum server.
5. **Response Parser** — parses the AI's structured JSON output and surfaces it in the Nova sidebar as suggestions.

Agents never auto-apply changes. Every suggestion must be explicitly accepted by the user.

→ See: [dev-docs/ai-pipeline.md](../../dev-docs/ai-pipeline.md), [dev-docs/prompt-system.md](../../dev-docs/prompt-system.md)

---

## Domain Modules

The `src/modules/` directory contains one subdirectory per vertical domain:

| Module | Domain |
| :--- | :--- |
| `editor` | Rich-text scene editor (TipTap) |
| `nova` | AI assistant sidebar and pipeline |
| `export` | Manuscript compilation and export |
| `project` | Project creation, metadata, and hub |
| `outline` | Hierarchical Acts/Chapters/Scenes tree |
| `worldbuilding` | Personae, Atlas, Archive, Threads, Chronicles |
| `continuity` | Consistency-checking engine |
| `settings` | User preferences and configuration |
| `portability` | Backup/restore and `.novellum.zip` |

→ See: [dev-docs/repo-structure.md](../../dev-docs/repo-structure.md)
