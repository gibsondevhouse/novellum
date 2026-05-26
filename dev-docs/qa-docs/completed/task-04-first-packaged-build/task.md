# Task 04 — First Packaged Build

**Goal:** Run `pnpm desktop:build` for the first time, produce a
real installer artifact, and confirm it contains the bundled Node
runtime, the SvelteKit `build/` resources, and the Tauri shell.

## Why You Need This

Until you produce a packaged build, the entire production code path
in `src-tauri/src/lib.rs` (the non-`debug_assertions` branch) is
unexercised. Many sidecar bugs only surface in release mode because
of how `cfg!(debug_assertions)` toggles behaviour.

## Prerequisites

All prerequisites are already in place:

- Toolchain verified — `pnpm desktop:dev` runs on this machine.
- Dev-run 404 bug fixed (`src/lib/project-metadata.ts`).
- Node-runtime bundling wired:
  - `scripts/fetch-node.mjs` downloads + verifies the Node 22 binary
    per target triple.
  - `predesktop:build` runs the fetch script automatically.
  - `bundle.externalBin: ["binaries/node"]` declared in
    `src-tauri/tauri.conf.json`.
  - `resolve_node_binary` in `src-tauri/src/sidecar.rs` prefers the
    bundled sidecar at `<exe-dir>/node-<target-triple>` and falls
    back to PATH for dev mode.
  - `src-tauri/build.rs` emits `NOVELLUM_TARGET_TRIPLE` for runtime
    resolution.

The first `pnpm desktop:build` run on a fresh checkout will fetch
the ~50 MB Node binary (cached under `src-tauri/binaries/`,
gitignored).

## Steps

1. **Clean previous artifacts** (optional but reduces confusion):

   ```bash
   rm -rf src-tauri/target/release/bundle
   rm -rf build
   ```

2. **Run the build.**

   ```bash
   pnpm desktop:build
   ```

   This runs in order:
   - `predesktop:build`: `node scripts/sync-tauri-version.mjs` and
     `node scripts/fetch-node.mjs` (the latter is a no-op once the
     binary is cached under `src-tauri/binaries/`).
   - `beforeBuildCommand`: `pnpm build` (SvelteKit production)
     followed by `node scripts/prepare-sidecar-deps.mjs`, which
     stages native runtime deps into `build/node_modules/` so the
     sidecar resolves `better-sqlite3` / `@napi-rs/keyring`
     against the bundled Node ABI rather than the developer's
     local Node version.
   - `cargo build --release` for `src-tauri/`.
   - Tauri bundler emits the platform installer with the bundled
     Node sidecar.

   **First run takes 5–20 minutes** due to Cargo's release-profile
   compile. Subsequent runs are incremental (~1 min).

3. **Locate the artifact.** Output paths:

   - macOS: `src-tauri/target/release/bundle/dmg/Novellum_0.0.1_aarch64.dmg`
     and the `.app` at `src-tauri/target/release/bundle/macos/Novellum.app`.
   - Windows: `src-tauri/target/release/bundle/msi/Novellum_0.0.1_x64_en-US.msi`.
   - Linux: `src-tauri/target/release/bundle/appimage/Novellum_0.0.1_amd64.AppImage`
     or `.deb`.

4. **Verify the bundle contents.**

   On macOS:

   ```bash
   APP="src-tauri/target/release/bundle/macos/Novellum.app"
   ls -la "$APP/Contents/Resources/_up_/build/" | head
   ls -la "$APP/Contents/MacOS/" | head
   du -sh "$APP"
   ```

   You should see:
   - `Contents/MacOS/novellum` (the Rust binary).
   - `Contents/MacOS/node-aarch64-apple-darwin` (the bundled Node).
   - `Contents/Resources/_up_/build/index.js` and friends.

   Total `.app` size: ~80–150 MB depending on Node bundle.

5. **Run the unsigned `.app`.**

   ```bash
   open src-tauri/target/release/bundle/macos/Novellum.app
   ```

   First run: macOS Gatekeeper will refuse. Right-click → Open, then
   confirm. (This bypass is a one-shot per `.app`. Real signing in
   Task 09 removes it.)

6. **Confirm the production code path runs.**

   - The window should open at 1400×900 titled "Novellum".
   - In the WebView console (right-click → Inspect → Console), you
     should see the URL is `http://127.0.0.1:<random-port>`, NOT
     `localhost:5173`. That confirms the sidecar is in charge.
   - `await fetch('/api/health')` (or any known route) returns 200.

## Done When

The artifact exists, opens cleanly on the build machine, and the
sidecar is serving on a random local port. Move to
[Task 05 — Capture Empirical Measurements](../task-05-capture-measurements/task.md).

## Common Failures

- **"failed to bundle project: Process did not exit with success"**:
  re-run with `pnpm desktop:build --verbose` and read the last 50
  lines. Often a missing icon size or an invalid identifier.
- **App opens but shows blank WebView**: sidecar didn't start. Open
  Console.app on macOS, filter by "Novellum", look for
  `SidecarError`. Most common: `NodeBinaryNotFound` (the bundle
  resolver couldn't find `node-<triple>` next to the executable —
  re-run `pnpm fetch:node` and rebuild) or `ReadinessTimeout` (Node
  started but `build/index.js` threw an error before listening).
  To debug standalone, run `node build/index.js` with
  `PORT=9999 NODE_ENV=production`.
- **Cargo OOM on Linux CI machines**: add `CARGO_PROFILE_RELEASE_LTO=off`
  to the build env. LTO is RAM-hungry.
