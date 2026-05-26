# Task 05 — Capture Empirical Measurements

**Goal:** Validate the Tauri-vs-Electron decision (recorded in
`stage-008-desktop-packaging/evidence/packaging-decision-2026-04-29.md`)
with real numbers from a packaged build. The decision doc explicitly
calls out an escape clause: if measurements miss the targets,
revert to Electron and document the reversal.

## Why You Need This

Plan-017 stage-008 phase-001 chose Tauri based on architectural fit,
not measured performance. The decision doc commits to capturing
five concrete numbers from a packaged build. Without them, the
decision is unfalsifiable and we cannot honestly report progress
to stakeholders.

## Targets

- **Cold start (window opens)** — target ≤ 1.5 s. Competitive with
  Notion / Obsidian.
- **Sidecar boot (port live)** — target ≤ 800 ms. Must stay hidden
  behind cold-start UX.
- **`/api/db` p50 latency** — target ≤ 5 ms. Local SQLite baseline.
- **Idle memory** — target ≤ 250 MB. Acceptable on 8 GB machines.
- **Release binary** — target ≤ 30 MB without bundled Node, ≤ 100 MB
  with bundled Node. Distribution friction.

If any number misses badly (e.g. cold start > 3 s, idle memory
> 500 MB), pause and consult the decision doc's escape clause.

## Steps

1. **Confirm Task 04 is complete** — you need a packaged build.

2. **Cold start.** Quit the app fully. Launch via Finder /
   Start Menu (NOT via terminal — terminal launch is faster). Use
   a stopwatch from "click Open" to "window content visible".
   Repeat 5 times, take the median.

3. **Sidecar boot.** Already instrumented. `Sidecar::spawn` emits

   ```text
   sidecar: ready on http://127.0.0.1:<port> after <N> ms (node=<path>)
   ```

   to **stderr** via `eprintln!` (not the `log` crate — the
   `tauri-plugin-log` registry is dev-only, and the measurement
   has to survive in release builds). Read it directly:

   - **macOS:** open Console.app, filter Process = `Novellum`,
     search for `sidecar: ready`. The trailing `<N> ms` is the
     boot duration measured from `Sidecar::spawn` entry to the
     port-ready check.
   - **Windows:** release builds set
     `windows_subsystem = "windows"`, which detaches stderr from
     any console. To capture the line, launch the installed
     `novellum.exe` from a `cmd.exe` window — stderr re-attaches
     for that session — and read the line as it prints. Tauri's
     own logger (in `%APPDATA%\Novellum\logs\`) does **not**
     contain this line; `eprintln!` bypasses it on purpose.
   - **Linux:** run the AppImage / `.deb` binary from a terminal
     so stderr is visible. Same caveat as Windows — `~/.local/share/Novellum/logs/`
     does not contain this line.

   No rebuild necessary — the line ships in release builds.

4. **`/api/db` p50.** With the app running, open the WebView
   DevTools console:

   ```js
   const samples = [];
   for (let i = 0; i < 100; i++) {
     const t0 = performance.now();
     await fetch('/api/db/projects').then(r => r.json());
     samples.push(performance.now() - t0);
   }
   samples.sort((a, b) => a - b);
   console.log('p50', samples[50], 'p95', samples[95]);
   ```

   Replace `/api/db/projects` with whatever read endpoint exists.

5. **Idle memory.** Let the app sit for 2 minutes after launch with
   no user activity. Then:

   - macOS: Activity Monitor → search "Novellum" → sum the Memory
     column for the Rust binary AND the Node sidecar.
   - Windows: Task Manager → Details tab → Mem (private working
     set) for `novellum.exe` + `node-x86_64-pc-windows-msvc.exe`.

6. **Binary size.**

   ```bash
   ls -lh src-tauri/target/release/bundle/dmg/*.dmg
   du -sh src-tauri/target/release/bundle/macos/Novellum.app
   ```

7. **Record results.**

   Create `dev-docs/plans/plan-017-v1-trust-foundation/stage-008-desktop-packaging/evidence/measurements-YYYY-MM-DD.md`
   with the measurements, your hardware spec, and the build commit
   SHA (`git rev-parse HEAD`).

   Template:

   ```markdown
   # Empirical Measurements — Tauri Packaged Build

   **Date:** YYYY-MM-DD
   **Build:** <commit SHA>
   **Hardware:** <model, RAM, OS version>

   | Metric              | Target   | Measured | Pass/Fail |
   | ------------------- | -------- | -------- | --------- |
   | Cold start          | ≤ 1.5 s  | X.X s    | ✅/❌     |
   | Sidecar boot        | ≤ 800 ms | X ms     | ✅/❌     |
   | /api/db p50         | ≤ 5 ms   | X.X ms   | ✅/❌     |
   | Idle memory         | ≤ 250 MB | X MB     | ✅/❌     |
   | .dmg size           | ≤ 100 MB | X MB     | ✅/❌     |

   **Verdict:** PASS / FAIL with notes.
   ```

8. **If verdict is FAIL on 2+ metrics**, open the decision doc's
   escape clause and start a parallel Electron spike. Don't ship
   the Tauri build to users until either (a) the regressions are
   fixed or (b) Electron is chosen as the V1 path.

## Done When

The measurements file exists, is checked into the repo (or its
gitignored equivalent), and the verdict is PASS or has a documented
remediation plan.
