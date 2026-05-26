# Task 01 — Education

## What is the toolchain doing?

Building Novellum as a desktop app is a four-stage pipeline. Each
stage hands off an artifact to the next.

```text
SvelteKit (Vite) ──► build/ (Node server + client bundle)
        │
        ▼
Tauri CLI ─────────► Rust crate at src-tauri/ + bundle.resources
        │
        ▼
Cargo / rustc ─────► native binary linking against system WebView
        │
        ▼
Tauri bundler ─────► .dmg / .msi / .AppImage
```

### Why Rust?

Tauri's main process is a Rust binary. It owns the native window,
the IPC layer, and the app lifecycle. Your SvelteKit code runs
inside a WebView the Rust binary spawns. Source for our Rust shell
lives in `src-tauri/src/lib.rs` (the `run()` entrypoint) and
`src-tauri/src/sidecar.rs` (the Node child-process manager).

### Why Node also?

`better-sqlite3` is a native Node addon, and our `/api/db/*` routes
run inside SvelteKit's `adapter-node`. Re-implementing them in Rust
would mean rewriting the entire backend. Instead, the Rust shell
spawns `node build/index.js` as a child process ("the sidecar"),
points the WebView at `http://127.0.0.1:<port>`, and tears the
sidecar down on app exit.

### Why pnpm?

The repo is locked to pnpm via `packageManager` in `package.json`.
Using npm/yarn would produce a different lockfile and may pull
incompatible peer dependency versions.

## Why specific versions matter

- **Node 22+**: stable `--experimental-sea-config` (unused today
  but on the roadmap), built-in `localStorage` we explicitly bypass
  in tests, and ESM JSON-import attribute support
  (`with { type: 'json' }`) used in `src/lib/version.ts`.
- **Rust 1.77.2+**: required by `tauri-build 2.5.6`.
- **Tauri 2.10.x**: API matches `src-tauri/tauri.conf.json`'s schema
  and the desktop-detection sentinel (`window.__TAURI_INTERNALS__`)
  in `src/lib/platform/platform.ts`.

## What if `cargo check` fails?

The most common first-build failure on macOS is "linker error,
ld can't find -framework AppKit". This means Xcode CLT isn't
installed — `xcode-select --install` fixes it.

On Linux, "package webkit2gtk-4.1 was not found" means you're
missing the GTK headers — install via the apt command in step 3.

On Windows, "link.exe not found" means VS Build Tools is missing or
the "Desktop development with C++" workload wasn't selected during
install.
