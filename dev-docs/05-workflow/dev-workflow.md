# Dev Workflow

> Last verified: 2026-05-07

## Prerequisites

- **Node.js 20+**.
- **pnpm 9+** (`pnpm` is the only supported package manager).
- **Rust toolchain** (rustc 1.77.2+) — needed for desktop builds.
- macOS, Windows, or Linux.

## First-time setup

```bash
git clone https://github.com/gibsondevhouse/novellum.git
cd novellum
pnpm install
```

`better-sqlite3` is in `pnpm`'s `onlyBuiltDependencies` allowlist; the install will compile native bindings.

## Daily commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Vite dev server (browser app at `http://localhost:5173`). |
| `pnpm desktop:dev` | Tauri dev — spawns sidecar + WebView. Requires Rust toolchain. |
| `pnpm build` | Production SvelteKit build (Node adapter output to `build/`). |
| `pnpm preview` | Preview the production build over HTTP. |
| `pnpm storybook` | Storybook on port 6006. |

## Quality gates

| Command | What it runs |
| --- | --- |
| `pnpm check` | `svelte-check` against `tsconfig.json`. Type-checks the entire app. |
| `pnpm lint` | ESLint (boundaries, formatting, rules). |
| `pnpm lint:css` | Stylelint. `pnpm lint:css:fix` to autofix. |
| `pnpm format` | Prettier write across the repo. |
| `pnpm check:tokens` | Custom lint via [scripts/check-visual-tokens.mjs](../../scripts/check-visual-tokens.mjs) — fails on hardcoded colors/pixels. |

Open a PR only after `check` + `lint` + `check:tokens` pass.

## Tests

| Command | Scope |
| --- | --- |
| `pnpm test` | Vitest (unit + integration). |
| `pnpm test:watch` | Vitest in watch mode. |
| `pnpm test:coverage` | Vitest with coverage. |
| `pnpm test:e2e` | Playwright in [tests/e2e/](../../tests/e2e/). |
| `pnpm test:visual` | Playwright in [tests/visual/](../../tests/visual/) — visual regression. |

See [testing.md](./testing.md) for what each tier covers.

## Database & environment

- Default DB path: `./novellum.db` in repo root.
- Override with `NOVELLUM_DB_PATH=/some/path/file.db`.
- The DB file is git-ignored. Delete it to start clean; migrations re-run on next launch.

## Branching and commits

- Feature branches off `master`.
- Commit messages follow the present-tense imperative style (`add`, `fix`, `refactor`, `remove`).
- Squash commits into a single coherent commit before merge when appropriate.
- Reference the controlling plan ID in PR descriptions (`Closes plan-021 stage 002`).

## Cutting a release

See [release.md](./release.md).

## Working with plans

Every non-trivial change starts as a plan in [../plans/](../plans/). Read [planning-conventions.md](./planning-conventions.md) before writing one.

## Useful scripts

| Script | Purpose |
| --- | --- |
| [scripts/check-visual-tokens.mjs](../../scripts/check-visual-tokens.mjs) | Token enforcement. |
| [scripts/fetch-node.mjs](../../scripts/fetch-node.mjs) | Fetch platform Node binary for Tauri sidecar packaging. |
| [scripts/sync-tauri-version.mjs](../../scripts/sync-tauri-version.mjs) | Mirror `package.json` version into Tauri config + Cargo. |
| [scripts/generate-changelog.mjs](../../scripts/generate-changelog.mjs) | Regenerate [../../CHANGELOG.md](../../CHANGELOG.md). |
| [scripts/prepare-sidecar-deps.mjs](../../scripts/prepare-sidecar-deps.mjs) | Pre-build sidecar dependencies. |
