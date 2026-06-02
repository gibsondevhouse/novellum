# Tauri Desktop Shell

> Last verified: 2026-06-01

Novellum ships as a Tauri 2 desktop app. Instead of running the SvelteKit server in-process or shelling out to a browser, Tauri **spawns the SvelteKit Node server as a sidecar** and points its WebView at the loopback port.

## Why a sidecar (not Electron)

- Single SvelteKit codebase: `pnpm dev` and the desktop build use the same server.
- No separate renderer/main process model.
- Smaller binary than Electron.
- Trade-off: we package a Node binary per platform and supervise its lifecycle in Rust.

## Files

[src-tauri/](../../src-tauri/):

```text
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── build.rs
├── binaries/         # Per-platform Node binaries fetched by scripts/fetch-node.mjs
├── capabilities/
├── icons/
├── gen/              # Tauri-generated artifacts
└── src/
    ├── main.rs       # Entry: app config, menu, init sidecar state
    ├── lib.rs        # pub fn run() — Tauri builder, plugins, RunEvent::ExitRequested handler
    └── sidecar.rs    # Sidecar lifecycle: spawn, readiness, drop-on-exit
```

Rust toolchain: edition 2021, MSRV 1.77.2. Crates: `tauri` 2.10.3 (with `devtools`), `tauri-plugin-log` 2, `tauri-build` 2.5.6.

## Lifecycle

1. `Sidecar::spawn`:
   - Finds a free ephemeral local port.
   - Resolves the Node binary path (bundled per platform).
   - Spawns `node build/index.js` with `PORT` and `HOST` env vars.
   - Polls TCP readiness on the chosen port.
2. The `Sidecar` struct owns the child `Child` process; its `Drop` impl kills the process.
3. `RunEvent::ExitRequested` in [lib.rs](../../src-tauri/src/lib.rs) drops the Tauri state to guarantee no orphaned Node processes on macOS/Windows/Linux.
4. The WebView navigates to `http://127.0.0.1:<port>`. The SvelteKit server serves both the static client bundle and `/api/*` endpoints.

## Database file

- `NOVELLUM_DB_PATH` env var controls the SQLite file location.
- In `pnpm dev`: defaults to `./novellum.db` in the repo root.
- In packaged desktop builds: resolved to the OS app-data path so users own their data outside the repo.
- See [05-workflow/portability-runbook.md](../05-workflow/portability-runbook.md) for relocation procedure.

## Build commands

| Command | Result |
| --- | --- |
| `pnpm desktop:dev` | `tauri dev` — runs Vite + spawns sidecar live. |
| `pnpm desktop:build` | Pre-build (sync version, fetch Node binary), then `tauri build` — produces `.dmg` / `.msi` / `.AppImage`. |
| `pnpm desktop:preview` | `tauri build --debug` — fast non-release build. |
| `pnpm version:sync` | Mirrors [package.json](../../package.json) version into [src-tauri/Cargo.toml](../../src-tauri/Cargo.toml) and [tauri.conf.json](../../src-tauri/tauri.conf.json). |
| `pnpm fetch:node` | Downloads platform-appropriate Node binary into `src-tauri/binaries/`. |

Pre-build hooks ensure the version stays in lockstep across web and desktop and that the bundled Node binary is fresh.

## Platform detection from the app

[src/lib/platform/](../../src/lib/platform/) and [src/lib/desktop/](../../src/lib/desktop/) provide:

- `isDesktop()` — true when running inside Tauri WebView.
- File dialog helpers (open/save) that route to Tauri APIs in desktop and to browser equivalents on web.
- Keyring shims (only available on desktop; web variant uses `localStorage` for non-secret prefs only — never for the AI key).

## Known fragilities

- **Port collisions.** Sidecar uses an ephemeral port, but on a busy machine readiness polling can take longer; the timeout is generous but bounded.
- **Node binary update flow.** `fetch-node.mjs` downloads Node by version. When bumping Node, also re-run `pnpm fetch:node` and re-test packaging on each platform.
- **Keyring backend per OS.** macOS Keychain, Windows Credential Manager, libsecret on Linux. CI runs the keyring tests on macOS only; Linux/Windows are covered by manual smoke tests.

## See also

- [system.md](./system.md) — where the sidecar fits in.
- [backend.md](./backend.md) — the API surface the sidecar serves.
- [05-workflow/release.md](../05-workflow/release.md) — cutting a release.
