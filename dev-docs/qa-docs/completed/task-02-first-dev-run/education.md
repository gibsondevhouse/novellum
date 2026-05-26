# Task 02 — Education

## What `tauri dev` actually does

When you run `pnpm desktop:dev`:

1. The `beforeDevCommand` in `src-tauri/tauri.conf.json` runs
   `pnpm dev`, which starts Vite on `http://localhost:5173`.
2. Cargo compiles `src-tauri/` in debug mode.
3. The compiled binary launches and creates a window.
4. The window's WebView loads `devUrl` (`http://localhost:5173`)
   from `tauri.conf.json#build.devUrl`.

In dev there is **no sidecar**. The Vite dev server is also serving
SvelteKit's API routes via SvelteKit's own dev middleware. When you
package the app for release, the sidecar (`src-tauri/src/sidecar.rs`)
takes over because Vite is no longer running.

## Why dev mode and packaged mode diverge

| Concern             | Dev mode (`tauri dev`)                | Packaged mode (`tauri build`)              |
| ------------------- | ------------------------------------- | ------------------------------------------ |
| Frontend served by  | Vite at :5173                         | SvelteKit Node sidecar at random port      |
| Hot reload          | Yes (Vite HMR)                        | No                                         |
| API routes served by| Vite dev middleware                   | The Node sidecar                           |
| Cargo profile       | debug                                 | release                                    |
| Code path           | `cfg!(debug_assertions)` branch       | else branch in `src-tauri/src/lib.rs`      |
| Sidecar runs        | No                                    | Yes                                        |

This split is intentional: dev iterates fast on a known-good
SvelteKit server; packaged mode validates the actual production
boot path. **A working `tauri dev` does NOT prove the packaged
build will work.** That's why Task 04 exists.

## Where dev-only behaviour lives

Search for `cfg!(debug_assertions)` in `src-tauri/src/lib.rs`. Any
code under that flag runs only in `tauri dev`. Today this is:

- The `tauri-plugin-log` registration.
- The "skip the sidecar" branch.

If you ever ship a feature that should behave the same in dev and
release, do not put it under that flag.

## Why hot-reload "just works"

SvelteKit + Vite handles HMR internally. The Tauri WebView is a
generic Chromium / WebKit surface and has no idea it's being
served by Vite — it sees a regular HTTP server with WebSocket-based
HMR. Editing files triggers Vite's diff, the WebSocket pushes the
patch to the WebView, the WebView re-renders. Tauri is invisible
to this loop.
