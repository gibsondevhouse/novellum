# Task 05 — Education

## Why these specific metrics

The five chosen metrics map to user-perceptible behaviours and
distribution friction:

- **Cold start.** Below 1.5 s, users perceive the app as
  "instant". Above 3 s, they assume it's broken or hung. The 1.5 s
  target matches Obsidian (~1.2 s on M-series) and Notion (~1.8 s).
- **Sidecar boot.** This is hidden inside cold start. If the
  sidecar takes 2 s to be ready, the WebView shows a blank page or
  a connection-refused error first — bad first impression. 800 ms
  is the empirical ceiling where the Tauri splash hides it
  comfortably.
- **`/api/db` p50.** Every editor save, every outline drag, every
  bible lookup hits this. At 5 ms, batches of 100 ops feel instant.
  At 20 ms they feel sluggish.
- **Idle memory.** Authors keep the app open for hours. A 250 MB
  ceiling on a fresh launch leaves headroom for the manuscript +
  caches; 500+ MB is the "this is bloated" perception threshold.
- **Binary size.** Discord is 130 MB and people complain. Notion
  is 100 MB. Obsidian is 80 MB. Sub-100 MB is the table-stakes
  ceiling for a productivity app in 2026.

## Why measure now and not earlier

Earlier "measurements" would be in dev mode (`tauri dev`), which:

- Uses Vite (faster startup) instead of the Node sidecar (slower).
- Builds Cargo in debug mode (slower) instead of release (faster).
- Does not include the bundled Node binary's startup cost.

Numbers from `tauri dev` would be wrong in both directions and
would not validate the V1 ship decision.

## How to interpret a partial fail

The decision doc's escape clause is "miss 2+ targets badly →
consider Electron." Interpret "badly" as:

- Cold start > 3 s (2× the target) → fail
- Cold start 1.5–3 s → marginal, optimise but ship
- Idle memory > 500 MB (2× target) → fail
- /api/db p50 > 20 ms (4× target) → fail; better-sqlite3 should be
  sub-millisecond on local disk

Marginal misses are usually fixable in code. Bad misses suggest
fundamental architectural issues (Tauri's WebView, the sidecar
indirection, etc.) and warrant the escape clause.

## A note on benchmarking variance

Cold-start time varies by ±200 ms across runs depending on disk
cache state, OS scheduling, and other apps running. Always:

- Take the **median of 5 runs**, not the first run.
- Quit any heavy apps (Slack, Chrome with 50 tabs) first.
- Don't measure with the dev tools open — DevTools attachment adds
  startup latency.
- Note machine spec; an M3 Pro vs an M1 Air is a 2× difference.
