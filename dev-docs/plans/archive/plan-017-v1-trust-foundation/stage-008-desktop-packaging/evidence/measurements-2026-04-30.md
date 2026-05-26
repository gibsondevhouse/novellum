# Empirical Measurements — Tauri Packaged Build

**Date:** 2026-04-30
**Build:** d1b5ef0c4fc7f15ce0c36f7a4f12671064ee499c
**Hardware:** Apple M4 MacBook Air, 16 GB unified memory, macOS 26.3.1

## Methodology

- Cold start: 5 stopwatch samples, launched from Finder. Median taken.
- Sidecar boot: `eprintln!` line in `Sidecar::spawn` printed to stderr
  on first successful TCP probe of the ephemeral port. App launched
  from terminal so stderr was captured directly.
- /api/db p50/p95: 100 sequential `fetch('/api/db/projects')` calls
  from the packaged-app DevTools console (async IIFE, sorted, indexed
  at 50 and 95).
- Idle memory: Activity Monitor → Memory tab, T+2 minutes after
  Finder launch with no user interaction. Resident memory column.
  Rust + WebKit helpers (`Novellum`, `Novellum Graphics and Media`,
  `Novellum Networking`, `http://127.0.0.1:<port>` WebContent process)
  summed; `node` sidecar counted separately.
- Bundle size: `du -sh` against built `.app` and `.dmg` artifacts.

## Results

| Metric              | Target   | Measured                                       | Pass/Fail |
| ------------------- | -------- | ---------------------------------------------- | --------- |
| Cold start (median) | ≤ 1.5 s  | 1.11 s (samples: 1.21, 1.11, 1.06, 1.11, 1.11) | PASS      |
| Sidecar boot        | ≤ 800 ms | 108 ms                                         | PASS      |
| /api/db p50         | ≤ 5 ms   | 1.00 ms (p95: 2.00 ms)                         | PASS      |
| Idle memory         | ≤ 250 MB | 123.1 MB (Rust+WebKit 96.3 + node 26.8)        | PASS      |
| .dmg size           | ≤ 100 MB | 45 MB (.app: 145 MB)                           | PASS      |

## Verdict

**PASS — 5/5 metrics within target, with substantial headroom on every
axis.**

Headroom summary:

- Cold start: **0.39 s under target** (~26% margin).
- Sidecar boot: **692 ms under target** (~86% margin).
- /api/db p50: **4 ms under target** (~80% margin).
- Idle memory: **126.9 MB under target** (~51% margin).
- .dmg size: **55 MB under target** (~55% margin).

No remediation required. Plan-017's Electron escape clause is not
triggered. Ship.

## Notes

- The Tauri default macOS menu (`Menu::default(handle)`) is preserved
  with a custom "Toggle Developer Tools" item appended to the View
  submenu (`Cmd+Option+I`). DevTools is enabled via the `devtools`
  Cargo feature.
- The `tauri-plugin-log` is only registered in debug builds, so
  release-build sidecar logging uses `eprintln!` to bypass the missing
  logger. Boot timestamp prints reliably to inherited stderr.
- better-sqlite3 native binary is rebuilt at packaging time
  (`scripts/prepare-sidecar-deps.mjs`) against the bundled Node
  22.11.0 ABI (NODE_MODULE_VERSION 127) via prebuild-install.
- WebKit content process appears in Activity Monitor as
  `http://127.0.0.1:<port>` because macOS labels WebView content
  helpers by their loaded URL — that is *not* the Node sidecar.
