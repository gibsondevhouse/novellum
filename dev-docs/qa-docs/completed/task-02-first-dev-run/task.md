# Task 02 — First Dev Run

**Goal:** Boot Novellum inside the Tauri shell with `pnpm desktop:dev`,
confirm the WebView loads the SvelteKit app, and verify hot-reload
works. This is the cheapest way to prove the shell is wired
correctly before attempting a packaged build.

## Why You Need This

`tauri dev` does not build a full installer. It runs Cargo in
`debug` mode and hands the Vite dev server to the WebView via the
`devUrl` in `src-tauri/tauri.conf.json` (`http://localhost:5173`).
This skips the sidecar entirely (per `src-tauri/src/lib.rs`'s
`debug_assertions` branch) and gives you a fast feedback loop that
catches Cargo, Rust, and platform issues without paying the cost of
`tauri build`.

## Steps

1. **Make sure no other dev server is on :5173.** Vite will silently
   pick a different port if 5173 is taken; `tauri dev` will then load
   nothing.

   ```bash
   lsof -iTCP:5173 -sTCP:LISTEN || echo "port is free"
   ```

2. **Run the dev shell.**

   ```bash
   pnpm desktop:dev
   ```

   First run downloads Tauri's Cargo dependencies (~1 GB, several
   minutes). Subsequent runs are fast.

3. **What you should see:**
   - A Tauri window titled "Novellum" sized 1400×900.
   - The Novellum landing page rendered inside the WebView.
   - Hot-reload works: edit `src/routes/+page.svelte` and the change
     appears in the WebView within ~1 second.

4. **Verify dev tools.** Right-click the WebView → "Inspect Element"
   on macOS / Linux. On Windows the shortcut is **F12**. The
   DevTools panel should attach. This proves the WebView is
   genuinely Chromium-class (WebView2 on Windows, WebKit on macOS).

5. **Verify the SvelteKit /api routes work.** In the WebView's
   address bar (Tauri's debug mode shows it) or DevTools console:

   ```js
   await fetch('/api/health').then(r => r.text())
   ```

   You should see a non-error response (or whatever your
   `/api/health` returns; if it doesn't exist yet, try a route you
   know exists from `src/routes/api/`).

6. **Quit cleanly.** Close the window. Confirm `pnpm desktop:dev`'s
   terminal exits cleanly. If it hangs, that is a Tauri-side bug,
   not a sidecar bug — the sidecar isn't running in dev mode.

## Done When

The Tauri window opens, hot-reload works, devtools attach, and a
known `/api` route responds. Move to
[Task 03 — Bundle the Node Runtime](../task-03-bundle-node-runtime/task.md).

## Common Failures

- **"failed to compile cargo build at: Linking with `cc` failed"**:
  platform build prereqs missing — go back to Task 01.
- **WebView shows a white screen and console reports
  "Failed to load resource: net::ERR_CONNECTION_REFUSED"**: Vite
  isn't running, or it's on a different port than 5173. Check the
  terminal running `pnpm desktop:dev` for the actual Vite port.
- **macOS Gatekeeper blocks the unsigned debug binary** on first
  run: right-click the app in `src-tauri/target/debug/` and select
  Open. This is one-shot per debug build.
