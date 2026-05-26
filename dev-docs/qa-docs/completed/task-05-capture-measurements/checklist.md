# Task 05 — Capture Empirical Measurements (lesson-style checklist)

You're going to take five real measurements from your packaged
build and decide whether Tauri actually meets the targets we set
in plan-017. Each step starts with a short **Why** so you know
what you're measuring before you measure it.

**Prereq:** Task 04 done — the `.app` exists at
`src-tauri/target/release/bundle/macos/Novellum.app`.

---

### 1. Record your hardware + the build commit

**Why:** Performance numbers are meaningless without context. A
"1.4 s cold start" on an M3 Max is very different from the same
number on an M1 Air. You're also pinning the build commit so
anyone (including future you) can reproduce these numbers from
the same source.

**Run:**

```bash
sw_vers
sysctl hw.model hw.memsize
git rev-parse HEAD
```

**Read the output:**

- `sw_vers` → ProductName + ProductVersion (e.g. macOS 14.5).
- `hw.model` → board identifier (e.g. `Mac15,9`). Record verbatim.
- `hw.memsize` → bytes of RAM. Divide by `1073741824` to get GB.
  E.g. `17179869184 / 1073741824 = 16` → **16 GB**.
- `git rev-parse HEAD` → the 40-char SHA of the commit you built.

**Record:**

- macOS version: 26.3.1
- Mac model: M4 Air
- RAM: 16 GB Unified Memory
- Build commit SHA: d1b5ef0c4fc7f15ce0c36f7a4f12671064ee499c

- [x] Hardware spec recorded
- [x] Build commit SHA recorded

---

### 2. Cold start — 5 stopwatch samples

**Why:** "Cold start" = how long from clicking the icon to seeing
usable content, with nothing of the app already in memory. This
is the user's first impression and the single biggest predictor
of perceived snappiness. Notion / Obsidian / VS Code land around
1–2 s on modern hardware; we want to feel competitive.

**Why a stopwatch?** You're measuring user-perceived time, not
CPU time. There's no reliable instrumented timer for "the window
has paint stable enough for me to read".

**Why launch from Finder, not Terminal?** Terminal launches skip
the launch-services warm-up (icon caching, Gatekeeper, Launch
Services registration), giving artificially fast numbers.
Finder/Spotlight is what real users will use.

**Steps for each sample:**

1. Fully quit any running copy:
   ```bash
   killall Novellum 2>/dev/null
   ```
2. Open the **Stopwatch** on your phone (or macOS's Clock app).
3. In **Finder**, navigate to the bundle folder. Have a finger
   ready on the stopwatch start button.
4. **Simultaneously** double-click `Novellum.app` AND start the
   stopwatch.
5. **Stop** the stopwatch when the window content is readable
   (not just an empty white frame — wait for the project list
   or landing UI).
6. Press `Cmd+Q` to fully quit. Record the time.

Repeat 5 times.

**Median, not mean:** with 5 samples, sort them and take the
middle one (3rd value). Median ignores outlier spikes from
background noise — much fairer than averaging.

**Target:** median ≤ 1.5 s.

| Sample | Seconds |
| ------ | ------- |
| 1      | 1.21 |
| 2      | 1.11 |
| 3      | 1.06 |
| 4      | 1.11 |
| 5      | 1.11 |
| **Median** | 1.11 |

- [x] 5 cold-start samples taken; median recorded

---

### 3. Sidecar boot time

**Why:** The "sidecar" is the bundled Node process that serves
SvelteKit's `/api/*` routes. The Rust window can paint instantly,
but every API call returns errors until the sidecar's TCP socket
is listening. Sidecar boot is therefore a ceiling on real
interactivity. We want it well under cold-start so its delay
hides behind the loading paint.

**Why this is easy:** `Sidecar::spawn`
([src-tauri/src/sidecar.rs](../../../src-tauri/src/sidecar.rs))
prints `sidecar: ready on <url> after <N> ms (node=<path>)` to
**stderr** via `eprintln!` the moment the port is reachable.
`eprintln!` is used instead of `log::info!` so the line ships in
release builds (the `tauri-plugin-log` registry is dev-only).
The sidecar's stderr is inherited, so you can read this from a
terminal-launched run.

**Steps:**

1. Quit any running copy: `killall Novellum 2>/dev/null`.
2. Launch from terminal so stderr/stdout shows up directly:
   ```bash
   src-tauri/target/release/bundle/macos/Novellum.app/Contents/MacOS/novellum
   ```
3. Watch the terminal. Within ~1 s of launch you'll see a line like:
   ```
   sidecar: ready on http://127.0.0.1:53847 after 412 ms (node=...)
   ```
4. The number you want is `412` — milliseconds from
   `Sidecar::spawn` entering to the port being open.
5. Press `Cmd+Q` to quit (or `Ctrl+C` in the terminal).

**Target:** ≤ 800 ms.

**Record:** sidecar boot ms: 108 md

- [x] Sidecar boot time recorded

---

### 4. /api/db p50 latency

**Why:** Every keystroke that triggers autosave, every project
list load, every continuity check fires `/api/db/*` requests. If
those are slow, the whole app feels laggy regardless of how fast
the UI renders. We measure the **p50** (median of 100 samples)
because:

- A single sample is noise.
- The mean is skewed by GC pauses and outliers.
- p50 represents what the typical user actually experiences.

We also record **p95** (95th percentile) — the worst-case stalls.
If p50 = 4 ms but p95 = 80 ms, every 20th keystroke feels janky.

**Why a 5 ms target?** SQLite is local — no network, no IPC out
of process (better-sqlite3 is loaded into the sidecar itself).
5 ms is a generous ceiling that includes the HTTP round-trip on
localhost.

**Steps:**

1. With the packaged app running, open the **View** menu →
   **Toggle Developer Tools** (or press `Cmd+Option+I`).
2. Click the **Console** tab inside DevTools.
3. Paste this exactly (Safari's console doesn't allow
   top-level `await`, so we wrap it in an async IIFE):
   ```js
   (async () => {
     const samples = [];
     for (let i = 0; i < 100; i++) {
       const t0 = performance.now();
       await fetch('/api/db/projects').then(r => r.json());
       samples.push(performance.now() - t0);
     }
     samples.sort((a, b) => a - b);
     console.log('p50', samples[50].toFixed(2), 'ms', '|',
                 'p95', samples[95].toFixed(2), 'ms');
   })();
   ```
4. Press Enter. Wait ~1 s.

> The `Refused to connect to ipc://...` and `Command
> plugin:webview|internal_toggle_devtools not allowed by ACL`
> warnings are harmless noise — Tauri's internal devtools
> shortcut tries to fire alongside our menu handler and gets
> blocked by CSP. Our Rust-side `window.open_devtools()` is what
> actually opened the panel. Ignore them.

**Read the output:** Two numbers in milliseconds, e.g.
`p50 2.84 ms | p95 6.12 ms`.

**Target:** p50 ≤ 5 ms.

**Record:**

- p50: 1.00 ms
- p95: 2.00 ms

- [x] /api/db p50 measured and recorded

---

### 5. Idle memory at T+2 minutes

**Why:** Cold-start memory is misleading — apps allocate
aggressively during startup and then GC settles. Idle memory at
2 minutes is what your app actually costs a user keeping it
open. On 8 GB machines (still common), every 100 MB matters.

**Why two processes?** Novellum is one product but two OS
processes:

- `novellum` — the Rust binary that owns the window. Small.
- `node` — the bundled SvelteKit sidecar. Larger, because it
  loads better-sqlite3, the SvelteKit handler graph, etc.

The combined number is what users feel. The split tells us
where to optimise if we miss target.

**Steps:**

1. `killall Novellum 2>/dev/null`
2. Launch the app fresh from Finder.
3. **Don't touch the app for 2 minutes.** Don't even hover. Set
   a real timer — humans always under-estimate this.
4. Open **Activity Monitor** (Spotlight → "Activity Monitor").
5. Click the **Memory** tab.
6. Type `Novellum` in the search box.

**Read the output:** You'll see several rows. WebKit on macOS
splits one window into multiple helper processes:

- `Novellum` — the Rust binary (main process).
- `Novellum Graphics and Media` — GPU/media helper.
- `Novellum Networking` — network helper.
- `http://127.0.0.1:<port>` — the WebKit **WebContent** process
  (macOS labels it with the URL it's rendering, not "Novellum").
  This is part of the Rust/Tauri stack, *not* the sidecar.
- `node` — the actual SvelteKit sidecar.

Add the four Rust/WebKit rows for the Rust total, then add the
`node` row separately, then sum both for the combined number.

**Target:** combined ≤ 250 MB.

**Record:**

- Rust + WebKit helpers RAM: 96.3 MB
  (Novellum 32.2 + Graphics & Media 11.8 + Networking 9.8 + WebContent 42.5)
- Node sidecar RAM: 26.8 MB
- **Combined**: 123.1 MB

- [x] Idle memory recorded

---

### 6. Bundle size (already captured in Task 04)

**Why:** Distribution friction. A 200 MB download discourages
casual installs; a 50 MB one feels routine. The current 41 MB
.dmg is excellent for an app that bundles its own Node runtime —
Electron-equivalent shells routinely ship at 80–120 MB.

Copy the values you wrote in Task 04 step 5:

- `.app` size: 145 MB
- `.dmg` size: 45 MB

**Targets:** `.app` ≤ ~150 MB, `.dmg` ≤ 100 MB.

- [x] Bundle sizes copied from Task 04

---

### 7. Write the evidence file

**Why a file?** This is a permanent commitment. Future-you (and
anyone reviewing the V1 release) needs to see numbers, hardware,
and a verdict, all dated. Terminal output isn't auditable.

**Run:**

```bash
DATE=$(date +%Y-%m-%d)
mkdir -p dev-docs/plans/plan-017-v1-trust-foundation/stage-008-desktop-packaging/evidence
cat > "dev-docs/plans/plan-017-v1-trust-foundation/stage-008-desktop-packaging/evidence/measurements-${DATE}.md" <<EOF
# Empirical Measurements — Tauri Packaged Build

**Date:** ${DATE}
**Build:** $(git rev-parse HEAD)
**Hardware:** <fill in: model, RAM, macOS version>

| Metric              | Target   | Measured | Pass/Fail |
| ------------------- | -------- | -------- | --------- |
| Cold start (median) | ≤ 1.5 s  |          |           |
| Sidecar boot        | ≤ 800 ms |          |           |
| /api/db p50         | ≤ 5 ms   |          |           |
| Idle memory         | ≤ 250 MB |          |           |
| .dmg size           | ≤ 100 MB |          |           |

**Verdict:** PASS / FAIL with notes.
EOF
echo "Created evidence file."
```

Then open that file in your editor and fill in the **Hardware**
line plus the **Measured** + **Pass/Fail** columns from steps
1–6.

Evidence file written:
[measurements-2026-04-30.md](../../plans/plan-017-v1-trust-foundation/stage-008-desktop-packaging/evidence/measurements-2026-04-30.md)

- [x] Evidence file created
- [x] All 5 metrics filled in
- [x] Pass/Fail marked per row
- [x] Overall verdict written

---

### 8. Make the call

**Why this matters:** Plan-017's escape clause says we revert to
Electron if Tauri misses the targets. This is the moment that
decision gets confirmed (or reversed).

**Rule:**

- **0–1 metric failed:** PASS. Note the failure and a remediation
  plan in the verdict, then ship.
- **2+ metrics failed:** STOP. Open
  [packaging-decision-2026-04-29.md](../../plans/plan-017-v1-trust-foundation/stage-008-desktop-packaging/evidence/packaging-decision-2026-04-29.md)
  and follow the escape clause (start an Electron spike).

**Why two failures, not one?** A single missed target is usually
fixable (e.g. trimming the bundle, lazy-loading a heavy import).
Two suggest a structural mismatch and shouldn't be papered over.

**Decision: PASS — 5/5 metrics within target with substantial
headroom on every axis. No remediation required; Tauri stays.**

- [x] Decision recorded (PASS or FAIL+plan)

---

## Done

When the evidence file is saved, all metrics filled in, and the
verdict is written, Task 05 is complete. Move on to
[Task 06 — Smoke Test the Installer](../task-06-smoke-test-installer/task.md).
