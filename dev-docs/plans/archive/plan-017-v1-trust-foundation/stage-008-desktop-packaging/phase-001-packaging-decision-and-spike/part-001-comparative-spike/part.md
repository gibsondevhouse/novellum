---
title: Comparative Spike
slug: part-001-comparative-spike
part_number: 1
status: complete
owner: architect
assigned_to: architect
phase: phase-001-packaging-decision-and-spike
started_at: 2026-04-29
completed_at: 2026-04-30
estimated_duration: 1d
---

## Objective

Run two throwaway packaging spikes — Tauri-with-Node-sidecar and
Electron-with-embedded-Node — and capture comparable measurements for
the decision doc.

## Files

**Create:**

- `dev-docs/plans/plan-017-v1-trust-foundation/stage-008-desktop-packaging/evidence/spike-tauri.md`
- `dev-docs/plans/plan-017-v1-trust-foundation/stage-008-desktop-packaging/evidence/spike-electron.md`

## Acceptance Criteria

- [ ] Tauri spike: `cargo` toolchain installed, `tauri init`, the
      SvelteKit dev server loads inside the WebView, `better-sqlite3`
      is reachable via Node sidecar. Capture: cold-start time,
      release binary size on macOS Apple Silicon, sidecar latency
      for a representative DB write.
- [ ] Electron spike: `electron` + `electron-builder`, the
      SvelteKit Node adapter runs in a child process, `better-sqlite3`
      loads from the bundled `node_modules`. Capture the same three
      measurements.
- [ ] Both spikes captured under `evidence/` with reproducible
      commands and dated results.
- [ ] Spikes are *throwaway*: code is not merged into `src/`.

## Notes

- This part requires installing system toolchains (Rust for Tauri,
  Xcode CLT for macOS notarization probes). Surface any blockers in
  the decision doc rather than working around them silently.
