# Task 06 — Education

## Why a manual smoke test is irreplaceable

Every automated test in `tests/` runs in:

- The dev process tree (Vitest worker spawned by pnpm).
- A jsdom or Node environment, never a real WebView.
- A fresh temp directory, never the OS app-data path.
- With every dependency available on PATH.

The packaged installer drops all of that:

- Different process boundaries (sidecar is a separate child).
- Real Chromium / WebKit, not jsdom.
- Real OS app-data resolution.
- Bundled Node binary (when Task 03 is done) instead of system Node.
- Real `tauri-plugin-keyring` instead of an in-memory shim.

A bug in any of those layers passes the unit suite and shows up
only here.

## What the app-data path actually resolves to

The path is computed by `src/lib/server/db/path.ts`, which uses
the constant `APP_DIRNAME = 'Novellum'` (note: the **product
name**, not the bundle identifier `com.gibsondevhouse.novellum`
from `tauri.conf.json`) as the directory name under each OS's
standard location:

- macOS: `~/Library/Application Support/Novellum/`
- Windows: `%APPDATA%\Novellum\` (which is
  `C:\Users\<user>\AppData\Roaming\Novellum\`)
- Linux: `$XDG_DATA_HOME/Novellum/` or
  `~/.local/share/Novellum/`

Inside that directory:

- `novellum.db` — the SQLite database for the user's projects
  (plus its `-wal` and `-shm` siblings while WAL is active).
- `credentials.json` — only present when the keyring is unavailable
  (i.e. on web/server). Inside the desktop app, credentials live in
  the OS keyring; this file should NOT exist on a desktop install.
  If you see it, Task 07 has uncovered a real bug.

## What the pull-the-plug test validates

Plan-017 stage-007 phase-004 added `recovery-service.ts`. Every
keystroke writes a `pending-draft:<sceneId>` entry to localStorage.
Successful saves clear the entry. On boot, `inspectDraft` checks
each entry against the server-side scene text:

- If they match: clear the entry (the save did make it before crash).
- If they diverge: surface the entry to RecoveryPrompt.

Force-killing the app between keystroke and autosave window leaves
a divergent entry. Relaunch must show RecoveryPrompt. If it doesn't,
either:

- localStorage isn't persisting (browser storage misconfiguration in
  the WebView).
- The autosave write is somehow synchronous with the kill.
- `inspectDraft` isn't running on boot.

Investigate via DevTools console:

```js
Object.keys(localStorage).filter(k => k.startsWith('novellum:pending-draft:'))
```

Should show the orphaned entry pre-Restore.

## Why orphan-process check matters

`std::process::Child` does NOT auto-kill on parent exit on Unix. If
the Rust shell crashes, the child Node process keeps running and
keeps holding the SQLite WAL lock. Next launch fails with "database
is locked".

Our `Drop` impl on `Sidecar` calls `child.kill()` explicitly, but
that only runs on graceful shutdown. The `RunEvent::ExitRequested`
and `RunEvent::Exit` handler in `lib.rs` ensures we drop the state
even on user-initiated quit. The orphan check verifies this works.

---

## Field-notes from the first real smoke run

### "novellum.db is only 14 KB but my data is there"

This is **expected, not a bug** — but the checklist's "≥ 50 KB"
threshold is misleading and will be corrected.

We open SQLite in **WAL mode** (Write-Ahead Logging). In WAL mode,
new transactions don't immediately rewrite the main database file.
They get appended to a sidecar file called `novellum.db-wal`, and
the main `.db` file is only updated when SQLite **checkpoints**
the WAL — which happens automatically when the WAL hits ~1000
pages (~4 MB), on `PRAGMA wal_checkpoint`, or when the last
connection closes cleanly.

So immediately after typing 100 words, you'll see something like:

```text
novellum.db        376K   ← schema + earlier checkpointed data
novellum.db-wal     89K   ← your fresh writes live here
novellum.db-shm     32K   ← shared-memory index for the WAL
```

All three files together are the database. A reader (including
us) sees the union of `.db` + `.db-wal`. Your data is durable as
soon as the WAL `fsync`s, even though `.db` looks tiny.

**Correct way to verify writes landed:**

```bash
ls -lh "$HOME/Library/Application Support/Novellum/"
# Look at .db + .db-wal combined size, OR:
sqlite3 "$HOME/Library/Application Support/Novellum/novellum.db" \
  "SELECT COUNT(*) FROM scenes;"
```

The SQL count is the unambiguous truth. The file size threshold
in step 6 will be replaced with a row-count check or a
"`.db` + `.db-wal` ≥ 50 KB" check.

### "RecoveryPrompt didn't appear, but my content survived"

Also expected — and again the checklist had a wrong number.

The checklist says "**Within 200 ms** … force-kill". The actual
autosave debounce is **2000 ms** (`AUTOSAVE_DEBOUNCE_MS = 2000`
in [src/modules/editor/services/autosave-types.ts](src/modules/editor/services/autosave-types.ts)).
By the time you finished typing `uncommitted change xyz`, switched
to a terminal, and ran `pkill`, more than 2 s had elapsed —
autosave fired, the `POST /api/db/scenes` succeeded, the WAL
flushed, and localStorage's pending-draft entry was cleared.

On relaunch, `inspectDraft()` ran with this logic
([recovery-service.ts](src/modules/editor/services/recovery-service.ts)):

```ts
if (draft.text === currentServerText) {
    clearPendingDraft(sceneId);
    return null;          // ← no prompt
}
```

There was no divergence to surface, so RecoveryPrompt correctly
stayed quiet. **The recovery system is working — your test just
didn't trigger it.**

To actually exercise RecoveryPrompt you need to kill *during*
the 2-second debounce window. Reliable repro:

1. Open DevTools → Console.
2. Run:

   ```js
   localStorage.setItem(
     'novellum:pending-draft:' + '<paste-sceneId-here>',
     JSON.stringify({ sceneId: '<id>', text: 'forged divergence', updatedAt: Date.now() })
   )
   ```

3. Hard-quit and relaunch. RecoveryPrompt **will** appear because
   the LS draft now diverges from the server text, regardless of
   debounce timing.

Or, lower-tech: type, then immediately `pkill -9` from a terminal
that's already focused, with the kill command pre-typed and ready.
Aim for under 2000 ms total.

### Summary of checklist fixes triggered by this run

- **Step 6** "≥ 50 KB" → replace with row-count via `sqlite3`, or
  combined `.db + .db-wal` size, plus a one-line note that WAL
  mode keeps fresh writes in the sidecar file.
- **Step 8** "Within 200 ms" → change to "Within 2 seconds" and
  add the DevTools/localStorage forging trick as the deterministic
  repro path. Also note that *no prompt + content present* is the
  expected outcome of a slow kill, not a recovery failure.

### Why the first localStorage-forge attempt produced no prompt

The first version of the Option B snippet wrote
`{ sceneId, text, updatedAt }`. `readPendingDraft()` requires
`{ sceneId, projectId, text, savedAt }` — strictly four strings,
`savedAt` being an ISO timestamp:

```ts
if (
    typeof parsed?.sceneId !== 'string' ||
    typeof parsed?.projectId !== 'string' ||
    typeof parsed?.text !== 'string' ||
    typeof parsed?.savedAt !== 'string'
) {
    return null;
}
```

Any missing or mistyped field → the parser returns `null`, the
draft is treated as absent, `inspectDraft()` returns `null`, no
prompt. The schema is intentionally strict so corrupt or stale
entries can't trigger spurious prompts on launch.

There's also a *where* gotcha worth internalising: the prompt
fires inside the scene route's `$effect` (see
[src/routes/projects/[id]/editor/[sceneId]/+page.svelte](src/routes/projects/%5Bid%5D/editor/%5BsceneId%5D/+page.svelte)),
so it only surfaces when you navigate into the same scene the
draft belongs to. Relaunching the app to the project list won't
show anything — that's by design (we don't want to interrupt the
hub with prompts for scenes the user isn't even looking at).
