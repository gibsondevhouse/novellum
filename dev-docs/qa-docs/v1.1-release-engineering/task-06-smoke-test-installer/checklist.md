# Task 06 — Smoke Test the Installer (lesson-style checklist)

You're going to live the end-user journey: install the `.dmg`,
launch the app like a real person would, write content, kill it,
relaunch, and prove the data survived. Each step starts with a
short **Why** so you understand what failure mode it's catching.

**Prereq:** Task 04 produced a working `.app` and `.dmg` at
`src-tauri/target/release/bundle/`.

---

### 1. Install on the target OS

**Why:** Every test before now ran the binary directly out of
the build folder. That skips Gatekeeper, skips the macOS install
flow, and skips the `/Applications`-vs-build-dir path resolution
that real users hit. Running once from `/Applications` proves
the bundle is genuinely portable, not "works on my machine
because it's still next to its build artefacts."

**Run:**

```bash
open src-tauri/target/release/bundle/dmg/Novellum_0.0.1_aarch64.dmg
```

A Finder window appears with `Novellum.app` and an `Applications`
shortcut. **Drag** `Novellum.app` onto the `Applications`
shortcut.

**Verify the install landed:**

```bash
ls -d /Applications/Novellum.app
```

Should print `/Applications/Novellum.app`. If it errors with
"No such file or directory", the drag didn't take — try again.

**Eject the DMG** when done (right-click the desktop icon →
Eject) so you're not running from the mounted image by accident.

- [x] App copied to `/Applications`
- [x] DMG ejected

---

### 2. First launch (Gatekeeper bypass)

**Why:** macOS's Gatekeeper blocks unsigned apps on first run by
default. We don't have an Apple Developer signature yet, so the
first launch needs the **right-click → Open** trick to whitelist
the bundle. After this once-only ritual, every future launch
is a normal double-click.

We're also watching for two specific failure signs:

- A Terminal/console window appearing alongside the app means
  the release binary wasn't built with `windows_subsystem =
  "windows"` (Tauri's default, but worth confirming).
- The URL showing `localhost:5173` means the bundle is somehow
  hitting your dev Vite server instead of the bundled sidecar
  — catastrophic for a "real" install.

**Steps:**

1. Open **Finder → Applications**.
2. **Right-click** `Novellum` (or two-finger click) → **Open**.
3. Click **Open** in the warning dialog.

**Expect:**

- A 1400×900 window titled "Novellum" appears.
- **No** standalone Terminal window appears behind it.
- The window content does **not** mention `localhost:5173`.

- [x] Window opens at 1400×900
- [x] No terminal/console window appears

---

### 3. Confirm the sidecar URL (not Vite)

**Why:** Belt-and-braces check that the running app is loading
from its bundled Node sidecar (`http://127.0.0.1:<random-port>`)
and not somehow latching onto a dev server. If you see `5173`
or `4173`, the sidecar didn't spawn and Tauri navigated to a
fallback URL instead — broken bundle.

**Steps:**

1. With the installed app focused, press `Cmd + Option + I`
   (or **View → Toggle Developer Tools**).
2. Click the **Console** tab.
3. Type:
   ```js
   window.location.href
   ```
4. Press Enter.

**Read the output:** A string like `"http://127.0.0.1:53847/"`.
The port is random per launch. **Not** `localhost:5173`.

- [x] Console shows `127.0.0.1:<port>`
- [x] Port is *not* 5173 or 4173

---

### 4. Confirm both processes are running

**Why:** Novellum is two processes — the Rust binary (window +
menu) and the Node sidecar (SQLite + API routes). If only the
Rust process is alive, the sidecar crashed silently and every
`/api/*` call will eventually time out. We want to see both
PIDs before we trust subsequent steps.

**Run** in a terminal:

```bash
pgrep -fl 'Novellum.app/Contents/MacOS/novellum'
pgrep -fl 'Novellum.app/Contents/MacOS/node'
```

**Read the output:** Each command prints a `<pid> <full-path>`
line. Two PIDs total — one for `novellum`, one for `node`.

If `node` returns nothing: sidecar didn't spawn. Quit the app,
re-launch from a terminal so stderr is visible, look for the
`sidecar: ready ...` line. If it's missing, file a bug
referencing [src-tauri/src/sidecar.rs](src-tauri/src/sidecar.rs).

- [x] `novellum` PID found
- [x] `node` PID found

---

### 5. Create a smoke-test project

**Why:** Up to this point we've only proved the shell runs.
Now we need to prove the full data path works end-to-end:
input → autosave debounce → `/api/db/scenes` → SQLite write →
SaveStatus updates. This is the single best bang-for-buck
manual test in the suite — if step 5 passes, ~90% of the user
workflow is healthy.

**Steps:**

1. Click **New Project**.
2. Name it `SmokeTest 2026-04-30` (today's date for traceability).
3. Open the editor on any scene.
4. Type **at least 100 words** of any content.
5. **Stop typing and wait 5 seconds.**

**Read the output:** The SaveStatus indicator (usually somewhere
on the editor toolbar) cycles `Unsaved → Saving... → Saved · Xs ago`.

If it sticks on "Unsaved" or shows an error: autosave is broken
in the packaged build. Open DevTools → Network tab and watch for
a failing `POST /api/db/...` request.

- [x] Project created
- [x] 100+ words typed
- [x] SaveStatus shows "Saved"

---

### 6. Verify data lives at the macOS-correct path

**Why:** Tauri/Node code resolves the app-data directory through
`resolveAppDataDirectory()` in
[src/lib/server/db/path.ts](src/lib/server/db/path.ts). On macOS
that should land at `~/Library/Application Support/Novellum/`.
If the database ends up next to the binary, in `/tmp`, or in the
project working directory, you've got a path-resolution bug that
will burn users on upgrade (their data disappears).

**Important note about file sizes:** SQLite runs in **WAL mode**.
Fresh writes are appended to `novellum.db-wal` and only periodically
checkpointed back into `novellum.db`. So immediately after step 5
the main `.db` file may still look small (10–20 KB) while your
actual data sits in the `-wal` sidecar. All three files
(`.db`, `.db-wal`, `.db-shm`) together are the database. See
[education.md](education.md) for the full explanation.

**Run:**

```bash
ls -lh "$HOME/Library/Application Support/Novellum/"
```

**Expect to see:**

- `novellum.db` — main database file.
- `novellum.db-wal` — write-ahead log (where step 5's writes live).
- `novellum.db-shm` — shared-memory index for the WAL.

You may also see:

- `snapshots/` — autosave scratch dir.
- (no `credentials.json` — desktop builds route credentials to
  the OS keyring; presence here means `select-secure-store.ts`
  fell back to the filesystem, which is a bug).

**Verify your writes actually landed** by counting rows directly
(this is the unambiguous check — it doesn't care which file the
bytes live in):

```bash
sqlite3 "$HOME/Library/Application Support/Novellum/novellum.db" \
  "SELECT COUNT(*) FROM scenes;"
```

**Read the output:** A number ≥ 1. If it's `0`, your step-5 writes
never reached SQLite — bug.

If `sqlite3` isn't installed (`command not found`), fall back to a
combined size check:

```bash
du -ch "$HOME/Library/Application Support/Novellum/novellum.db"* | tail -1
```

The `total` line should be ≥ 50 KB.

- [x] `novellum.db`, `novellum.db-wal`, `novellum.db-shm` all present
- [x] `SELECT COUNT(*) FROM scenes;` returns ≥ 1 (or combined size ≥ 50 KB)

---

### 7. Force-quit and relaunch — content persists

**Why:** Persistence under graceful quit is easy. Persistence
under force-quit is what catches "data is held in memory and
flushed on shutdown" bugs. SQLite with WAL mode (which we use)
should be durable after every committed transaction — but only
if our autosave actually `COMMIT`s instead of buffering.

**Steps:**

1. Force-kill everything Novellum:
   ```bash
   pkill -f 'Novellum.app/Contents/MacOS'
   ```
   (This catches both the Rust binary and the bundled `node`
   under `Contents/MacOS/` — won't touch unrelated Node processes.)
2. Wait 3 seconds.
3. Relaunch from `/Applications/Novellum`.

**Expect:**

- The `SmokeTest 2026-04-30` project is in the project list.
- Open it → the scene content from step 5 is intact, byte-for-byte.
- SaveStatus shows "Saved" without you typing anything new.

- [x] Project still present after relaunch
- [x] Scene content intact
- [x] No data lost

---

### 8. Pull-the-plug crash recovery

**Why:** Even with WAL durability, keystrokes inside the
**autosave debounce window** (currently `AUTOSAVE_DEBOUNCE_MS =
2000` ms — see
[src/modules/editor/services/autosave-types.ts](src/modules/editor/services/autosave-types.ts))
aren't in the database yet. They live only in the in-memory editor
state and — per plan-017 stage-007 phase-004 — in a
`localStorage` pending-draft entry. This step proves that when we
kill the app mid-keystroke, the RecoveryPrompt detects the
orphaned draft on next launch and offers to restore it.

If this step fails silently, every crash will quietly eat the
last paragraph the user typed. Worst-possible UX bug.

**Read this first — the timing trap:** if you wait longer than
2 seconds between your last keystroke and the kill, autosave
fires, the server text catches up, the localStorage entry is
cleared, and `inspectDraft()` correctly stays silent on relaunch.
That's a *successful save*, not a recovery failure. To exercise
the recovery path you need a divergence between localStorage and
the server. Two ways to guarantee that:

#### Option A — Race the debounce (organic)

1. Pre-type the kill command in a focused terminal:

   ```bash
   pkill -9 -f 'Novellum.app/Contents/MacOS'
   ```

   (Don't press Enter yet.)
2. In the editor, type `uncommitted change xyz`.
3. **Within 2 seconds** of your last keystroke, switch to the
   terminal and hit Enter.
4. Wait 3 seconds, then relaunch from `/Applications/Novellum`.

#### Option B — Forge a divergent draft (deterministic)

This bypasses the timing race and proves the recovery wiring
works regardless of how fast you can Alt-Tab.

> **Schema gotcha:** `readPendingDraft()` in
> [src/modules/editor/services/recovery-service.ts](src/modules/editor/services/recovery-service.ts)
> validates **all four** fields — `sceneId`, `projectId`, `text`,
> `savedAt` (ISO string). Drop or rename any of them and the
> entry is silently discarded → no prompt. Use the snippet below
> verbatim.
>
> **Where the prompt fires:** `inspectDraft()` only runs when the
> scene route mounts. Reopening the app to the project list is
> not enough — you must navigate back into the **same scene**
> for RecoveryPrompt to surface.

1. Open the editor on the scene you want to test. The URL is
   `/projects/<projectId>/editor/<sceneId>` — copy both IDs from
   the address bar (DevTools → top of the page → `window.location.pathname`).
2. Open DevTools → Console and run:

   ```js
   const sceneId = '<paste-sceneId-here>';
   const projectId = '<paste-projectId-here>';
   localStorage.setItem(
     'novellum:pending-draft:' + sceneId,
     JSON.stringify({
       sceneId,
       projectId,
       text: 'forged divergence xyz',
       savedAt: new Date().toISOString()
     })
   );
   ```

3. Confirm the entry stuck (still in the Console):

   ```js
   JSON.parse(localStorage.getItem('novellum:pending-draft:' + sceneId))
   ```

   Should print the object with all four fields.

4. Hard-quit:

   ```bash
   pkill -9 -f 'Novellum.app/Contents/MacOS'
   ```

5. Relaunch and **navigate back into the same scene** (project
   list → project → that exact scene). The prompt fires on scene
   mount, not on app launch.

**Expect:** A **RecoveryPrompt** dialog/banner appears offering
to restore the unsaved draft. Click **Restore**. The forged
string (or `uncommitted change xyz` from Option A) appears in
the editor.

**Interpreting outcomes:**

- Prompt appears + Restore works → PASS.
- No prompt **and** no divergent text in editor → you raced too
  slow in Option A. Retry, or use Option B.
- No prompt **but** localStorage still has a `novellum:pending-draft:*`
  entry that diverges from the server text → real bug, file it
  against `recovery-service.ts` / `RecoveryPrompt.svelte`.
- Prompt appears but Restore doesn't apply the draft → bug in
  `consumeDraft()` wiring.

Diagnostic snippet for the middle case:

```js
Object.keys(localStorage).filter(k => k.startsWith('novellum:pending-draft:'))
```

- [] RecoveryPrompt appeared on relaunch (Option A or B)
- [] Restore restored the divergent text

---

### 9. Clean shutdown — no orphan processes

**Why:** When the user presses `Cmd + Q`, the Rust process must
explicitly drop the `SidecarState` so its `Drop` impl kills the
child Node process. If that handler doesn't fire, you'll
accumulate orphan `node` processes every time the user quits and
re-opens the app — eventually saturating their CPU/RAM. We
caught and fixed this exact bug while building Task 04; this is
the regression check.

**Steps:**

1. With Novellum running, press `Cmd + Q` (or **Novellum →
   Quit Novellum**).
2. Wait 5 seconds.
3. Run:
   ```bash
   pgrep -fl 'Novellum.app/Contents/MacOS/novellum'
   pgrep -fl 'Novellum.app/Contents/MacOS/node'
   ```

**Expect:** Both commands print **nothing** (exit code 1).

If either prints a PID, the `RunEvent::Exit` handler in
[src-tauri/src/lib.rs](src-tauri/src/lib.rs) isn't dropping the
sidecar. Kill the orphan with the printed PID and file a bug.

- [x] No `novellum` process after `Cmd+Q`
- [x] No bundled `node` process after `Cmd+Q`

---

## Done

All nine sections green = the packaged app behaves correctly
end-to-end on macOS. Move to
[Task 07 — Verify Keyring](../task-07-verify-keyring/task.md).
