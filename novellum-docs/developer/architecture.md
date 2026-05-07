# Architecture (One-Pager)

> Last verified: 2026-05-07

This page is a quick map. The full reference is [../../dev-docs/02-architecture/](../../dev-docs/02-architecture/).

## Shape

- **Desktop shell:** Tauri 2 wraps a WebView pointed at a local SvelteKit server running as a sidecar.
- **App:** SvelteKit 2 + Svelte 5 Runes. UI in `src/routes/`, feature slices in `src/modules/`, shared library in `src/lib/`.
- **Server:** SvelteKit `+server.ts` endpoints under `/api/*`. Single source of truth = SQLite via `better-sqlite3` in [src/lib/server/db/](../../src/lib/server/db/).
- **AI:** [src/lib/ai/](../../src/lib/ai/) builds prompts and calls OpenRouter through the `/api/ai` proxy. Four shipped agents (Continuity, Edit, Rewrite, Style); four planned.
- **Portability:** Dexie 4 retained only for `.novellum.zip` import/export. Live reads/writes do not touch Dexie.
- **State:** Svelte 5 rune stores (`.svelte.ts`). No global god-store; modules own their state.

## Diagram

```text
Tauri (Rust) ── spawns ──▶ Node sidecar (build/index.js)
   │                              │
   ▼                              ▼
WebView ───── http(loopback) ───▶ SvelteKit server
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                  ▼                  ▼
          SQLite (WAL)        OS keyring         OpenRouter
       (better-sqlite3)   (@napi-rs/keyring)    (HTTP, BYOK)
```

## Read these next

- [../../dev-docs/02-architecture/system.md](../../dev-docs/02-architecture/system.md) — full system explanation.
- [../../dev-docs/02-architecture/frontend.md](../../dev-docs/02-architecture/frontend.md) — Svelte 5, modules, styling.
- [../../dev-docs/02-architecture/backend.md](../../dev-docs/02-architecture/backend.md) — endpoint taxonomy, DB layer.
- [../../dev-docs/02-architecture/routing.md](../../dev-docs/02-architecture/routing.md) — full route tree.
- [../../dev-docs/02-architecture/data-model.md](../../dev-docs/02-architecture/data-model.md) — SQLite schema.
- [../../dev-docs/02-architecture/modular-boundaries.md](../../dev-docs/02-architecture/modular-boundaries.md) — import rules.
- [../../dev-docs/02-architecture/tauri-shell.md](../../dev-docs/02-architecture/tauri-shell.md) — desktop shell.
- [../../dev-docs/03-ai/pipeline.md](../../dev-docs/03-ai/pipeline.md) — AI pipeline.
