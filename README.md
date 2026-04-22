# Novellum

Local-first, AI-assisted novel production workspace built with SvelteKit and Svelte 5.

Novellum combines story planning, world-building, drafting, continuity tooling, and export workflows while keeping user data local-first and structured.

## Current Status

- Updated: 2026-04-20
- Runtime: SvelteKit 2 + Svelte 5 Runes
- Data layer: SQLite via `/api/db/*` (primary), Dexie (portability/import-export)

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Getting Started

```sh
pnpm install
pnpm run dev
```

Open <http://localhost:5173> in your browser.

## Common Commands

- `pnpm run dev`: Start development server.
- `pnpm run build`: Build production bundle.
- `pnpm run preview`: Preview production build.
- `pnpm run lint`: Run ESLint (includes boundaries rules).
- `pnpm run lint:css`: Run Stylelint across `.css` and `.svelte` style blocks.
- `pnpm run check`: Run Svelte/TypeScript checks.
- `pnpm run test`: Run Vitest suite.
- `pnpm run test:coverage`: Run Vitest with coverage.
- `pnpm run test:visual`: Run Playwright visual tests.
- `pnpm run storybook`: Start Storybook component playground.
- `pnpm run build-storybook`: Build static Storybook for CI verification.
- `pnpm run format`: Run Prettier.

## Project Structure

- `.github/`: Agent definitions, coding instructions, and reusable skills.
- `src/`: Application source code, organized by vertical module boundaries.
- `dev-docs/`: Engineering architecture docs, planning artifacts, and implementation notes.
- `novellum-docs/`: User-facing setup and product documentation.
- `tests/`: Vitest and Playwright test suites.

## Documentation

- Developer docs: `dev-docs/README.md`
- User docs: `novellum-docs/README.md`

## Recent Notes

- World-building sub-navigation now uses a unified shell pattern across Personae, Atlas, Archive, Threads, and Chronicles routes.
