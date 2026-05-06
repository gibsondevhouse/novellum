# Contributing to Novellum

Thank you for contributing. This guide covers everything you need to get the development environment running, understand the codebase conventions, and submit quality pull requests.

---

## Prerequisites

Make sure the following are installed before cloning:

| Tool | Minimum version | Check |
| :--- | :--- | :--- |
| Node.js | 20.19 or later | `node --version` |
| pnpm | 9.0 or later | `pnpm --version` |
| Rust (Tauri builds only) | stable | `rustup update stable` |

**pnpm is required.** Do not use `npm` or `yarn`. All install and run commands in this guide use `pnpm`.

Rust is only needed if you are building the Tauri desktop shell. For web-only development it is not required.

---

## Setup

```sh
git clone https://github.com/novellum/novellum.git
cd novellum
pnpm install
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The development server supports hot module replacement — changes to `.svelte` and `.ts` files are reflected immediately.

---

## All Available Commands

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Start the Vite development server at `localhost:5173`. |
| `pnpm run build` | Build the production web bundle to `build/`. |
| `pnpm run preview` | Preview the production build at `localhost:4173`. |
| `pnpm run check` | Run `svelte-check` for Svelte and TypeScript diagnostics. |
| `pnpm run lint` | Run ESLint including `eslint-plugin-boundaries` module-boundary checks. |
| `pnpm run lint:css` | Run Stylelint across all `.css` and `.svelte` style blocks. |
| `pnpm run format` | Run Prettier on all files. |
| `pnpm run test` | Run the full Vitest test suite once. |
| `pnpm run test:watch` | Run Vitest in watch mode (re-runs on file change). |
| `pnpm run test:coverage` | Run Vitest with v8 coverage. HTML report at `coverage/index.html`. |
| `pnpm run test:visual` | Run Playwright visual regression tests in `tests/visual/`. |
| `pnpm run storybook` | Start the Storybook component playground at `localhost:6006`. |
| `pnpm run build-storybook` | Build a static Storybook output (used in CI verification). |
| `pnpm run desktop:dev` | Start Tauri + Vite dev server in desktop mode. |
| `pnpm run desktop:build` | Build the Tauri desktop app for the current platform. Runs `version:sync` and `fetch:node` automatically. |
| `pnpm run version:sync` | Sync `package.json` version into `src-tauri/tauri.conf.json`. |
| `pnpm run fetch:node` | Download the sidecar Node.js binary for the desktop build. |

---

## Development Workflow

### Branch naming

Branch from `master` using a consistent naming convention:

```text
feat/<short-slug>       # New features
fix/<short-slug>        # Bug fixes
chore/<short-slug>      # Maintenance, dependency updates, docs
refactor/<short-slug>   # Refactors without behaviour change
```

Examples: `feat/export-epub`, `fix/nova-context-trim`, `chore/update-sveltekit`.

### Opening a pull request

1. Push your branch to the repository.
2. Open a PR against `master` with a clear title and a short description of the change.
3. CI must pass: type check (`pnpm run check`), lint (`pnpm run lint`), and tests (`pnpm run test`).
4. A Reviewer Agent sign-off is required before merge.

---

## Module Boundary Rules

Novellum enforces strict vertical domain isolation via `eslint-plugin-boundaries`. This is not optional.

The key rule: **every module exposes only what is declared in its `index.ts`**. Never import from an internal module path.

```ts
// Allowed
import { getCharacters } from '$modules/bible';

// Forbidden — boundary violation, will fail lint
import { getCharacters } from '$modules/bible/services/character-service';
```

Running `pnpm run lint` will surface boundary violations. If one is flagged, restructure the import — do not suppress the ESLint rule. Violations are blocking.

→ See [architecture.md](architecture.md) for the full boundary layer diagram.

---

## Test Requirements

Every feature or bug fix must ship with a test. The following coverage thresholds are enforced:

- `src/lib/services/**` — **≥ 80% line coverage**
- `src/lib/ai/**` — **≥ 80% line coverage**

Run `pnpm run test:coverage` and open `coverage/index.html` to find coverage gaps before submitting a PR.

→ See [testing.md](testing.md) for detailed Vitest patterns and mocking guidance.
