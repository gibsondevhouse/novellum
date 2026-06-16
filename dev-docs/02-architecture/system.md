# System Architecture

> Last verified: 2026-06-16 (plan-053 implementation review)

Novellum is a **single-user, local-first desktop app** wrapping a SvelteKit web app over a server-side SQLite database. The desktop shell (Tauri 2) ships a Node.js binary and runs the SvelteKit server as a sidecar process. The browser variant exists for development.

## High-level shape

```text
┌──────────────────────────────────────────────────────────────────┐
│                       Tauri 2 Desktop Shell                       │
│                  (src-tauri/src/{main,lib,sidecar}.rs)            │
│                                                                  │
│   ┌─────────────────────────────────┐    spawns + supervises    │
│   │   WebView (Tauri webview)        │ ─────────────────────────┐│
│   │   loads http://127.0.0.1:<port>  │                          ││
│   └─────────────────────────────────┘                           ││
│                  ▲                                              ▼│
│                  │                          ┌──────────────────────────┐│
│                  │                          │  Node.js sidecar         ││
│                  │   HTTP (loopback)        │  (build/index.js, from   ││
│                  └──────────────────────────│   adapter-node)          ││
│                                             └──────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
                                       ┌──────────────────────────┐
                                       │  SvelteKit server         │
                                       │  - serves /              │
                                       │  - /api/db/*  (REST)      │
                                       │  - /api/ai-controller/*   │
                                       │  - /api/ai/*  (legacy)    │
                                       │  - /api/settings/*        │
                                       │  - /api/backup,restore/*  │
                                       │  - /api/local-files/*     │
                                       └──────────────────────────┘
                                                       │
                ┌──────────────────────────────────────┼─────────────────────────────┐
                ▼                                      ▼                             ▼
       ┌──────────────────┐                  ┌──────────────────┐         ┌──────────────────┐
       │ better-sqlite3    │                  │ OS keyring        │         │ OpenRouter HTTP   │
       │ (novellum.db,     │                  │ (@napi-rs/keyring)│         │ (BYOK)            │
       │  WAL mode)        │                  │                   │         │                   │
       └──────────────────┘                  └──────────────────┘         └──────────────────┘
```

## Layers

### 1. UI shell — Svelte 5 + SvelteKit 2

- File-based routing under [src/routes/](../../src/routes/). Layouts compose persistent chrome (sidebar, toolbar, panels).
- Pages are intentionally **thin**: they call services from `$modules/<domain>` and render components. No business logic in `+page.svelte`.
- Reactivity is Svelte 5 Runes only (`$state`, `$derived`, `$effect`). Svelte 4 patterns (`export let`, `$:`) are forbidden in new code.
- See [frontend.md](./frontend.md) and [routing.md](./routing.md).

### 2. Feature modules — vertical slices

- Twelve domain slices under [src/modules/](../../src/modules/): ai, assets, continuity, editor, export, nova, outline, project, reader, settings, story-bible (legacy), world-building.
- Each module owns its `components/`, `services/`, `stores/`, `types.ts`. Cross-module imports MUST go through the module's `index.ts` barrel.
- Boundaries enforced by `eslint-plugin-boundaries` — see [modular-boundaries.md](./modular-boundaries.md).
- See [04-modules/](../04-modules/) for per-module reference.

### 3. Shared library — `src/lib/`

- `$lib` alias. Code that does not belong to a feature slice: API client, AI orchestration, server DB layer, design tokens, platform detection, factories, utilities.
- **Server-only code** lives at [src/lib/server/](../../src/lib/server/) and is never imported from client code (SvelteKit enforces this).

### 4. Server / API — SvelteKit `+server.ts`

- All persistence flows through `/api/db/*` REST endpoints. Browser code uses [src/lib/api-client.ts](../../src/lib/api-client.ts) (`apiGet`/`apiPost`/`apiPut`/`apiDel`); it never touches SQLite directly.
- Hardened AI execution flows through `/api/ai-controller/*` REST endpoints.
- See [backend.md](./backend.md) for the endpoint taxonomy.

### 5. Database — single-file SQLite

- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) singleton with WAL mode, foreign keys ON.
- 28 core tables, 40+ indexes. Schema in [src/lib/server/db/schema.ts](../../src/lib/server/db/schema.ts), migrations in [src/lib/server/db/migrations.ts](../../src/lib/server/db/migrations.ts).
- DB file path resolved via `NOVELLUM_DB_PATH` (default `./novellum.db` in dev; OS app-data path in desktop builds).
- See [data-model.md](./data-model.md).

### 6. Desktop shell — Tauri 2

- Tauri webview points at the local Node sidecar. The sidecar is the same SvelteKit server you run during `pnpm dev`, just bundled as `build/index.js`.
- Lifecycle, packaging, and known fragilities are documented in [tauri-shell.md](./tauri-shell.md).

### 7. AI layer — Governed Runtime

- [src/lib/server/ai/controller/](../../src/lib/server/ai/controller/) — Centralized AI control plane for intent resolution, policy enforcement, context assembly, and artifact lifecycle (Plan-051).
- [src/lib/ai/](../../src/lib/ai/) — Frontend orchestrator and client-side agent logic.
- **Hardened Runtime** (Plan-049) — SQLite-backed job queue, durable run records, granular steps, tool call logging, and fine-grained tracing.
- Calls go through `/api/ai-controller/*` so the OpenRouter API key never reaches the browser.
- See [03-ai/pipeline.md](../03-ai/pipeline.md).

### 8. Portability — Dexie 4

- Dexie is **only** used to read/write `.novellum.zip` bundles. No live read/write paths use Dexie. Schema in [src/lib/db/](../../src/lib/db/).
- Backup/restore endpoints live under `/api/backup/*` and `/api/restore/*`.

## Data flow (typical user action)

1. User edits a scene in the TipTap editor.
2. Editor module calls its autosave service.
3. Autosave invokes `apiPut('/api/db/scenes/[id]', body)`.
4. The SvelteKit endpoint validates the payload (Zod), serializes JSON columns, writes via the better-sqlite3 singleton.
5. Response returns the persisted record; the editor store updates `$state`; UI reflects "Saved".

## AI Data flow (Governed Controller)

1. User clicks "Generate" in a module.
2. Module calls `aiController.execute({ intent, context })`.
3. Server-side controller resolves intent → checks policy → assembles context packet.
4. Workflow is routed to a specific agent/model; execution is logged as an `agent_run`.
5. Output is validated against Zod schemas; if valid, a reviewable `agent_artifact` is created.
6. Frontend renders the artifact for author review; author accepts/rejects.

## Why this shape

- **Local-first, single-binary distribution.** The user owns their data; the app works offline (apart from explicit AI calls).
- **One source of truth.** Eliminating client-side persistence removed an entire class of sync bugs.
- **Governed AI execution.** Centralizing AI logic in a server-side controller allows for strict policy enforcement, durable audit logs, and a unified artifact lifecycle.
- **Modular boundaries.** Vertical slices keep features movable and reviewable; ESLint stops cross-module shortcuts at PR time.

## See also

- [frontend.md](./frontend.md) — Svelte 5 + module conventions.
- [backend.md](./backend.md) — API surface + server DB layer.
- [routing.md](./routing.md) — full route tree.
- [data-model.md](./data-model.md) — SQLite schema.
- [modular-boundaries.md](./modular-boundaries.md) — import rules.
- [tauri-shell.md](./tauri-shell.md) — desktop shell.
