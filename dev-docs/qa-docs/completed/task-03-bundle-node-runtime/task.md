# Task 03 — Bundle the Node Runtime

**Goal:** Ship a Node.js binary inside the Tauri installer so end
users do not need Node on their PATH. Until this is done,
`pnpm desktop:build` produces installers that only run on machines
that already have `node` installed.

## Why You Need This

Plan-017 stage-008 phase-003 explicitly deferred this. The current
sidecar resolver (`src-tauri/src/sidecar.rs::resolve_node_binary`)
falls back to `node` from PATH. That's fine for developers but
unacceptable for shipped users — most won't have Node, and the app
will fail with `SidecarError::NodeBinaryNotFound`.

Tauri's standard pattern for this is `bundle.externalBin` with
target-triple-suffixed binaries.

## Steps

1. **Create the fetch script.**

   Create `scripts/fetch-node.mjs` that downloads the official Node
   release for each target triple Tauri builds for and lays the
   binary down at `src-tauri/binaries/node-<target-triple>` (with
   `.exe` on Windows). Targets to support:

   - `aarch64-apple-darwin` → macOS Apple Silicon
   - `x86_64-apple-darwin` → macOS Intel (optional V1)
   - `x86_64-pc-windows-msvc` → Windows x64

   Pin a specific Node major (recommend Node 22 LTS). Sample
   download URL pattern:

   ```text
   https://nodejs.org/dist/v22.11.0/node-v22.11.0-darwin-arm64.tar.gz
   https://nodejs.org/dist/v22.11.0/node-v22.11.0-darwin-x64.tar.gz
   https://nodejs.org/dist/v22.11.0/node-v22.11.0-win-x64.zip
   ```

   The script should:
   - Skip download if the binary already exists.
   - Verify the SHA256 against the official `SHASUMS256.txt`.
   - Extract just the `bin/node` (or `node.exe`) from the archive.
   - Write to `src-tauri/binaries/node-<target>` and `chmod +x`.

2. **Wire the script as a `pretauri:build` hook in `package.json`:**

   ```json
   "pretauri": "node scripts/fetch-node.mjs",
   "predesktop:build": "node scripts/sync-tauri-version.mjs && node scripts/fetch-node.mjs",
   ```

3. **Declare the external binary in `src-tauri/tauri.conf.json`:**

   ```json
   "bundle": {
     "externalBin": ["binaries/node"]
   }
   ```

   Tauri will look for `binaries/node-<target-triple>` (or `.exe`)
   and bundle it as a sidecar resource the Rust code can locate via
   `tauri::process::Command::new_sidecar("node")`.

4. **Update `src-tauri/src/sidecar.rs`** so `resolve_node_binary`
   first tries the bundled sidecar:

   ```rust
   use tauri_plugin_shell::ShellExt;
   // app.shell().sidecar("node")?
   ```

   Keep the PATH fallback so dev mode still works on machines
   without the bundled binary.

   Note: this requires adding `tauri-plugin-shell` to `Cargo.toml`
   and registering it in `src-tauri/src/lib.rs`.

5. **Update `.gitignore`:**

   ```text
   src-tauri/binaries/
   ```

   The fetched Node binaries are large (~50 MB each) and
   reproducible from the script.

6. **Verify the script works.**

   ```bash
   node scripts/fetch-node.mjs
   ls -lh src-tauri/binaries/
   ```

   Expected: one binary per supported target, ~50 MB each.

7. **Commit the new script and config edits** but **not** the
   binaries.

## Done When

Running `pnpm desktop:build` (Task 04) produces an installer that
launches on a clean machine without Node installed.

## References

- [Tauri externalBin docs](https://v2.tauri.app/develop/sidecar/)
- [Node release SHASUMS](https://nodejs.org/dist/v22.11.0/SHASUMS256.txt)
- [src-tauri/src/sidecar.rs](../../../src-tauri/src/sidecar.rs)
