# Task 06 — Smoke Test the Installer

**Goal:** Walk through the actual end-user journey on a clean
machine: install, launch, create a project, write a scene, quit,
relaunch, confirm data persists. This is the only test that proves
the entire stack — installer, sidecar, SQLite, app-data path,
keyring — works end-to-end.

## Why You Need This

Unit and integration tests cover ~600 cases but every one of them
runs in process, in dev mode, against in-memory or temp-dir
filesystems. The packaged-app behaviour (resource resolution,
permissions, OS app-data path, sidecar lifecycle) is genuinely
distinct and only validated here.

This is also the acceptance criterion in stage-008's stage.md:
> "download installer → install → launch → no terminal/Node/pnpm/
> localhost visible → create project → reopen app → data persists".

## Prerequisites

- Task 04 (packaged build) complete.
- Ideally: a "clean" machine without Novellum dev artifacts. A
  fresh user account on your dev box is acceptable.

## Steps

1. **Install.**
   - macOS: open the `.dmg`, drag `Novellum.app` to `/Applications`.
   - Windows: run the `.msi`, follow the wizard.
   - Linux: `chmod +x Novellum.AppImage && ./Novellum.AppImage` or
     `dpkg -i novellum_*.deb`.

2. **First launch.** Confirm:
   - Window opens at 1400×900 titled "Novellum".
   - No terminal window appears (release builds set
     `windows_subsystem = "windows"` to suppress this).
   - URL bar (if visible) does NOT show `localhost:5173` — should
     be `127.0.0.1:<random-port>`.
   - Activity Monitor / Task Manager shows two processes: the
     Rust binary AND a Node child process.

3. **Create a project + write content.**
   - Click "New Project". Name it `SmokeTest YYYY-MM-DD`.
   - Open the editor. Type a scene of at least 100 words.
   - Wait 5 seconds. Confirm SaveStatus shows "Saved · Xs ago".
     This validates the autosave path from plan-017 stage-007
     phase-003.

4. **Verify data is on disk at the OS-correct path.**

   - **macOS:** `~/Library/Application Support/Novellum/`
   - **Windows:** `%APPDATA%\Novellum\`
   - **Linux:** `~/.local/share/Novellum/`

   Expected files:
   - `novellum.db` (plus `novellum.db-wal` / `novellum.db-shm`
     while SQLite is in WAL mode — all three together are the
     database).
   - **No** `credentials.json` — desktop builds route credentials
     to the OS keyring (see Task 07). If `credentials.json` is
     present here on a packaged build, file a bug against
     `src/lib/server/credentials/select-secure-store.ts`.

5. **Force-quit and relaunch.**

   ```bash
   # macOS
   killall Novellum
   killall node-aarch64-apple-darwin
   ```

   Then re-open from Applications. Confirm:
   - The smoke-test project still exists.
   - The scene content is intact.
   - SaveStatus shows "Saved" without you typing anything.

6. **Pull-the-plug recovery.** Open the editor, type "uncommitted
   change xyz". Within 200 ms (autosave debounce), force-kill:

   ```bash
   killall -9 Novellum
   killall -9 node-aarch64-apple-darwin
   ```

   Relaunch. The RecoveryPrompt (plan-017 stage-007 phase-004)
   should appear offering to restore the unsaved draft. Click
   Restore. Confirm "uncommitted change xyz" is back.

7. **Sidecar cleanup.** Close the window normally. Wait 5 seconds.
   Then:

   ```bash
   pgrep -f node-aarch64
   pgrep -f novellum
   ```

   Both should return no PIDs. If a Node child remains, the
   `RunEvent::Exit` handler in `src-tauri/src/lib.rs` is not
   firing — file a bug.

## Done When

All six steps pass on a clean install. Move to
[Task 07 — Verify Keyring Integration](../task-07-verify-keyring/task.md).
