# Getting Started (Developers)

> Last verified: 2026-05-07

This is the **fast path** for a new contributor. The deeper reference lives under [../../dev-docs/](../../dev-docs/) — read [../../dev-docs/01-project/journey.md](../../dev-docs/01-project/journey.md) for the project's history once you're set up.

## Prerequisites

- Node.js 20+.
- pnpm 9+.
- Rust toolchain 1.77.2+ (for `pnpm desktop:dev` / `desktop:build`).
- macOS, Windows, or Linux.

## Clone and install

```bash
git clone https://github.com/gibsondevhouse/novellum.git
cd novellum
pnpm install
```

`better-sqlite3` builds native bindings during install. If it fails, ensure you have a working C++ toolchain (Xcode CLI on macOS, Build Tools on Windows, gcc on Linux).

## Run the web app

```bash
pnpm dev
```

Open `http://localhost:5173`. SvelteKit hot-reloads on save. The local SQLite file is created at `./novellum.db` (override with `NOVELLUM_DB_PATH`).

## Run the desktop app

```bash
pnpm desktop:dev
```

This launches Tauri in dev mode: Vite serves the client, the SvelteKit Node server runs as a sidecar, and the Tauri WebView points at it. See [../../dev-docs/02-architecture/tauri-shell.md](../../dev-docs/02-architecture/tauri-shell.md) for what's happening under the hood.

## Type-check, lint, format

```bash
pnpm check        # svelte-check
pnpm lint         # ESLint (boundaries enforced)
pnpm lint:css     # Stylelint
pnpm check:tokens # token enforcement
pnpm format       # Prettier write
```

## Test

```bash
pnpm test         # Vitest
pnpm test:e2e     # Playwright
pnpm test:visual  # Visual regression
```

See [testing.md](./testing.md) for what each tier covers.

## What to read next

1. [architecture.md](./architecture.md) — system overview.
2. [../../dev-docs/01-project/project-overview.md](../../dev-docs/01-project/project-overview.md) — what we're building.
3. [../../dev-docs/01-project/journey.md](../../dev-docs/01-project/journey.md) — how we got here.
4. [../../dev-docs/05-workflow/dev-workflow.md](../../dev-docs/05-workflow/dev-workflow.md) — the day-to-day.
5. [../../dev-docs/05-workflow/planning-conventions.md](../../dev-docs/05-workflow/planning-conventions.md) — write a plan before non-trivial code.

## Conventions worth knowing immediately

- **Svelte 5 Runes only.** No `export let`, no `$:`. See [../../dev-docs/02-architecture/frontend.md](../../dev-docs/02-architecture/frontend.md).
- **No hardcoded design values.** Use `--token-*` CSS variables. `pnpm check:tokens` enforces.
- **Modular boundaries are mechanical.** `eslint-plugin-boundaries` will block PRs that import past a module barrel. See [../../dev-docs/02-architecture/modular-boundaries.md](../../dev-docs/02-architecture/modular-boundaries.md).
- **Server-only code stays server-only.** Never import from `src/lib/server/` in client code.
- **Use `apiGet`/`apiPost` etc.** from [src/lib/api-client.ts](../../src/lib/api-client.ts), not raw `fetch`.
