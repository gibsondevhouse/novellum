# Task 04 — Checklist (with how-to)

Each item lists exactly **what to run** and **what success looks
like**. macOS commands are the default; Windows / Linux equivalents
are noted where they differ.

---

### 1. Run the build

**Run:**

```bash
pnpm desktop:build
```

**Expect:** Last lines of output mention `Bundling Novellum.app`
and `Bundling Novellum_0.0.1_aarch64.dmg`. Exit code 0.

- [x] `pnpm desktop:build` finished successfully

---

### 2. Confirm the artifact exists

**Run:**

```bash
ls -lh src-tauri/target/release/bundle/dmg/
ls -lh src-tauri/target/release/bundle/macos/
```

**Expect:**
- A `Novellum_0.0.1_aarch64.dmg` file (~40–50 MB).
- A `Novellum.app` directory (~130 MB).

- [x] `.dmg` and `.app` both present

---

### 3. Verify the bundled Node sidecar is inside the .app

**Run:**

```bash
ls -lh src-tauri/target/release/bundle/macos/Novellum.app/Contents/MacOS/
```

**Expect:** Two executables — `novellum` (~10 MB Rust binary) and
`node` (~110–120 MB bundled Node 22).

- [x] `Contents/MacOS/novellum` present
- [x] `Contents/MacOS/node` present (the bundled sidecar)

---

### 4. Verify the SvelteKit server bundle is inside the .app

**Run:**

```bash
ls src-tauri/target/release/bundle/macos/Novellum.app/Contents/Resources/_up_/build/
```

**Expect:** `index.js`, `handler.js`, `env.js`, `client/`, `server/`.

- [x] `_up_/build/index.js` present (sidecar entry point)
- [x] `_up_/build/handler.js` present
- [x] `_up_/build/env.js` present
- [x] `_up_/build/client/` present
- [x] `_up_/build/server/` present
- [x] `_up_/build/shims.js` present

---

### 5. Record the .app size for Task 05

**Run:**

```bash
du -sh src-tauri/target/release/bundle/macos/Novellum.app
ls -lh src-tauri/target/release/bundle/dmg/Novellum_0.0.1_aarch64.dmg
```

**Expect:** Two numbers. Write them down — Task 05 needs them.

- [x] `.app` size recorded: 133M
- [x] `.dmg` size recorded: 41M

---

### 6. Launch the unsigned .app

**First time only:** macOS Gatekeeper will refuse with "cannot be
opened because Apple cannot check it for malicious software".

**Run:**

```bash
open src-tauri/target/release/bundle/macos/Novellum.app
```

If Gatekeeper blocks it: in **Finder**, navigate to
`src-tauri/target/release/bundle/macos/`, right-click
`Novellum.app`, choose **Open**, then click **Open** in the
dialog. (One-shot per build.)

On macOS Sequoia (15+) you may need to additionally go to
**System Settings → Privacy & Security** and click "Open Anyway"
under the Novellum warning.

**Expect:** A window titled "Novellum" sized 1400×900 opens. The
content loads (might be the project list / landing page).

- [x] Window opened successfully
- [x] Title bar shows "Novellum"
- [x] Window size looks like 1400×900

---

### 7. Confirm the sidecar is serving (not Vite)

The packaged build runs the bundled Node sidecar on a random
local port — **not** `localhost:5173`.

**How to check:**

1. With the app focused, open the **View** menu in the menu bar
   and click **Toggle Developer Tools** (or press
   `Cmd + Option + I` on macOS / `Ctrl + Shift + I` on Win/Linux).
2. The DevTools panel should dock to the side of the window.
3. In the DevTools **Console** tab, paste:

   ```js
   window.location.href
   ```

**Expect:** A string like `http://127.0.0.1:53847/projects` (or
similar random port). It must **not** be `http://localhost:5173`.

- [x] Console shows `http://127.0.0.1:<random-port>/...`

---

### 8. Confirm a known API route returns 200

In the same DevTools Console, paste:

```js
await fetch('/api/db/projects').then(r => r.status)
```

**Expect:** `200`.

- [x] `/api/db/projects` returned 200

---

### 9. Quit the app and confirm no orphan processes

Close the window normally (red circle, or `Cmd + Q`). Wait 5 seconds.

**Run:**

```bash
pgrep -fl novellum
pgrep -fl 'node.*build/index.js'
```

**Expect:** Both commands return nothing (no PIDs). If either
prints a PID, the cleanup handler in `src-tauri/src/lib.rs`
isn't firing — file a bug.

- [x] No `novellum` process remaining
- [x] No `node` sidecar process remaining

---

## Done

If all boxes are ticked, Task 04 is complete. Move on to
[Task 05 — Capture Empirical Measurements](../task-05-capture-measurements/task.md).
