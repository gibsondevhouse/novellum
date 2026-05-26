# Frontend Context

> Last updated: 2026-04-20

## Overview

Novellum's frontend is a **SvelteKit 2** application written with **Svelte 5 Runes** (`$state`, `$derived`, `$effect`). It follows a modular, domain-driven design (Vertical Slice Architecture) with strict import boundaries enforced by `eslint-plugin-boundaries`.

## SvelteKit Usage

- **Framework** — SvelteKit 2 with `@sveltejs/adapter-node` for server deployment (SQLite lives on the server).
- **Reactivity** — Svelte 5 Runes only. Do not use `export let` or `$:` in new code.
- **State** — Reactive state lives in rune files (`.svelte.ts`) inside each module's `stores/` directory, or at `src/lib/stores/` for genuinely app-level state.
- **Routing** — Filesystem routing under `src/routes/`. See [`routing-context.md`](./routing-context.md) for the shipped route tree.

## Modular Structure (`src/modules/`)

Modules are vertical slices. Each module owns its UI, stores, services, and types, and exposes a curated public surface through its `index.ts` barrel.

- `ai/` — AI interaction surfaces and generative capabilities.
- `assets/` — Project-scoped asset management.
- `bible/` — Story bible and world-building module. Provides `IndividualsWorkspaceShell`, the unified sidebar + dossier shell used by every world-building subnav (Personae, Atlas, Archive, Threads, Chronicles).
- `consistency/` — Consistency analysis engine (pure logic).
- `continuity/` — Consistency UI surface that composes the engine's output.
- `editor/` — TipTap 3 manuscript editor and its supporting toolbar/extensions.
- `export/` — DOCX / ePub / JSON exporters.
- `outliner/` — Structural planning (Arc → Act → Chapter → Scene).
- `project/` — Project hub, project metadata, library views.
- `settings/` — Settings surfaces including portability migration.
- `world-building/` — Route-level composition of Personae / Atlas / Archive / Threads / Chronicles sections.

Cross-module imports are limited to each module's public barrel. See [`modular-boundaries.md`](./modular-boundaries.md) for the import matrix.

## Styles and UI Strategy

- **CSS Architecture** — Global tokens and resets in `src/styles/` (e.g., `reset.css`, `tokens.css`) and `src/app.css`. Module-specific styling lives alongside components.
- **Design Tokens** — Spacing (`--space-*`), color, radii, and typography are token-driven. Hardcoded pixel values are prohibited.
- **Utility Layer** — Tailwind v3 (`tailwindcss` 3.4) powers utility classes; `tailwind-merge` and `tailwind-variants` drive variant composition.
- **Primitives** — `bits-ui` provides unstyled primitives that are wrapped into the Novellum design system.

## Testing

- **Unit / component** — Vitest (`pnpm run test`, `pnpm run test:coverage`).
- **Visual regression** — Playwright (`pnpm run test:visual`).
- **Token policy** — `pnpm run check:tokens` verifies no disallowed hardcoded values.
