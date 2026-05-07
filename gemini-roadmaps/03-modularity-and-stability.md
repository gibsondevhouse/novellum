# Roadmap 03: Modularity and Stability

> Focus: Svelte 5 hardening, database finalization, and desktop stability.

## 1. Svelte 5 Runes Hardening
- **Goal**: 100% migration to Svelte 5 patterns and removal of legacy Svelte 4 code.
- **Actions**:
    - Audit `src/lib/stores` for any remaining Svelte 4 `writable` stores and convert them to `$state` / `$derived` runes.
    - Convert all event-based component communication to callback-based (Svelte 5 standard).
    - Ensure all `+page.svelte` and `+layout.svelte` files use snippets for repetitive UI patterns.

## 2. Dexie -> SQLite Finalization
- **Goal**: Fully relegate Dexie to portability snapshots and remove it from all live application paths.
- **Actions**:
    - Identify any remaining live reads/writes to Dexie (e.g., in `src/lib/legacy/dexie`).
    - Migrate the remaining entities to the SQLite schema and `/api/db` routes.
    - Audit `src/modules/export` to ensure Dexie is *only* instantiated during the `.novellum.zip` generation process.

## 3. Tauri Shell & Local Server Stability
- **Goal**: Ensure the "Sidecar" local server and Tauri bridge are rock-solid.
- **Actions**:
    - **App Data Resilience**: Hardened the logic in `src/lib/server/db/index.js` for finding the correct `app-data` path across OSs.
    - **Credential Service Security**: Audit the `credential-service` to ensure AI keys are never logged and are stored with appropriate local permissions.
    - **Auto-Save/Recovery**: Implement a robust auto-save mechanism that leverages SQLite's WAL mode for safety during unexpected app closures.

## 4. Visual Token Enforcement
- **Goal**: Zero violations of the design system.
- **Actions**:
    - Run `pnpm check:tokens` and fix all remaining hardcoded pixel/color values.
    - Integrate token checking into the Git pre-commit hook.
    - Refactor `src/app.css` to be purely token-driven.
